import { describe, expect, it } from "vitest";
import { VirtualClock } from "../../app/engine/clock.js";
import {
  CYCLE_COUNT,
  CycleSequencer,
  CycleSequencerError,
  VIRTUAL_SECONDS_PER_CYCLE,
  cycleEndVirtual,
  cycleStartVirtual,
  formatClockLabel,
  phaseOfCycle,
} from "../../app/engine/cycle-sequencer.js";
import { FreezeMachine } from "../../app/engine/freeze-machine.js";
import type { CycleIndex } from "../../app/engine/primitives.js";

describe("cycle boundary arithmetic", () => {
  it("cycleStartVirtual(1) is 0", () => {
    expect(cycleStartVirtual(1)).toBe(0);
  });

  it("cycleStartVirtual(index) = (index-1) * 1200 (SPEC/04 §6)", () => {
    expect(cycleStartVirtual(11)).toBe(10 * VIRTUAL_SECONDS_PER_CYCLE);
    expect(cycleStartVirtual(20)).toBe(19 * VIRTUAL_SECONDS_PER_CYCLE);
  });

  it("cycleEndVirtual(index) = index * 1200", () => {
    expect(cycleEndVirtual(1)).toBe(VIRTUAL_SECONDS_PER_CYCLE);
    expect(cycleEndVirtual(20)).toBe(CYCLE_COUNT * VIRTUAL_SECONDS_PER_CYCLE);
  });

  it("cycleEndVirtual(n) === cycleStartVirtual(n+1) for every adjacent pair", () => {
    for (let i = 1; i < 20; i++) {
      const n = i as CycleIndex;
      const next = (i + 1) as CycleIndex;
      expect(cycleEndVirtual(n)).toBe(cycleStartVirtual(next));
    }
  });
});

describe("phaseOfCycle (SPEC/03 §2.3)", () => {
  it("cycles 1-10 are phase A", () => {
    for (let i = 1; i <= 10; i++) expect(phaseOfCycle(i as CycleIndex)).toBe("A");
  });
  it("cycles 11-20 are phase B", () => {
    for (let i = 11; i <= 20; i++) expect(phaseOfCycle(i as CycleIndex)).toBe("B");
  });
});

describe("formatClockLabel", () => {
  it("renders the start time with zero elapsed", () => {
    expect(formatClockLabel("13:20", 0 as never)).toBe("13:20");
  });

  it("adds elapsed virtual seconds, rounding down to the minute", () => {
    expect(formatClockLabel("13:20", 1200 as never)).toBe("13:40");
  });

  it("wraps past midnight", () => {
    expect(formatClockLabel("23:50", 1200 as never)).toBe("00:10");
  });

  it("rejects a malformed start time", () => {
    expect(() => formatClockLabel("1pm", 0 as never)).toThrow(RangeError);
  });
});

describe("CycleSequencer", () => {
  function make() {
    const clock = new VirtualClock();
    const freeze = new FreezeMachine("RUNNING");
    return { clock, freeze, seq: new CycleSequencer(clock, freeze) };
  }

  it("starts at cycle 1, phase A", () => {
    const { seq } = make();
    expect(seq.currentCycle()).toBe(1);
    expect(seq.currentPhase()).toBe("A");
  });

  it("endCycle() jumps the clock to the boundary and advances to the next cycle", () => {
    const { clock, seq } = make();
    seq.endCycle();
    expect(clock.now()).toBe(VIRTUAL_SECONDS_PER_CYCLE);
    expect(seq.currentCycle()).toBe(2);
  });

  it("endCycle() requires the freeze machine to be RUNNING", () => {
    const clock = new VirtualClock();
    const freeze = new FreezeMachine("FREEZING");
    const seq = new CycleSequencer(clock, freeze);
    expect(() => seq.endCycle()).toThrow(CycleSequencerError);
  });

  it("cycle 10's end enters HINGE_PAUSE rather than advancing directly to cycle 11", () => {
    const { clock, freeze, seq } = make();
    for (let i = 0; i < 9; i++) seq.endCycle(); // cycles 1..9 end -> now at cycle 10
    expect(seq.currentCycle()).toBe(10);
    seq.endCycle(); // cycle 10 ends
    expect(freeze.current()).toBe("HINGE_PAUSE");
    expect(seq.currentCycle()).toBe(10); // not yet advanced
    expect(clock.now()).toBe(cycleEndVirtual(10));
  });

  it("dismissHinge() requires HINGE_PAUSE", () => {
    const { seq } = make();
    expect(() => seq.dismissHinge()).toThrow(CycleSequencerError);
  });

  it("dismissHinge() advances into cycle 11 and returns the machine to RUNNING", () => {
    const { freeze, seq } = make();
    for (let i = 0; i < 10; i++) seq.endCycle(); // through cycle 10 -> HINGE_PAUSE
    seq.dismissHinge();
    expect(freeze.current()).toBe("RUNNING");
    expect(seq.currentCycle()).toBe(11);
    expect(seq.currentPhase()).toBe("B");
  });

  it("cycle 20's end enters DEBRIEF_HANDOFF and does not advance further", () => {
    const { clock, freeze, seq } = make();
    for (let i = 0; i < 10; i++) seq.endCycle(); // 1..10
    seq.dismissHinge(); // -> 11
    for (let i = 0; i < 9; i++) seq.endCycle(); // 11..19 end -> at 20
    expect(seq.currentCycle()).toBe(20);
    seq.endCycle(); // cycle 20 ends
    expect(freeze.current()).toBe("DEBRIEF_HANDOFF");
    expect(clock.now()).toBe(cycleEndVirtual(20));
  });

  it("is a pure function of the call sequence", () => {
    const run = () => {
      const { seq, clock } = make();
      for (let i = 0; i < 10; i++) seq.endCycle();
      seq.dismissHinge();
      seq.endCycle();
      return { cycle: seq.currentCycle(), t: clock.now() };
    };
    expect(run()).toEqual(run());
  });
});
