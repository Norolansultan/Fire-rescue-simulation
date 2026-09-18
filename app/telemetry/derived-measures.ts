/**
 * Derived measures — SPEC/07_Telemetry_and_Logging.md §4: "Listed here so
 * the raw records above can be checked for sufficiency. If a measure
 * below cannot be computed from §2, a record is missing."
 *
 * Every function here is pure: `(records) => measure`, computed only from
 * already-logged records, never stored back into the log (SPEC/07 §1: "A
 * derived value stored at runtime makes an analysis bug permanent").
 *
 * Measures whose formula needs scenario content in addition to the log
 * (source-selection tracking against `SourceClass.reliability`,
 * doubt-action coherence against the authored viability table, tier-4
 * discovery against the three named load-bearing atom ids, channel
 * attention's "whether any signal was opened") take that content as an
 * explicit second argument rather than reaching for a global — keeping
 * every function here a pure fold over its inputs.
 */

import type { LogRecord } from "./log.js";
import type {
  AllocationSubmittedDetail,
  ClickTargetKind,
  ConfidenceSliderMovedDetail,
  ContainmentJudgementSubmittedDetail,
  CycleEndDetail,
  CycleStartDetail,
  ElementEnterLeaveDetail,
  QuerySubmittedDetail,
  RecordKind,
  ResultItemDetail,
  TextScrolledDetail,
  TrafficReturnedDetail,
  UnitReplyDeliveredDetail,
} from "./record-kinds.js";

function byKind(records: readonly LogRecord[], kind: RecordKind): LogRecord[] {
  return records.filter((r) => r.kind === kind);
}

// ---------------------------------------------------------------------------
// Judgement latency: containment_judgement_submitted.t - envelope_revealed.t
// ---------------------------------------------------------------------------

export interface JudgementLatency {
  readonly probeId: string;
  readonly latencyMs: number;
}

export function judgementLatencies(records: readonly LogRecord[]): JudgementLatency[] {
  const envelopeRevealedAt = records.find((r) => r.kind === "envelope_revealed");
  if (!envelopeRevealedAt) return [];
  const zero = envelopeRevealedAt.tWallOffsetMs;
  return byKind(records, "containment_judgement_submitted").map((r) => {
    const detail = r.detail as ContainmentJudgementSubmittedDetail;
    return { probeId: detail.probeId, latencyMs: r.tWallOffsetMs - zero };
  });
}

// ---------------------------------------------------------------------------
// Time to first information-seeking act in a cycle: first
// drawer_opened | radio_request_submitted | query_submitted - cycle_start
// ---------------------------------------------------------------------------

const INFORMATION_SEEKING_KINDS: readonly RecordKind[] = ["drawer_opened", "radio_request_submitted", "query_submitted"];

export function timeToFirstInformationSeekingActMs(records: readonly LogRecord[]): number | null {
  const cycleStart = records.find((r) => r.kind === "cycle_start");
  if (!cycleStart) return null;
  const candidates = records.filter((r) => INFORMATION_SEEKING_KINDS.includes(r.kind as RecordKind) && r.seq > cycleStart.seq);
  if (candidates.length === 0) return null;
  const first = candidates.reduce((earliest, r) => (r.tWallOffsetMs < earliest.tWallOffsetMs ? r : earliest));
  return first.tWallOffsetMs - cycleStart.tWallOffsetMs;
}

// ---------------------------------------------------------------------------
// Dwell per element: paired element_enter / element_leave
// ---------------------------------------------------------------------------

export interface ElementDwell {
  readonly targetKind: ClickTargetKind;
  readonly targetId: string | null;
  readonly dwellMs: number;
}

/** Pairs each `element_enter` with the next `element_leave` for the same (targetKind, targetId). Unmatched enters (no closing leave logged) are omitted — an incomplete pair yields no dwell, not a guessed one. */
export function dwellPerElement(records: readonly LogRecord[]): ElementDwell[] {
  const dwells: ElementDwell[] = [];
  const openEnters = new Map<string, LogRecord[]>();
  const key = (d: ElementEnterLeaveDetail) => `${d.targetKind}::${d.targetId ?? ""}`;

  for (const record of records) {
    if (record.kind === "element_enter") {
      const detail = record.detail as ElementEnterLeaveDetail;
      const k = key(detail);
      const queue = openEnters.get(k) ?? [];
      queue.push(record);
      openEnters.set(k, queue);
    } else if (record.kind === "element_leave") {
      const detail = record.detail as ElementEnterLeaveDetail;
      const k = key(detail);
      const queue = openEnters.get(k);
      const enter = queue?.shift();
      if (enter) {
        dwells.push({ targetKind: detail.targetKind, targetId: detail.targetId, dwellMs: record.tWallOffsetMs - enter.tWallOffsetMs });
      }
    }
  }
  return dwells;
}

// ---------------------------------------------------------------------------
// Report read-through: text_scrolled.maxFraction per element
// ---------------------------------------------------------------------------

/** The maximum scroll fraction ever reached per element — the only evidence a long report was read to the end (SPEC/07 §2.3). Later (larger) fractions win; scroll fraction never decreases in meaning even if the raw event stream is unordered by element. */
export function reportReadThrough(records: readonly LogRecord[]): Map<string, number> {
  const maxByElement = new Map<string, number>();
  for (const record of byKind(records, "text_scrolled")) {
    const detail = record.detail as TextScrolledDetail;
    const current = maxByElement.get(detail.elementId) ?? 0;
    maxByElement.set(detail.elementId, Math.max(current, detail.maxScrollFraction));
  }
  return maxByElement;
}

// ---------------------------------------------------------------------------
// Reformulation chain length: query_submitted records sharing a cycle, by
// chain index — the count of reformulations is the highest chain index
// reached, per query id "family" sharing a chain.
// ---------------------------------------------------------------------------

export function reformulationChainLength(records: readonly LogRecord[]): number {
  const submitted = byKind(records, "query_submitted").map((r) => r.detail as QuerySubmittedDetail);
  if (submitted.length === 0) return 0;
  return Math.max(...submitted.map((d) => d.reformulationChainIndex)) + 1;
}

// ---------------------------------------------------------------------------
// Abandonment rate: query_cleared / (query_cleared + query_submitted)
// ---------------------------------------------------------------------------

export function abandonmentRate(records: readonly LogRecord[]): number {
  const cleared = byKind(records, "query_cleared").length;
  const submitted = byKind(records, "query_submitted").length;
  const total = cleared + submitted;
  return total === 0 ? 0 : cleared / total;
}

// ---------------------------------------------------------------------------
// Confidence reversal count: direction changes within a
// confidence_slider_moved run for one probe.
// ---------------------------------------------------------------------------

export function confidenceReversalCount(records: readonly LogRecord[], probeId: string): number {
  const moves = byKind(records, "confidence_slider_moved")
    .map((r) => r.detail as ConfidenceSliderMovedDetail)
    .filter((d) => d.probeId === probeId);
  let reversals = 0;
  let lastDirection: -1 | 0 | 1 = 0;
  for (let i = 1; i < moves.length; i++) {
    const delta = moves[i]!.value - moves[i - 1]!.value;
    const direction: -1 | 0 | 1 = delta > 0 ? 1 : delta < 0 ? -1 : 0;
    if (direction !== 0 && lastDirection !== 0 && direction !== lastDirection) {
      reversals += 1;
    }
    if (direction !== 0) lastDirection = direction;
  }
  return reversals;
}

// ---------------------------------------------------------------------------
// Drawer reliance: drawer-open fraction of the working period, per cycle.
// ---------------------------------------------------------------------------

export function drawerOpenFraction(records: readonly LogRecord[]): number {
  const cycleStart = records.find((r) => r.kind === "cycle_start");
  const cycleEnd = records.find((r) => r.kind === "cycle_end");
  if (!cycleStart || !cycleEnd) return 0;
  const cycleEndDetail = cycleEnd.detail as CycleEndDetail;
  const workingPeriodMs = cycleEndDetail.totalRealDurationMs;
  if (workingPeriodMs <= 0) return 0;

  let openMs = 0;
  let openedAt: number | null = null;
  for (const record of records) {
    if (record.seq < cycleStart.seq) continue;
    if (record.kind === "drawer_opened") {
      openedAt = record.tWallOffsetMs;
    } else if (record.kind === "drawer_closed" && openedAt !== null) {
      openMs += record.tWallOffsetMs - openedAt;
      openedAt = null;
    }
  }
  return Math.min(1, openMs / workingPeriodMs);
}

/** Cycles in which no drawer was opened at all (SPEC/07 §2.4: "derived in analysis, never at runtime"). */
export function cyclesWithNoDrawerOpened(records: readonly LogRecord[]): Set<number> {
  const cycles = new Set<number>();
  const opened = new Set<number>();
  for (const record of records) {
    if (record.kind === "cycle_start") {
      cycles.add((record.detail as CycleStartDetail).cycle as number);
    }
  }
  let currentCycle: number | null = null;
  for (const record of records) {
    if (record.kind === "cycle_start") {
      currentCycle = (record.detail as CycleStartDetail).cycle as number;
    } else if (record.kind === "drawer_opened" && currentCycle !== null) {
      opened.add(currentCycle);
    }
  }
  return new Set([...cycles].filter((c) => !opened.has(c)));
}

// ---------------------------------------------------------------------------
// Channel attention (substitutive): element_enter on channel_signal
// targets, dwell, and whether any signal was opened.
// ---------------------------------------------------------------------------

export interface ChannelAttention {
  readonly anySignalOpened: boolean;
  readonly dwells: readonly ElementDwell[];
}

export function channelAttention(records: readonly LogRecord[]): ChannelAttention {
  const dwells = dwellPerElement(records).filter((d) => d.targetKind === "channel_signal");
  return { anySignalOpened: dwells.length > 0, dwells };
}

// ---------------------------------------------------------------------------
// Source-selection tracking: radio_request_submitted.addressee against
// authored SourceClass.reliability.
// ---------------------------------------------------------------------------

export interface SourceSelectionEntry {
  readonly addressee: string;
  readonly reliability: "known-good" | "unproven" | "degraded" | "unknown_source";
}

export function sourceSelectionTracking(
  records: readonly LogRecord[],
  reliabilityByUnitId: ReadonlyMap<string, "known-good" | "unproven" | "degraded">,
): SourceSelectionEntry[] {
  return byKind(records, "radio_request_submitted").map((r) => {
    const detail = r.detail as { readonly addressee: string };
    return { addressee: detail.addressee, reliability: reliabilityByUnitId.get(detail.addressee) ?? "unknown_source" };
  });
}

// ---------------------------------------------------------------------------
// Tier-4 discovery (SPEC/07 §2.7): computed from traffic_returned,
// unit_reply_delivered and result_item_expanded against authored atom ids.
// No new record kind — this is purely a derived cross-reference.
// ---------------------------------------------------------------------------

export interface Tier4Discovery {
  readonly atomId: string;
  readonly reached: boolean;
  readonly route: "traffic_returned" | "unit_reply_delivered" | "result_item_expanded" | null;
  readonly atSeq: number | null;
}

export function tier4Discovery(records: readonly LogRecord[], loadBearingAtomIds: readonly string[]): Tier4Discovery[] {
  const discovered = new Map<string, { route: Tier4Discovery["route"]; atSeq: number }>();

  for (const r of byKind(records, "traffic_returned")) {
    for (const atomId of (r.detail as TrafficReturnedDetail).entryIds) {
      if (!discovered.has(atomId)) discovered.set(atomId, { route: "traffic_returned", atSeq: r.seq });
    }
  }
  for (const r of byKind(records, "unit_reply_delivered")) {
    for (const atomId of (r.detail as UnitReplyDeliveredDetail).atomIds) {
      if (!discovered.has(atomId)) discovered.set(atomId, { route: "unit_reply_delivered", atSeq: r.seq });
    }
  }
  for (const r of byKind(records, "result_item_expanded")) {
    const atomId = (r.detail as ResultItemDetail).atomId;
    if (!discovered.has(atomId)) discovered.set(atomId, { route: "result_item_expanded", atSeq: r.seq });
  }

  return loadBearingAtomIds.map((atomId) => {
    const hit = discovered.get(atomId);
    return { atomId, reached: hit !== undefined, route: hit?.route ?? null, atSeq: hit?.atSeq ?? null };
  });
}

// ---------------------------------------------------------------------------
// Doubt-action coherence: containment_judgement_submitted +
// allocation_submitted + the authored viability table.
// ---------------------------------------------------------------------------

export type DoubtActionCoherence = "consistent_with_correction" | "consistent_with_envelope" | "consistent_with_neither" | "no_rejection";

export function doubtActionCoherence(
  records: readonly LogRecord[],
  isAllocationConsistentWithCorrection: (allocation: AllocationSubmittedDetail) => boolean,
  isAllocationConsistentWithEnvelope: (allocation: AllocationSubmittedDetail) => boolean,
): DoubtActionCoherence {
  const judgement = records.find((r) => r.kind === "containment_judgement_submitted");
  const allocation = records.find((r) => r.kind === "allocation_submitted");
  if (!judgement || !allocation) return "no_rejection";
  const judgementDetail = judgement.detail as ContainmentJudgementSubmittedDetail;
  if (judgementDetail.judgement === "holds") return "no_rejection";

  const allocationDetail = allocation.detail as AllocationSubmittedDetail;
  if (isAllocationConsistentWithCorrection(allocationDetail)) return "consistent_with_correction";
  if (isAllocationConsistentWithEnvelope(allocationDetail)) return "consistent_with_envelope";
  return "consistent_with_neither";
}

// ---------------------------------------------------------------------------
// Revision rate: containment_judgement_revised / containment_judgement_submitted
// ---------------------------------------------------------------------------

export function revisionRate(records: readonly LogRecord[]): number {
  const submitted = byKind(records, "containment_judgement_submitted").length;
  const revised = byKind(records, "containment_judgement_revised").length;
  return submitted === 0 ? 0 : revised / submitted;
}

// ---------------------------------------------------------------------------
// Fatigue trajectory: per-cycle latencies and information-seeking counts
// against cycle index.
// ---------------------------------------------------------------------------

export interface FatigueTrajectoryPoint {
  readonly cycle: number;
  readonly judgementLatencyMs: number | null;
  readonly informationSeekingActCount: number;
}

export function fatigueTrajectory(recordsByCycle: ReadonlyMap<number, readonly LogRecord[]>): FatigueTrajectoryPoint[] {
  return [...recordsByCycle.entries()]
    .sort(([a], [b]) => a - b)
    .map(([cycle, records]) => {
      const latencies = judgementLatencies(records);
      const informationSeekingActCount = records.filter((r) => INFORMATION_SEEKING_KINDS.includes(r.kind as RecordKind)).length;
      return {
        cycle,
        judgementLatencyMs: latencies.length > 0 ? latencies[0]!.latencyMs : null,
        informationSeekingActCount,
      };
    });
}
