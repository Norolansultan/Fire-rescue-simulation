/**
 * The append-only session log — SPEC/04_Data_Model.md §10, invariant I5
 * (SPEC/00_README.md §3):
 *
 * "Every record is durably persisted before the UI acknowledges the action
 * that produced it. `seq` is gapless; a gap is a detected data-loss event
 * and is reported, never silently tolerated."
 *
 * `kind` stays typed as `string` at this layer rather than narrowed to
 * the real `RecordKind` union (`record-kinds.ts`, M4). Two independent
 * callers need this primitive: the real telemetry system (typed kinds,
 * see `emit.ts`'s `appendTelemetryEvent`, which is the actual type-safe
 * entry point production code should use) and `test/golden/`'s M1
 * determinism harness, which deliberately logs synthetic engine-internal
 * events (`rng_draw_u64`, `clock_advanced`) that are not, and were never
 * meant to be, real telemetry — those golden fixtures predate this file
 * and narrowing `kind` here would break them for no correctness gain.
 */

import { asSeq, type Seq, type VirtualTime } from "../engine/primitives.js";
import type { Cell, ConditionId, Echelon } from "../scenario/types.js";

export interface LogHeader {
  readonly formatVersion: string;
  readonly sessionId: string;
  readonly participantCode: string;
  readonly condition: ConditionId;
  readonly scenarioId: string;
  readonly scenarioVersion: string;
  readonly seed: string; // bigint as decimal string
  readonly bundleHash: string;
  readonly appVersion: string;
  readonly startedAtIso: string; // wall clock, annotation only
  readonly userAgent: string;
  readonly viewport: { readonly w: number; readonly h: number; readonly dpr: number };
  readonly counterbalance: { readonly expectationOrder: "A" | "B" };
  /**
   * SPEC/04 §11 amendment + revision (d): the amendment first added
   * `guidanceMode` and `echelon`; revision (d) replaced `guidanceMode`
   * with `cell` ("`SessionConfig.cell`; replaces `guidanceMode`"), and
   * SPEC/07 §2 revision (d) says the log header follows suit ("Log header
   * records `cell` instead of `guidanceMode`"). `guidanceMode` itself is
   * therefore never recorded — only its final reconciled replacement.
   */
  readonly cell: Cell;
  readonly echelon: Echelon;
}

export interface LogRecord {
  readonly seq: Seq; // gapless from 0
  readonly tVirtual: VirtualTime;
  readonly tWallOffsetMs: number; // annotation only; never read by logic
  readonly kind: string;
  readonly detail: unknown;
}

/** Durable persistence backend. Implementations must not resolve before the write is durable (I5). */
export interface LogSink {
  append(record: LogRecord): Promise<void>;
  readAll(): Promise<readonly LogRecord[]>;
}

/** Not durable — for pure-logic tests only. A real session must use a durable sink (IndexedDB in the browser, file/db in Node tooling). */
export class InMemoryLogSink implements LogSink {
  private readonly records: LogRecord[] = [];

  async append(record: LogRecord): Promise<void> {
    this.records.push(record);
  }

  async readAll(): Promise<readonly LogRecord[]> {
    return this.records.slice();
  }
}

export class GapDetectedError extends Error {
  constructor(
    readonly expectedSeq: number,
    readonly actualSeq: number,
  ) {
    super(`Gap detected in session log: expected seq ${expectedSeq}, found ${actualSeq}`);
    this.name = "GapDetectedError";
  }
}

/**
 * Verifies `records` form a gapless sequence 0..n-1 with no duplicates and
 * no reordering. Never tolerates a gap silently (I5) — throws
 * {@link GapDetectedError} instead of returning a boolean, so a caller
 * cannot accidentally ignore the result.
 */
export function assertGapless(records: readonly LogRecord[]): void {
  for (let i = 0; i < records.length; i++) {
    const actual = records[i]!.seq;
    if (actual !== i) {
      throw new GapDetectedError(i, actual);
    }
  }
}

export class SessionLog {
  private nextSeq = 0;

  constructor(
    readonly header: LogHeader,
    private readonly sink: LogSink,
  ) {}

  /**
   * Appends one record. The `seq` counter is only advanced after the sink
   * confirms durable persistence — if `sink.append` rejects, `seq` is left
   * unconsumed so a retry of the same logical event reuses it, and the
   * persisted log therefore never contains a gap even under a failing
   * storage backend. The caller (the run loop) is expected to react to a
   * rejection by pausing (`FAULT_PAUSED`, SPEC/05 §4) and retrying rather
   * than swallowing the error.
   */
  async append(tVirtual: VirtualTime, tWallOffsetMs: number, kind: string, detail: unknown): Promise<LogRecord> {
    const record: LogRecord = {
      seq: asSeq(this.nextSeq),
      tVirtual,
      tWallOffsetMs,
      kind,
      detail,
    };
    await this.sink.append(record); // durable before acknowledgement (I5)
    this.nextSeq += 1;
    return record;
  }

  currentSeq(): number {
    return this.nextSeq;
  }

  async readAll(): Promise<readonly LogRecord[]> {
    return this.sink.readAll();
  }
}
