/**
 * SPEC/10_Build_Plan_and_Acceptance.md, M4: "`test/telemetry/derived.spec`
 * computes every measure in `07` §4 from a golden log — a measure that
 * cannot be computed from a real pilot log is a missing record and fails
 * the build."
 *
 * Builds a small, hand-composed "golden log" exercising the specific
 * record sequences each SPEC/07 §4 row names, then computes every
 * derived measure from it and checks the result against a hand-computed
 * expectation — proving both that the records needed exist (coverage.spec
 * already proves each kind CAN be emitted) and that the formula over them
 * is actually correct.
 */

import { describe, expect, it } from "vitest";
import { asVirtualTime } from "../../app/engine/primitives.js";
import { InMemoryLogSink, SessionLog, type LogHeader, type LogRecord } from "../../app/telemetry/log.js";
import { appendTelemetryEvent } from "../../app/telemetry/emit.js";
import type { TelemetryEvent } from "../../app/telemetry/record-kinds.js";
import {
  abandonmentRate,
  channelAttention,
  confidenceReversalCount,
  doubtActionCoherence,
  drawerOpenFraction,
  dwellPerElement,
  fatigueTrajectory,
  judgementLatencies,
  reformulationChainLength,
  reportReadThrough,
  revisionRate,
  sourceSelectionTracking,
  tier4Discovery,
  timeToFirstInformationSeekingActMs,
} from "../../app/telemetry/derived-measures.js";

const HEADER: LogHeader = {
  formatVersion: "0.1.0", sessionId: "derived-test", participantCode: "p", condition: "directed", scenarioId: "s",
  scenarioVersion: "0.1.0", seed: "1", bundleHash: "b", appVersion: "0.1.0", startedAtIso: "2026-01-01T00:00:00.000Z",
  userAgent: "vitest", viewport: { w: 1280, h: 800, dpr: 1 }, counterbalance: { expectationOrder: "A" }, cell: "radio", echelon: "command",
};

async function buildLog(events: readonly (readonly [number, TelemetryEvent])[]): Promise<readonly LogRecord[]> {
  const log = new SessionLog(HEADER, new InMemoryLogSink());
  for (const [tWallOffsetMs, event] of events) {
    await appendTelemetryEvent(log, asVirtualTime(0), tWallOffsetMs, event);
  }
  return log.readAll();
}

describe("judgementLatencies — envelope_revealed.t -> containment_judgement_submitted.t", () => {
  it("computes the exact millisecond gap", async () => {
    const records = await buildLog([
      [1000, { kind: "envelope_revealed", detail: { cycle: 1, envelopeId: "e1" } }],
      [8500, { kind: "containment_judgement_submitted", detail: { probeId: "p1", judgement: "holds", confidence: 70 } }],
    ]);
    expect(judgementLatencies(records)).toEqual([{ probeId: "p1", latencyMs: 7500 }]);
  });
});

describe("timeToFirstInformationSeekingActMs — first drawer_opened|radio_request_submitted|query_submitted - cycle_start", () => {
  it("picks the earliest of the three kinds, not just the first record", async () => {
    const records = await buildLog([
      [0, { kind: "cycle_start", detail: { cycle: 1, phase: "A", clockLabel: "13:20" } }],
      [9000, { kind: "query_submitted", detail: { text: "x", charCount: 1, compositionDurationMs: 100, queryId: "q1", reformulationChainIndex: 0 } }],
      [5000, { kind: "drawer_opened", detail: { drawer: "haku", cycle: 1, latencyFromCycleStartMs: 5000, openingRoute: "button" } }],
    ]);
    expect(timeToFirstInformationSeekingActMs(records)).toBe(5000);
  });

  it("returns null when no information-seeking act occurred", async () => {
    const records = await buildLog([[0, { kind: "cycle_start", detail: { cycle: 1, phase: "A", clockLabel: "13:20" } }]]);
    expect(timeToFirstInformationSeekingActMs(records)).toBeNull();
  });
});

describe("dwellPerElement — paired element_enter/element_leave", () => {
  it("pairs enter/leave for the same target and computes the gap", async () => {
    const records = await buildLog([
      [1000, { kind: "element_enter", detail: { targetKind: "rail_item", targetId: "atom.1" } }],
      [4200, { kind: "element_leave", detail: { targetKind: "rail_item", targetId: "atom.1" } }],
    ]);
    expect(dwellPerElement(records)).toEqual([{ targetKind: "rail_item", targetId: "atom.1", dwellMs: 3200 }]);
  });

  it("omits an unmatched enter (no closing leave)", async () => {
    const records = await buildLog([[1000, { kind: "element_enter", detail: { targetKind: "rail_item", targetId: "atom.1" } }]]);
    expect(dwellPerElement(records)).toEqual([]);
  });

  it("distinguishes different targets sharing the same targetKind", async () => {
    const records = await buildLog([
      [0, { kind: "element_enter", detail: { targetKind: "unit", targetId: "EK11" } }],
      [0, { kind: "element_enter", detail: { targetKind: "unit", targetId: "EK12" } }],
      [1000, { kind: "element_leave", detail: { targetKind: "unit", targetId: "EK11" } }],
      [2000, { kind: "element_leave", detail: { targetKind: "unit", targetId: "EK12" } }],
    ]);
    const dwells = dwellPerElement(records);
    expect(dwells.find((d) => d.targetId === "EK11")?.dwellMs).toBe(1000);
    expect(dwells.find((d) => d.targetId === "EK12")?.dwellMs).toBe(2000);
  });
});

describe("reportReadThrough — max text_scrolled.maxFraction per element", () => {
  it("keeps the maximum fraction across repeated scroll events for the same element", async () => {
    const records = await buildLog([
      [0, { kind: "text_scrolled", detail: { elementId: "report.1", maxScrollFraction: 0.4 } }],
      [1000, { kind: "text_scrolled", detail: { elementId: "report.1", maxScrollFraction: 0.9 } }],
      [2000, { kind: "text_scrolled", detail: { elementId: "report.1", maxScrollFraction: 0.6 } }],
    ]);
    expect(reportReadThrough(records).get("report.1")).toBe(0.9);
  });
});

describe("reformulationChainLength — highest chain index + 1", () => {
  it("counts the number of reformulations in a query chain", async () => {
    const records = await buildLog([
      [0, { kind: "query_submitted", detail: { text: "a", charCount: 1, compositionDurationMs: 1, queryId: "q1", reformulationChainIndex: 0 } }],
      [1000, { kind: "query_submitted", detail: { text: "b", charCount: 1, compositionDurationMs: 1, queryId: "q2", reformulationChainIndex: 1 } }],
      [2000, { kind: "query_submitted", detail: { text: "c", charCount: 1, compositionDurationMs: 1, queryId: "q3", reformulationChainIndex: 2 } }],
    ]);
    expect(reformulationChainLength(records)).toBe(3);
  });
});

describe("abandonmentRate — query_cleared / (query_cleared + query_submitted)", () => {
  it("computes the exact rate", async () => {
    const records = await buildLog([
      [0, { kind: "query_submitted", detail: { text: "a", charCount: 1, compositionDurationMs: 1, queryId: "q1", reformulationChainIndex: 0 } }],
      [1000, { kind: "query_cleared", detail: { text: "b" } }],
      [2000, { kind: "query_cleared", detail: { text: "c" } }],
    ]);
    expect(abandonmentRate(records)).toBeCloseTo(2 / 3);
  });

  it("is zero with no query activity at all", async () => {
    expect(abandonmentRate([])).toBe(0);
  });
});

describe("confidenceReversalCount — direction changes within a slider run", () => {
  it("counts up-down-up as two reversals", async () => {
    const records = await buildLog([
      [0, { kind: "confidence_slider_moved", detail: { probeId: "p1", value: 10, settle: false } }],
      [100, { kind: "confidence_slider_moved", detail: { probeId: "p1", value: 40, settle: false } }], // up
      [200, { kind: "confidence_slider_moved", detail: { probeId: "p1", value: 20, settle: false } }], // down: reversal 1
      [300, { kind: "confidence_slider_moved", detail: { probeId: "p1", value: 60, settle: true } }], // up: reversal 2
    ]);
    expect(confidenceReversalCount(records, "p1")).toBe(2);
  });

  it("a monotonic slide has zero reversals", async () => {
    const records = await buildLog([
      [0, { kind: "confidence_slider_moved", detail: { probeId: "p1", value: 10, settle: false } }],
      [100, { kind: "confidence_slider_moved", detail: { probeId: "p1", value: 40, settle: false } }],
      [200, { kind: "confidence_slider_moved", detail: { probeId: "p1", value: 70, settle: true } }],
    ]);
    expect(confidenceReversalCount(records, "p1")).toBe(0);
  });
});

describe("drawerOpenFraction — drawer-open time / working period", () => {
  it("computes the exact fraction", async () => {
    const records = await buildLog([
      [0, { kind: "cycle_start", detail: { cycle: 1, phase: "A", clockLabel: "13:20" } }],
      [1000, { kind: "drawer_opened", detail: { drawer: "haku", cycle: 1, latencyFromCycleStartMs: 1000, openingRoute: "button" } }],
      [3000, { kind: "drawer_closed", detail: { drawer: "haku", dwellMs: 2000, closingRoute: "escape" } }],
      [10000, { kind: "cycle_end", detail: { cycle: 1, totalRealDurationMs: 10000 } }],
    ]);
    expect(drawerOpenFraction(records)).toBeCloseTo(0.2); // 2000ms open / 10000ms working period
  });
});

describe("channelAttention — element_enter on channel_signal targets, and whether any was opened", () => {
  it("reports anySignalOpened=false when nothing was ever entered", () => {
    expect(channelAttention([]).anySignalOpened).toBe(false);
  });

  it("reports anySignalOpened=true and the dwell when a channel signal was entered/left", async () => {
    const records = await buildLog([
      [0, { kind: "element_enter", detail: { targetKind: "channel_signal", targetId: "sig.1" } }],
      [2500, { kind: "element_leave", detail: { targetKind: "channel_signal", targetId: "sig.1" } }],
    ]);
    const attention = channelAttention(records);
    expect(attention.anySignalOpened).toBe(true);
    expect(attention.dwells).toEqual([{ targetKind: "channel_signal", targetId: "sig.1", dwellMs: 2500 }]);
  });
});

describe("sourceSelectionTracking — radio addressee against authored SourceClass.reliability", () => {
  it("looks up each addressee's authored reliability", async () => {
    const records = await buildLog([
      [0, { kind: "radio_request_submitted", detail: { addressee: "EK11", text: "x", compositionDurationMs: 1 } }],
      [1000, { kind: "radio_request_submitted", detail: { addressee: "VPK", text: "y", compositionDurationMs: 1 } }],
    ]);
    const reliability = new Map<string, "known-good" | "unproven" | "degraded">([["EK11", "known-good"], ["VPK", "unproven"]]);
    expect(sourceSelectionTracking(records, reliability)).toEqual([
      { addressee: "EK11", reliability: "known-good" },
      { addressee: "VPK", reliability: "unproven" },
    ]);
  });

  it("marks an addressee with no authored source class as unknown_source rather than throwing", async () => {
    const records = await buildLog([[0, { kind: "radio_request_submitted", detail: { addressee: "MYSTERY", text: "x", compositionDurationMs: 1 } }]]);
    expect(sourceSelectionTracking(records, new Map())[0]!.reliability).toBe("unknown_source");
  });
});

describe("tier4Discovery — traffic_returned | unit_reply_delivered | result_item_expanded against authored ids (SPEC/07 §2.7)", () => {
  it("finds the earliest route by which each load-bearing item was reached", async () => {
    const records = await buildLog([
      [0, { kind: "traffic_returned", detail: { requestId: "r1", selector: {}, entryIds: ["t4.ember_warning"] } }],
      [1000, { kind: "unit_reply_delivered", detail: { requestId: "r2", addressee: "VPK", atomIds: ["t4.water_state"], authoredLatencySeconds: 20 } }],
    ]);
    const discovery = tier4Discovery(records, ["t4.ember_warning", "t4.private_doubt", "t4.water_state"]);
    expect(discovery.find((d) => d.atomId === "t4.ember_warning")).toMatchObject({ reached: true, route: "traffic_returned" });
    expect(discovery.find((d) => d.atomId === "t4.water_state")).toMatchObject({ reached: true, route: "unit_reply_delivered" });
    expect(discovery.find((d) => d.atomId === "t4.private_doubt")).toMatchObject({ reached: false, route: null });
  });
});

describe("doubtActionCoherence — judgement + allocation + the authored viability table", () => {
  const allocation: TelemetryEvent = { kind: "allocation_submitted", detail: { assignments: { EK11: { sectorId: "L1", taskId: "task.x" } }, rationaleFi: "x" } };

  it("no_rejection when the judgement was holds", async () => {
    const records = await buildLog([
      [0, { kind: "containment_judgement_submitted", detail: { probeId: "p1", judgement: "holds", confidence: 80 } }],
      [1000, allocation],
    ]);
    expect(doubtActionCoherence(records, () => true, () => true)).toBe("no_rejection");
  });

  it("consistent_with_correction when the participant's doubt changed the decision", async () => {
    const records = await buildLog([
      [0, { kind: "containment_judgement_submitted", detail: { probeId: "p1", judgement: "fundamentally_wrong", confidence: 60 } }],
      [1000, allocation],
    ]);
    expect(doubtActionCoherence(records, () => true, () => false)).toBe("consistent_with_correction");
  });

  it("consistent_with_envelope when doubt was expressed and not acted upon — the interesting failure", async () => {
    const records = await buildLog([
      [0, { kind: "containment_judgement_submitted", detail: { probeId: "p1", judgement: "fundamentally_wrong", confidence: 60 } }],
      [1000, allocation],
    ]);
    expect(doubtActionCoherence(records, () => false, () => true)).toBe("consistent_with_envelope");
  });

  it("consistent_with_neither when the allocation matches neither reference", async () => {
    const records = await buildLog([
      [0, { kind: "containment_judgement_submitted", detail: { probeId: "p1", judgement: "partly_wrong", confidence: 50 } }],
      [1000, allocation],
    ]);
    expect(doubtActionCoherence(records, () => false, () => false)).toBe("consistent_with_neither");
  });
});

describe("revisionRate — containment_judgement_revised / containment_judgement_submitted", () => {
  it("computes the exact rate", async () => {
    const records = await buildLog([
      [0, { kind: "containment_judgement_submitted", detail: { probeId: "p1", judgement: "holds", confidence: 70 } }],
      [1000, { kind: "containment_judgement_revised", detail: { probeId: "p1", judgement: "partly_wrong", confidence: 40 } }],
    ]);
    expect(revisionRate(records)).toBe(1);
  });
});

describe("fatigueTrajectory — per-cycle latencies and information-seeking counts against cycle index", () => {
  it("orders points by cycle and computes per-cycle values independently", async () => {
    const cycle1 = await buildLog([
      [0, { kind: "envelope_revealed", detail: { cycle: 1, envelopeId: "e1" } }],
      [3000, { kind: "containment_judgement_submitted", detail: { probeId: "p1", judgement: "holds", confidence: 70 } }],
      [500, { kind: "drawer_opened", detail: { drawer: "haku", cycle: 1, latencyFromCycleStartMs: 500, openingRoute: "button" } }],
    ]);
    const cycle2 = await buildLog([
      [0, { kind: "envelope_revealed", detail: { cycle: 2, envelopeId: "e2" } }],
      [9000, { kind: "containment_judgement_submitted", detail: { probeId: "p2", judgement: "holds", confidence: 60 } }],
    ]);
    const byCycle = new Map<number, readonly LogRecord[]>([[2, cycle2], [1, cycle1]]); // deliberately out of order
    const trajectory = fatigueTrajectory(byCycle);
    expect(trajectory.map((p) => p.cycle)).toEqual([1, 2]); // sorted
    expect(trajectory[0]!.judgementLatencyMs).toBe(3000);
    expect(trajectory[0]!.informationSeekingActCount).toBe(1);
    expect(trajectory[1]!.judgementLatencyMs).toBe(9000);
    expect(trajectory[1]!.informationSeekingActCount).toBe(0);
  });
});
