/**
 * Session resume — SPEC/05_System_Architecture.md §9: "A session that is
 * interrupted... can be resumed from the last completed cycle boundary.
 * Resuming mid-cycle is not supported: the cycle is replayed from its
 * start, the interruption is logged as a fault span, and the analysis
 * may exclude that cycle." Also HANDOFF_Projection_Judgement_Loop.md §9:
 * "Resuming mid-judgement is not supported; do not try."
 *
 * `planResume` is a pure read of the log so far — no mutation, no
 * decision about *how* the app re-enters `RUNNING` (that is the run
 * loop's job, SPEC/05 §4's `RESUMING` state, already built in M1). Its
 * only job is: given what was durably persisted before the interruption,
 * which cycle must be replayed from its start.
 */

import { cycleStartVirtual } from "../engine/cycle-sequencer.js";
import type { CycleIndex } from "../engine/primitives.js";
import { appendTelemetryEvent } from "./emit.js";
import type { SessionLog, LogRecord } from "./log.js";
import type { CycleEndDetail, CycleStartDetail } from "./record-kinds.js";

export interface ResumePlan {
  /** The cycle to (re)start from. If the session ended cleanly at a boundary, this is the next cycle; SPEC/05 §9 gives no rule for resuming past the twentieth cycle boundary, so this is capped at 21 (meaning "nothing left to resume into") rather than guessed. */
  readonly resumeFromCycle: number;
  /** True when the interrupted cycle's `cycle_start` was logged without a matching `cycle_end` — the case SPEC/05 §9 says must replay from the cycle's start, never resume mid-cycle. */
  readonly cycleWasInterruptedMidway: boolean;
  readonly lastRecordSeq: number | null;
}

/**
 * Reads the durable log so far and determines what must happen on
 * resume. Walks every `cycle_start`/`cycle_end` pair in order (`seq`
 * order, which the log guarantees is append order, I5) rather than just
 * scanning from the end, so an out-of-order read from a sink that does
 * not preserve write order (defensive — `IndexedDbLogSink.readAll`
 * already sorts) cannot produce the wrong plan.
 */
export function planResume(records: readonly LogRecord[]): ResumePlan {
  const bySeq = records.slice().sort((a, b) => a.seq - b.seq);
  let lastCompletedCycle = 0;
  let openCycle: number | null = null;

  for (const record of bySeq) {
    if (record.kind === "cycle_start") {
      openCycle = (record.detail as CycleStartDetail).cycle as number;
    } else if (record.kind === "cycle_end") {
      lastCompletedCycle = (record.detail as CycleEndDetail).cycle as number;
      openCycle = null;
    }
  }

  const lastRecordSeq = bySeq.length > 0 ? bySeq[bySeq.length - 1]!.seq : null;

  if (openCycle !== null) {
    return { resumeFromCycle: openCycle, cycleWasInterruptedMidway: true, lastRecordSeq };
  }
  return { resumeFromCycle: lastCompletedCycle + 1, cycleWasInterruptedMidway: false, lastRecordSeq };
}

export interface ResumeOutcome {
  readonly plan: ResumePlan;
  readonly resumedRecord: LogRecord;
}

/**
 * Logs the resume event (`session_resumed`, SPEC/07 §2.1) reflecting the
 * plan computed from the log so far. Does not itself replay the cycle —
 * that is the caller's job, using `plan.resumeFromCycle` to know where to
 * restart the run loop.
 */
export async function resumeSession(log: SessionLog, resumeCount: number, intervalSinceInterruptionMs: number): Promise<ResumeOutcome> {
  const existing = await log.readAll();
  const plan = planResume(existing);
  // Edge case not addressed in prose by SPEC/05 §9 or SPEC/07: an
  // interruption cleanly after cycle 20's cycle_end (awaiting
  // DEBRIEF_HANDOFF) makes plan.resumeFromCycle = 21, which is not a
  // real CycleIndex — there is no cycle to replay. Clamped to 20 rather
  // than left to throw, since `session_resumed.cycleReplayed` is a
  // required field with no "not applicable" value in the record shape;
  // `plan.resumeFromCycle` (unclamped) remains available to the caller
  // for this exact case.
  const cycleReplayed = Math.min(plan.resumeFromCycle, 20) as CycleIndex;
  const resumedRecord = await appendTelemetryEvent(log, cycleStartVirtual(cycleReplayed), 0, {
    kind: "session_resumed",
    detail: { resumeCount, intervalSinceInterruptionMs, cycleReplayed },
  });
  return { plan, resumedRecord };
}
