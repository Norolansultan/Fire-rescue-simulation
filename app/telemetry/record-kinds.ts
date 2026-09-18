/**
 * The complete telemetry record enumeration — SPEC/07_Telemetry_and_Logging.md
 * §2, reconciled with its "Amendment 2026-09-17" and "Revision 2026-09-17 (d)"
 * (which supersedes the amendment where they conflict) to a single final
 * state, the same way `app/scenario/types.ts` reconciles SPEC/04.
 *
 * "Adding a kind is a `formatVersion` bump" (SPEC/04 §10) — so this is the
 * complete list, not an extensible-by-convention one. Each `TelemetryEvent`
 * variant pairs a `kind` with its typed `detail`, mirroring the
 * `RecordPayload` discriminated-union pattern in `scenario/types.ts`.
 *
 * Principle governing every shape here (SPEC/07 §1): "Capture raw events
 * with precise timing and identity. Derive nothing at runtime." No detail
 * type below computes a latency, a dwell time, or any other derived
 * value — those are named in `derived-measures.ts` and computed only from
 * these raw records.
 *
 * What must never be logged (SPEC/07 §3), enforced by omission from this
 * file rather than by a runtime filter: no correctness value, flag, truth
 * annotation, or invariant comparison; no raw in-progress keystroke
 * content (`query_edit` carries a count, never text); no personal
 * identifier beyond the pseudonymous participant code already in
 * `LogHeader`.
 */

import type { CycleIndex, LatLon, Polygon, VirtualTime, WarmupIndex } from "../engine/primitives.js";
import type { Certainty, ContainmentJudgement, ProbeMode, ProbeType } from "../scenario/types.js";
import type { LogHeader } from "./log.js";

// ---------------------------------------------------------------------------
// §2.1 Session and lifecycle
// ---------------------------------------------------------------------------

export interface PreflightResultDetail {
  readonly benchmarkScore: number;
  readonly viewport: { readonly w: number; readonly h: number; readonly dpr: number };
  readonly refusalReason: string | null;
}
export interface BriefingAdvancedDetail {
  readonly screenId: string;
  readonly dwellMs: number;
}
export interface CycleStartDetail {
  readonly cycle: CycleIndex | WarmupIndex;
  readonly phase: "A" | "B" | "warmup";
  readonly clockLabel: string;
}
export interface CycleEndDetail {
  readonly cycle: CycleIndex | WarmupIndex;
  readonly totalRealDurationMs: number;
}
export interface HingePauseStartDetail {
  readonly pauseSeconds: number;
}
export interface HingePauseEndDetail {
  readonly realDurationMs: number;
  readonly dismissedEarly: boolean;
}
export interface StateTransitionDetail {
  readonly from: string;
  readonly to: string;
  readonly trigger: string;
}
export interface FaultDetail {
  readonly faultClass: string;
}
export interface FaultResolvedDetail {
  readonly faultClass: string;
  readonly elapsedWallClockGapMs: number;
}
export interface FrameStatsDetail {
  readonly cycle: CycleIndex | WarmupIndex;
  readonly medianFrameTimeMs: number;
  readonly longTaskCount: number;
}
export interface SessionResumedDetail {
  readonly resumeCount: number;
  readonly intervalSinceInterruptionMs: number;
  readonly cycleReplayed: CycleIndex | WarmupIndex;
}
export type PhaseEnteredDetail = { readonly phase: "warmup" | "tutorial" | "phase_a" | "hinge" | "phase_b" };

// ---------------------------------------------------------------------------
// §2.2 Stimulus onsets — the latency anchors
// ---------------------------------------------------------------------------

export interface BubbleAvailableDetail {
  readonly atomId: string;
  readonly mapPosition: LatLon | null;
  readonly tier: "T1_pushed" | "T2_system" | "T3_person" | "T4_lateral";
  readonly sourceId: string;
}
export interface EnvelopeRevealedDetail {
  readonly cycle: CycleIndex | WarmupIndex;
  readonly envelopeId: string;
}
/** SPEC/07 §2.2: "Cycle index, the full signal payload including the traffic summary." The channel is unused in this study (SPEC/02 revision (g)) but the record kind is kept so a later study can reinstate it without a schema change. */
export interface ChannelSignalEmittedDetail {
  readonly cycle: CycleIndex | WarmupIndex;
  readonly signals: readonly {
    readonly category: string;
    readonly urgency: 0 | 1 | 2 | 3;
    readonly certainty: Certainty;
    readonly attribution: readonly string[];
    readonly quiet: boolean;
    readonly text: string;
  }[];
  readonly trafficSummary: string;
  readonly restatesIntent: boolean;
}
export interface DutyOfficerMessageDeliveredDetail {
  readonly messageId: string;
  readonly isStrategicGuidance: boolean;
}
export interface ProbePresentedDetail {
  readonly probeId: string;
  readonly type: ProbeType;
  readonly mode: ProbeMode;
  readonly optionIds: readonly string[];
}
export interface RetrievalReturnedDetail {
  readonly queryId: string;
  /** Ranked package ids, in rank order (revision (e)/(f): reasoning-only engine; "fact" packages remain an expandable layer, never a top-level answer). */
  readonly packageIds: readonly string[];
  readonly packageTypes: readonly ("fact" | "situation" | "meaning" | "projection")[];
  readonly scores: readonly number[]; // fixed precision, SPEC/14 §5
  readonly intentLineShown: boolean; // revision (d)
}
export interface UnitReplyDeliveredDetail {
  readonly requestId: string;
  readonly addressee: string;
  readonly atomIds: readonly string[];
  readonly authoredLatencySeconds: number;
}
export interface TrafficReturnedDetail {
  readonly requestId: string;
  readonly selector: { readonly byUnit?: string; readonly byGroup?: string; readonly byTimeWindow?: readonly [VirtualTime, VirtualTime] };
  readonly entryIds: readonly string[];
}

// ---------------------------------------------------------------------------
// §2.3 Pointer and element interaction
// ---------------------------------------------------------------------------

export type ClickTargetKind =
  | "bubble" | "unit" | "drone" | "envelope" | "sector" | "map_background" | "drawer_control" | "drawer_tab"
  | "probe_option" | "result_item" | "channel_signal" | "rail_item" | "slider" | "status_strip_item" | "other";

export interface ClickDetail {
  readonly targetKind: ClickTargetKind;
  readonly targetId: string | null;
  readonly mapCoord?: LatLon;
  readonly viewportRef: number; // seq of the last viewport_changed
  readonly pointerType: "mouse" | "pen" | "touch";
  readonly button: number;
}
export interface ElementEnterLeaveDetail {
  readonly targetKind: ClickTargetKind;
  readonly targetId: string | null;
}
export interface LayerToggledDetail {
  readonly layerId: string;
  readonly newState: boolean;
}
export interface ViewportChangedDetail {
  readonly centre: LatLon;
  readonly zoom: number;
  readonly bbox: { readonly south: number; readonly north: number; readonly west: number; readonly east: number };
}
export interface TextScrolledDetail {
  readonly elementId: string;
  readonly maxScrollFraction: number; // 0-1
}
export interface PointerTrackDetail {
  readonly x: number;
  readonly y: number;
}

// ---------------------------------------------------------------------------
// §2.4 Drawers
// ---------------------------------------------------------------------------

export type DrawerId = "haku" | "tekoaly" | "radio";
export interface DrawerOpenedDetail {
  readonly drawer: DrawerId;
  readonly cycle: CycleIndex | WarmupIndex;
  readonly latencyFromCycleStartMs: number;
  readonly openingRoute: "button" | "keyboard";
}
export interface DrawerClosedDetail {
  readonly drawer: DrawerId;
  readonly dwellMs: number;
  readonly closingRoute: "button" | "map_click" | "escape" | "replaced_by_another_drawer";
}
export interface DrawerTabChangedDetail {
  readonly drawer: DrawerId;
  readonly fromTab: string;
  readonly toTab: string;
}
export interface DrawerStateAtCycleBoundaryDetail {
  readonly openDrawer: DrawerId | null;
}

// ---------------------------------------------------------------------------
// §2.5 Query capture
// ---------------------------------------------------------------------------

export interface QueryEditDetail {
  readonly count: number; // NOT per-keystroke content (SPEC/07 §3)
}
export interface QuerySubmittedDetail {
  readonly text: string; // verbatim — personal data, see SPEC/07 §2.5
  readonly charCount: number;
  readonly compositionDurationMs: number;
  readonly queryId: string;
  readonly reformulationChainIndex: number;
}
export interface QueryClearedDetail {
  readonly text: string; // as typed, abandoned without submission
}
export interface RetrievalMissDetail {
  readonly queryId: string;
  readonly text: string;
}
export interface ResultItemDetail {
  readonly atomId: string;
}
export interface RadioRequestSubmittedDetail {
  readonly addressee: string;
  readonly text: string;
  readonly compositionDurationMs: number;
}
export interface TrafficRequestedDetail {
  readonly selectorKind: "byUnit" | "byGroup" | "byTimeWindow";
  readonly selector: { readonly byUnit?: string; readonly byGroup?: string; readonly byTimeWindow?: readonly [VirtualTime, VirtualTime] };
}

// ---------------------------------------------------------------------------
// §2.6 Probe and decision interaction
// ---------------------------------------------------------------------------

export interface ProbeOptionHoveredDetail {
  readonly probeId: string;
  readonly optionId: string;
}
export interface ProbeAnswerChangedDetail {
  readonly probeId: string;
  readonly from: string | null;
  readonly to: string;
}
export interface ConfidenceSliderMovedDetail {
  readonly probeId: string;
  readonly value: number;
  readonly settle: boolean;
}
export interface ProbeSubmittedDetail {
  readonly probeId: string;
  readonly response: unknown; // narrowed per ProbeType at the call site; the log's job is custody, not re-typing every probe's answer shape here
}
export interface ExpectationMarkedDetail {
  readonly probeId: string;
  readonly markedGeometry: Polygon;
  readonly confidence: number;
}
export interface ContainmentJudgementSubmittedDetail {
  readonly probeId: string;
  readonly judgement: ContainmentJudgement;
  readonly confidence: number;
  readonly breachPoint?: LatLon;
  readonly correctedProjection?: Polygon;
}
export interface FailureLocationMarkedDetail {
  readonly probeId: string;
  readonly markedPoint?: LatLon;
  readonly markedPolygon?: Polygon;
}
export interface CorrectedProjectionDrawnDetail {
  readonly probeId: string;
  readonly polygon: Polygon;
  readonly vertexCount: number;
  readonly drawingDurationMs: number;
}
export interface AllocationChangedDetail {
  readonly assetId: string;
  readonly previousSectorId: string | null;
  readonly previousTaskId: string | null;
  readonly newSectorId: string;
  readonly newTaskId: string;
}
export interface AllocationSubmittedDetail {
  readonly assignments: Readonly<Record<string, { readonly sectorId: string; readonly taskId: string }>>;
  readonly rationaleFi: string;
}
export interface PolygonToolDetail {
  readonly probeId: string;
}
export interface BranchListPresentedDetail {
  readonly probeId: string;
  readonly statementIds: readonly string[]; // presented order, "Ei mikään näistä" always last
}
export interface BranchOptionHoveredDetail {
  readonly statementId: string;
}
export interface BranchSelectedDetail {
  readonly statementId: string | "none_of_these";
}
export interface BranchListAbandonedDetail {
  readonly probeId: string;
}

// ---------------------------------------------------------------------------
// Amendment: SPAM (Type S), recall confidence
// ---------------------------------------------------------------------------

export interface SpamPromptShownDetail {
  readonly probeId: string;
}
export interface SpamReadyDetail {
  readonly latencyFromOnsetMs: number;
  readonly timedOut: boolean; // true = spam_ready_timeout
}
export interface SpamAnsweredDetail {
  readonly response: string;
  readonly latencyFromReadyMs: number;
  readonly timedOut: boolean; // true = spam_answer_timeout
}
export interface RecallConfidenceSubmittedDetail {
  readonly probeId: string;
  readonly value: number;
}

// ---------------------------------------------------------------------------
// SPEC/16 §8, as narrowed by revision (d): only decision_presented,
// decision_option_hovered and decision_initial_submitted survive —
// alignment_feedback_shown and decision_final_submitted are removed
// ("the machine never comments on the participant's decisions").
// ---------------------------------------------------------------------------

export interface DecisionPresentedDetail {
  readonly itemId: string;
  readonly presentedOptionOrder: readonly string[];
}
export interface DecisionOptionHoveredDetail {
  readonly optionId: string;
}
export interface DecisionInitialSubmittedDetail {
  readonly optionId: string;
  readonly confidence: number;
  readonly latencyFromPresentationMs: number;
}

// ---------------------------------------------------------------------------
// The complete kind -> detail pairing.
// ---------------------------------------------------------------------------

export type TelemetryEvent =
  // §2.1
  | { readonly kind: "session_started"; readonly detail: LogHeader }
  | { readonly kind: "preflight_result"; readonly detail: PreflightResultDetail }
  | { readonly kind: "briefing_advanced"; readonly detail: BriefingAdvancedDetail }
  | { readonly kind: "cycle_start"; readonly detail: CycleStartDetail }
  | { readonly kind: "cycle_end"; readonly detail: CycleEndDetail }
  | { readonly kind: "hinge_pause_start"; readonly detail: HingePauseStartDetail }
  | { readonly kind: "hinge_pause_end"; readonly detail: HingePauseEndDetail }
  | { readonly kind: "state_transition"; readonly detail: StateTransitionDetail }
  | { readonly kind: "fault"; readonly detail: FaultDetail }
  | { readonly kind: "fault_resolved"; readonly detail: FaultResolvedDetail }
  | { readonly kind: "window_blur"; readonly detail: Record<string, never> }
  | { readonly kind: "window_focus"; readonly detail: Record<string, never> }
  | { readonly kind: "idle_start"; readonly detail: Record<string, never> }
  | { readonly kind: "idle_end"; readonly detail: Record<string, never> }
  | { readonly kind: "frame_stats"; readonly detail: FrameStatsDetail }
  | { readonly kind: "session_completed"; readonly detail: Record<string, never> }
  | { readonly kind: "session_resumed"; readonly detail: SessionResumedDetail }
  | { readonly kind: "phase_entered"; readonly detail: PhaseEnteredDetail }
  // §2.2
  | { readonly kind: "bubble_available"; readonly detail: BubbleAvailableDetail }
  | { readonly kind: "envelope_revealed"; readonly detail: EnvelopeRevealedDetail }
  | { readonly kind: "channel_signal_emitted"; readonly detail: ChannelSignalEmittedDetail }
  | { readonly kind: "duty_officer_message_delivered"; readonly detail: DutyOfficerMessageDeliveredDetail }
  | { readonly kind: "probe_presented"; readonly detail: ProbePresentedDetail }
  | { readonly kind: "retrieval_returned"; readonly detail: RetrievalReturnedDetail }
  | { readonly kind: "unit_reply_delivered"; readonly detail: UnitReplyDeliveredDetail }
  | { readonly kind: "traffic_returned"; readonly detail: TrafficReturnedDetail }
  // §2.3
  | { readonly kind: "click"; readonly detail: ClickDetail }
  | { readonly kind: "element_enter"; readonly detail: ElementEnterLeaveDetail }
  | { readonly kind: "element_leave"; readonly detail: ElementEnterLeaveDetail }
  | { readonly kind: "layer_toggled"; readonly detail: LayerToggledDetail }
  | { readonly kind: "viewport_changed"; readonly detail: ViewportChangedDetail }
  | { readonly kind: "text_scrolled"; readonly detail: TextScrolledDetail }
  | { readonly kind: "pointer_track"; readonly detail: PointerTrackDetail }
  // §2.4
  | { readonly kind: "drawer_opened"; readonly detail: DrawerOpenedDetail }
  | { readonly kind: "drawer_closed"; readonly detail: DrawerClosedDetail }
  | { readonly kind: "drawer_tab_changed"; readonly detail: DrawerTabChangedDetail }
  | { readonly kind: "drawer_state_at_cycle_boundary"; readonly detail: DrawerStateAtCycleBoundaryDetail }
  // §2.5
  | { readonly kind: "query_focus"; readonly detail: Record<string, never> }
  | { readonly kind: "query_first_keystroke"; readonly detail: Record<string, never> }
  | { readonly kind: "query_edit"; readonly detail: QueryEditDetail }
  | { readonly kind: "query_submitted"; readonly detail: QuerySubmittedDetail }
  | { readonly kind: "query_cleared"; readonly detail: QueryClearedDetail }
  | { readonly kind: "retrieval_miss"; readonly detail: RetrievalMissDetail }
  | { readonly kind: "result_item_expanded"; readonly detail: ResultItemDetail }
  | { readonly kind: "result_item_collapsed"; readonly detail: ResultItemDetail }
  | { readonly kind: "radio_request_submitted"; readonly detail: RadioRequestSubmittedDetail }
  | { readonly kind: "traffic_requested"; readonly detail: TrafficRequestedDetail }
  // §2.6
  | { readonly kind: "probe_option_hovered"; readonly detail: ProbeOptionHoveredDetail }
  | { readonly kind: "probe_answer_changed"; readonly detail: ProbeAnswerChangedDetail }
  | { readonly kind: "confidence_slider_moved"; readonly detail: ConfidenceSliderMovedDetail }
  | { readonly kind: "probe_submitted"; readonly detail: ProbeSubmittedDetail }
  | { readonly kind: "expectation_marked"; readonly detail: ExpectationMarkedDetail }
  | { readonly kind: "containment_judgement_submitted"; readonly detail: ContainmentJudgementSubmittedDetail }
  | { readonly kind: "containment_judgement_revised"; readonly detail: ContainmentJudgementSubmittedDetail }
  | { readonly kind: "failure_location_marked"; readonly detail: FailureLocationMarkedDetail }
  | { readonly kind: "corrected_projection_drawn"; readonly detail: CorrectedProjectionDrawnDetail }
  | { readonly kind: "allocation_changed"; readonly detail: AllocationChangedDetail }
  | { readonly kind: "allocation_submitted"; readonly detail: AllocationSubmittedDetail }
  | { readonly kind: "polygon_tool_opened"; readonly detail: PolygonToolDetail }
  | { readonly kind: "polygon_tool_abandoned"; readonly detail: PolygonToolDetail }
  | { readonly kind: "branch_list_presented"; readonly detail: BranchListPresentedDetail }
  | { readonly kind: "branch_option_hovered"; readonly detail: BranchOptionHoveredDetail }
  | { readonly kind: "branch_selected"; readonly detail: BranchSelectedDetail }
  | { readonly kind: "branch_list_abandoned"; readonly detail: BranchListAbandonedDetail }
  // Amendment
  | { readonly kind: "spam_prompt_shown"; readonly detail: SpamPromptShownDetail }
  | { readonly kind: "spam_ready"; readonly detail: SpamReadyDetail }
  | { readonly kind: "spam_answered"; readonly detail: SpamAnsweredDetail }
  | { readonly kind: "recall_confidence_submitted"; readonly detail: RecallConfidenceSubmittedDetail }
  // SPEC/16 §8 (as narrowed by revision (d))
  | { readonly kind: "decision_presented"; readonly detail: DecisionPresentedDetail }
  | { readonly kind: "decision_option_hovered"; readonly detail: DecisionOptionHoveredDetail }
  | { readonly kind: "decision_initial_submitted"; readonly detail: DecisionInitialSubmittedDetail };

export type RecordKind = TelemetryEvent["kind"];

/** Every record kind, as a value array — used by the coverage test to assert nothing is missed. Order here is the declaration order above (§2.1 -> §2.6 -> amendment -> decision), not alphabetical or insertion-derived from an object, so it stays stable (I1). */
export const ALL_RECORD_KINDS: readonly RecordKind[] = [
  "session_started", "preflight_result", "briefing_advanced", "cycle_start", "cycle_end", "hinge_pause_start", "hinge_pause_end",
  "state_transition", "fault", "fault_resolved", "window_blur", "window_focus", "idle_start", "idle_end", "frame_stats",
  "session_completed", "session_resumed", "phase_entered",
  "bubble_available", "envelope_revealed", "channel_signal_emitted", "duty_officer_message_delivered", "probe_presented", "retrieval_returned",
  "unit_reply_delivered", "traffic_returned",
  "click", "element_enter", "element_leave", "layer_toggled", "viewport_changed", "text_scrolled", "pointer_track",
  "drawer_opened", "drawer_closed", "drawer_tab_changed", "drawer_state_at_cycle_boundary",
  "query_focus", "query_first_keystroke", "query_edit", "query_submitted", "query_cleared", "retrieval_miss",
  "result_item_expanded", "result_item_collapsed", "radio_request_submitted", "traffic_requested",
  "probe_option_hovered", "probe_answer_changed", "confidence_slider_moved", "probe_submitted", "expectation_marked",
  "containment_judgement_submitted", "containment_judgement_revised", "failure_location_marked",
  "corrected_projection_drawn", "allocation_changed", "allocation_submitted", "polygon_tool_opened",
  "polygon_tool_abandoned", "branch_list_presented", "branch_option_hovered", "branch_selected", "branch_list_abandoned",
  "spam_prompt_shown", "spam_ready", "spam_answered", "recall_confidence_submitted",
  "decision_presented", "decision_option_hovered", "decision_initial_submitted",
];
