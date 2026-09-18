/**
 * Cycle boundary arithmetic and the cycle-to-cycle driver.
 *
 * Canonical constants: SPEC/04_Data_Model.md §2 (`ScenarioContract.cycleCount`
 * is the literal `20`, `virtualSecondsPerCycle` is the literal `1200`).
 * Boundary formula: SPEC/04 §6 `CycleSpec.startsAtVirtual = (index-1) * 1200`.
 * Phases: SPEC/03_Scenario_Master.md §2.3 (A = 1-10, hinge between 10 and 11, B = 11-20).
 *
 * Scope note: this module drives the governing 20-cycle model only. The
 * prologue (W1-W5) introduced in SPEC/04's 2026-09-17 amendment has no
 * defined placement on the virtual timeline — SPEC/17_Pre_Build_Review
 * §3 (S1) flags this explicitly as unresolved ("startsAtVirtual =
 * (index-1) x 1200 gives no time before cycle 1"). That gap is not guessed
 * at here; a `WarmupIndex` cycle is out of scope for this sequencer until
 * it is settled.
 */

import { FreezeMachine } from "./freeze-machine.js";
import { asVirtualTime, type CycleIndex, type Phase, type VirtualTime } from "./primitives.js";
import { VirtualClock } from "./clock.js";

export const VIRTUAL_SECONDS_PER_CYCLE = 1200; // twenty minutes, SPEC/04 §2
export const CYCLE_COUNT = 20; // literal, SPEC/04 §2

export function cycleStartVirtual(index: CycleIndex): VirtualTime {
  return asVirtualTime((index - 1) * VIRTUAL_SECONDS_PER_CYCLE);
}

export function cycleEndVirtual(index: CycleIndex): VirtualTime {
  return asVirtualTime(index * VIRTUAL_SECONDS_PER_CYCLE);
}

/** SPEC/03 §2.3: phase A is cycles 1-10, phase B is 11-20, hinge sits between them. */
export function phaseOfCycle(index: CycleIndex): Phase {
  return index <= 10 ? "A" : "B";
}

/**
 * Renders the on-screen clock label ("14:35") for a given amount of
 * elapsed virtual time, given the scenario's `startVirtualClock` ("HH:MM").
 * Pure function of its inputs — reads no wall clock (invariant I2).
 */
export function formatClockLabel(startVirtualClock: string, elapsed: VirtualTime): string {
  const match = /^(\d{2}):(\d{2})$/.exec(startVirtualClock);
  if (!match) {
    throw new RangeError(`startVirtualClock must be "HH:MM", got "${startVirtualClock}"`);
  }
  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const elapsedMinutes = Math.floor(elapsed / 60);
  const totalMinutes = ((startMinutes + elapsedMinutes) % 1440 + 1440) % 1440;
  const hh = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const mm = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export class CycleSequencerError extends Error {}

/**
 * Drives a {@link VirtualClock} and {@link FreezeMachine} together across
 * the twenty main cycles: jumping the clock at `cycle_end`, and routing
 * cycle 10's end through `HINGE_PAUSE` (SPEC/05 §4) before cycle 11 begins.
 */
export class CycleSequencer {
  private cycle: CycleIndex = 1;

  constructor(
    private readonly clock: VirtualClock,
    private readonly freeze: FreezeMachine,
  ) {}

  currentCycle(): CycleIndex {
    return this.cycle;
  }

  currentPhase(): Phase {
    return phaseOfCycle(this.cycle);
  }

  /**
   * `cycle_end` (SPEC/03 §2.2): jumps the virtual clock to the boundary and,
   * for cycle 10, enters `HINGE_PAUSE` instead of advancing directly — the
   * five-minute pause is dismissed explicitly via {@link dismissHinge}.
   * For cycle 20, enters `DEBRIEF_HANDOFF` and does not advance further.
   * Must be called with the freeze machine in `RUNNING` — cycle_end only
   * happens once every probe for the cycle has resolved back to RUNNING.
   */
  endCycle(): VirtualTime {
    if (this.freeze.current() !== "RUNNING") {
      throw new CycleSequencerError(
        `endCycle() requires the freeze machine to be RUNNING, was ${this.freeze.current()}`,
      );
    }
    // No halt/resume juggling here: RUNNING is never a clock-halted state
    // (SPEC/05 §4), so if the freeze machine reports RUNNING the clock is
    // already resumed by construction (see EngineRunLoop, which is the
    // sole place that syncs clock halt state to freeze state). If it is
    // not, that is a bug upstream and advanceTo() below will surface it.
    const boundary = cycleEndVirtual(this.cycle);
    this.clock.advanceTo(boundary);

    if (this.cycle === 10) {
      this.freeze.transition("hinge_reached");
      return this.clock.now();
    }
    if (this.cycle === CYCLE_COUNT) {
      this.freeze.transition("session_complete");
      return this.clock.now();
    }
    this.cycle = (this.cycle + 1) as CycleIndex;
    return this.clock.now();
  }

  /**
   * Dismisses `HINGE_PAUSE` (participant-dismissible early, SPEC/05 §4) and
   * advances into cycle 11.
   */
  dismissHinge(): void {
    if (this.freeze.current() !== "HINGE_PAUSE") {
      throw new CycleSequencerError(`dismissHinge() requires HINGE_PAUSE, was ${this.freeze.current()}`);
    }
    this.freeze.transition("hinge_dismissed");
    this.cycle = (this.cycle + 1) as CycleIndex;
  }
}
