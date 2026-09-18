/**
 * The append-only session log — SPEC/04_Data_Model.md §10, invariant I5
 * (SPEC/00_README.md §3):
 *
 * "Every record is durably persisted before the UI acknowledges the action
 * that produced it. `seq` is gapless; a gap is a detected data-loss event
 * and is reported, never silently tolerated."
 *
 * Full `RecordKind` and per-kind `detail` shapes are enumerated in
 * SPEC/07_Telemetry_and_Logging.md §2 and belong to M4 (telemetry). This
 * module only builds the low-level append primitive M1 needs: assigning a
 * gapless `seq`, awaiting durable persistence before returning, and never
 * silently skipping a `seq` on a failed write. `kind` is typed as `string`
 * here and will be narrowed to the M4 `RecordKind` union without changing
 * this module's shape.
 */

import { asSeq, type ConditionId, type Seq, type VirtualTime } from "../engine/primitives.js";

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
