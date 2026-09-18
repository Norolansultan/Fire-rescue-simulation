/**
 * A scripted session that emits every single `RecordKind` at least once —
 * SPEC/10_Build_Plan_and_Acceptance.md M4: "`test/telemetry/coverage.spec`
 * drives a scripted session and asserts every record kind in `07` §2 is
 * emitted at least once with every required field." TypeScript enforces
 * "every required field" at each call site below (a missing field is a
 * compile error, per `TelemetryEvent`'s per-kind detail shapes); this
 * script's job is making sure every kind is actually exercised at least
 * once, so the coverage test's job is checking that against the full
 * enumeration.
 */

import { asVirtualTime } from "../../app/engine/primitives.js";
import { InMemoryLogSink, SessionLog, type LogHeader, type LogRecord } from "../../app/telemetry/log.js";
import { appendTelemetryEvent } from "../../app/telemetry/emit.js";
import type { TelemetryEvent } from "../../app/telemetry/record-kinds.js";

const HEADER: LogHeader = {
  formatVersion: "0.1.0",
  sessionId: "scripted-session",
  participantCode: "scripted-participant",
  condition: "directed",
  scenarioId: "scripted-scenario",
  scenarioVersion: "0.1.0",
  seed: "1",
  bundleHash: "scripted-bundle",
  appVersion: "0.1.0",
  startedAtIso: "2026-01-01T00:00:00.000Z",
  userAgent: "scripted-session-harness",
  viewport: { w: 1280, h: 800, dpr: 1 },
  counterbalance: { expectationOrder: "A" },
  cell: "radio",
  echelon: "command",
};

const T0 = asVirtualTime(0);

const EVENTS: readonly TelemetryEvent[] = [
  // §2.1
  { kind: "session_started", detail: HEADER },
  { kind: "preflight_result", detail: { benchmarkScore: 90, viewport: { w: 1280, h: 800, dpr: 1 }, refusalReason: null } },
  { kind: "briefing_advanced", detail: { screenId: "briefing.1", dwellMs: 4000 } },
  { kind: "cycle_start", detail: { cycle: 1, phase: "A", clockLabel: "13:20" } },
  { kind: "cycle_end", detail: { cycle: 1, totalRealDurationMs: 180000 } },
  { kind: "hinge_pause_start", detail: { pauseSeconds: 300 } },
  { kind: "hinge_pause_end", detail: { realDurationMs: 120000, dismissedEarly: true } },
  { kind: "state_transition", detail: { from: "RUNNING", to: "FREEZING", trigger: "freeze" } },
  { kind: "fault", detail: { faultClass: "storage_failure" } },
  { kind: "fault_resolved", detail: { faultClass: "storage_failure", elapsedWallClockGapMs: 5000 } },
  { kind: "window_blur", detail: {} },
  { kind: "window_focus", detail: {} },
  { kind: "idle_start", detail: {} },
  { kind: "idle_end", detail: {} },
  { kind: "frame_stats", detail: { cycle: 1, medianFrameTimeMs: 16, longTaskCount: 0 } },
  { kind: "session_completed", detail: {} },
  { kind: "session_resumed", detail: { resumeCount: 1, intervalSinceInterruptionMs: 60000, cycleReplayed: 3 } },
  { kind: "phase_entered", detail: { phase: "phase_a" } },

  // §2.2
  { kind: "bubble_available", detail: { atomId: "atom.1", mapPosition: { lat: 60.8, lon: 27.0 }, tier: "T1_pushed", sourceId: "EK11" } },
  { kind: "envelope_revealed", detail: { cycle: 1, envelopeId: "envelope.cycle_1" } },
  { kind: "channel_signal_emitted", detail: { cycle: 1, signals: [{ category: "fire_behaviour", urgency: 1, certainty: { kind: "probable", basis: "aggregated" }, attribution: ["EK11"], quiet: false, text: "placeholder signal" }], trafficSummary: "placeholder summary", restatesIntent: false } },
  { kind: "duty_officer_message_delivered", detail: { messageId: "duty.1", isStrategicGuidance: false } },
  { kind: "probe_presented", detail: { probeId: "probe.j.cycle_1", type: "J", mode: "PROBING_VISIBLE", optionIds: ["holds", "partly_wrong", "fundamentally_wrong"] } },
  { kind: "retrieval_returned", detail: { queryId: "q.1", packageIds: ["pkg.1"], packageTypes: ["situation"], scores: [0.9], intentLineShown: false } },
  { kind: "unit_reply_delivered", detail: { requestId: "req.1", addressee: "EK11", atomIds: ["atom.1"], authoredLatencySeconds: 22 } },
  { kind: "traffic_returned", detail: { requestId: "req.2", selector: { byUnit: "EK12" }, entryIds: ["traffic.1"] } },

  // §2.3
  { kind: "click", detail: { targetKind: "bubble", targetId: "atom.1", viewportRef: 0, pointerType: "mouse", button: 0 } },
  { kind: "element_enter", detail: { targetKind: "rail_item", targetId: "atom.1" } },
  { kind: "element_leave", detail: { targetKind: "rail_item", targetId: "atom.1" } },
  { kind: "layer_toggled", detail: { layerId: "layer.hotspots", newState: false } },
  { kind: "viewport_changed", detail: { centre: { lat: 60.8, lon: 27.0 }, zoom: 12, bbox: { south: 60.6, north: 61.0, west: 26.7, east: 27.6 } } },
  { kind: "text_scrolled", detail: { elementId: "report.1", maxScrollFraction: 1 } },
  { kind: "pointer_track", detail: { x: 512, y: 300 } },

  // §2.4
  { kind: "drawer_opened", detail: { drawer: "haku", cycle: 1, latencyFromCycleStartMs: 5000, openingRoute: "button" } },
  { kind: "drawer_closed", detail: { drawer: "haku", dwellMs: 12000, closingRoute: "escape" } },
  { kind: "drawer_tab_changed", detail: { drawer: "haku", fromTab: "situation_log", toTab: "traffic_log" } },
  { kind: "drawer_state_at_cycle_boundary", detail: { openDrawer: null } },

  // §2.5
  { kind: "query_focus", detail: {} },
  { kind: "query_first_keystroke", detail: {} },
  { kind: "query_edit", detail: { count: 2 } },
  { kind: "query_submitted", detail: { text: "pohjoisreuna tilanne", charCount: 20, compositionDurationMs: 4000, queryId: "q.1", reformulationChainIndex: 0 } },
  { kind: "query_cleared", detail: { text: "abandoned query" } },
  { kind: "retrieval_miss", detail: { queryId: "q.2", text: "ei tuloksia" } },
  { kind: "result_item_expanded", detail: { atomId: "atom.1" } },
  { kind: "result_item_collapsed", detail: { atomId: "atom.1" } },
  { kind: "radio_request_submitted", detail: { addressee: "EK14", text: "tilannekysely", compositionDurationMs: 3000 } },
  { kind: "traffic_requested", detail: { selectorKind: "byUnit", selector: { byUnit: "EK12" } } },

  // §2.6
  { kind: "probe_option_hovered", detail: { probeId: "probe.j.cycle_1", optionId: "holds" } },
  { kind: "probe_answer_changed", detail: { probeId: "probe.j.cycle_1", from: null, to: "holds" } },
  { kind: "confidence_slider_moved", detail: { probeId: "probe.j.cycle_1", value: 70, settle: false } },
  { kind: "probe_submitted", detail: { probeId: "probe.j.cycle_1", response: { judgement: "holds" } } },
  { kind: "expectation_marked", detail: { probeId: "probe.e.cycle_1", markedGeometry: [[{ lat: 60.8, lon: 27.0 }]], confidence: 60 } },
  { kind: "containment_judgement_submitted", detail: { probeId: "probe.j.cycle_1", judgement: "holds", confidence: 70 } },
  { kind: "containment_judgement_revised", detail: { probeId: "probe.j.cycle_1", judgement: "partly_wrong", confidence: 40, breachPoint: { lat: 60.81, lon: 27.01 } } },
  { kind: "failure_location_marked", detail: { probeId: "probe.j.cycle_1", markedPoint: { lat: 60.81, lon: 27.01 } } },
  { kind: "corrected_projection_drawn", detail: { probeId: "probe.j.cycle_1", polygon: [[{ lat: 60.8, lon: 27.0 }, { lat: 60.81, lon: 27.0 }, { lat: 60.81, lon: 27.01 }]], vertexCount: 3, drawingDurationMs: 15000 } },
  { kind: "allocation_changed", detail: { assetId: "EK11", previousSectorId: null, previousTaskId: null, newSectorId: "L1", newTaskId: "task.direct-attack" } },
  { kind: "allocation_submitted", detail: { assignments: { EK11: { sectorId: "L1", taskId: "task.direct-attack" } }, rationaleFi: "placeholder rationale" } },
  { kind: "polygon_tool_opened", detail: { probeId: "probe.j.cycle_1" } },
  { kind: "polygon_tool_abandoned", detail: { probeId: "probe.j.cycle_1" } },
  { kind: "branch_list_presented", detail: { probeId: "probe.j.cycle_1", statementIds: ["stmt.1", "stmt.2", "stmt.3", "stmt.4", "none_of_these"] } },
  { kind: "branch_option_hovered", detail: { statementId: "stmt.1" } },
  { kind: "branch_selected", detail: { statementId: "none_of_these" } },
  { kind: "branch_list_abandoned", detail: { probeId: "probe.j.cycle_1" } },

  // Amendment
  { kind: "spam_prompt_shown", detail: { probeId: "probe.s.cycle_3" } },
  { kind: "spam_ready", detail: { latencyFromOnsetMs: 3000, timedOut: false } },
  { kind: "spam_answered", detail: { response: "north", latencyFromReadyMs: 4000, timedOut: false } },
  { kind: "recall_confidence_submitted", detail: { probeId: "probe.r.cycle_2", value: 55 } },

  // Decision task
  { kind: "decision_presented", detail: { itemId: "decision.cycle_1", presentedOptionOrder: ["A", "B", "C", "D"] } },
  { kind: "decision_option_hovered", detail: { optionId: "A" } },
  { kind: "decision_initial_submitted", detail: { optionId: "A", confidence: 80, latencyFromPresentationMs: 6000 } },
];

export interface ScriptedSessionResult {
  readonly records: readonly LogRecord[];
}

export async function runScriptedSession(): Promise<ScriptedSessionResult> {
  const log = new SessionLog(HEADER, new InMemoryLogSink());
  for (const event of EVENTS) {
    await appendTelemetryEvent(log, T0, 0, event);
  }
  return { records: await log.readAll() };
}
