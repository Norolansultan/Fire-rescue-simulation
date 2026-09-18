/**
 * The capability matrix — SPEC/02_Conditions_and_Information_Routing.md
 * §2: "What each condition can do, across every surface. Build this
 * table; it is the specification."
 *
 * "Deliberately identical across all three: the map, the bubble stream
 * and its timing, the envelope and its accuracy, the probe schedule, the
 * duty officer's behaviour, the ability to ask any named formation
 * anything, and the underlying information space. Nothing is knowable in
 * one condition and unknowable in another."
 *
 * This is the full three-condition architectural matrix (§2's own
 * table), kept intact even though only two conditions are configurable
 * for this specific study (see {@link CONDITIONS_IN_USE} below,
 * SPEC/02 revision (f)/(g)) — `assistive` "stays defined in the code as
 * an unused condition so a later study can reinstate it without an
 * engine change" (SPEC/02 revision (f)).
 */

import type { ConditionId } from "../scenario/types.js";

export type ReferenceDataCapability = "browse_by_map_object" | "browse_and_free_text";
export type SituationLogCapability = "scroll_and_filter" | "free_text_search";
export type TrafficLogCapability = "request_by_named_unit_only" | "query_by_unit_group_time_content" | "query_and_summarised_into_channel";

export interface CapabilityRow {
  /** Identical across all three conditions — SPEC/02 §2's "deliberately identical" list. */
  readonly mapMarkersBubbles: "identical";
  readonly projectionEnvelope: "identical";
  readonly statusStripReportRail: "identical";
  readonly radioAskFormation: true;
  readonly radioAskDutyOfficer: true;
  readonly unitStatusAndAge: true;

  /** Varies by condition. */
  readonly referenceData: ReferenceDataCapability;
  readonly situationLog: SituationLogCapability;
  readonly trafficLog: TrafficLogCapability;
  readonly crossSourceFreeTextQuery: boolean;
  readonly aiDrawerPresent: boolean;
  readonly pushedChannelSignals: boolean;
}

const IDENTICAL_ACROSS_ALL: Pick<
  CapabilityRow,
  "mapMarkersBubbles" | "projectionEnvelope" | "statusStripReportRail" | "radioAskFormation" | "radioAskDutyOfficer" | "unitStatusAndAge"
> = {
  mapMarkersBubbles: "identical",
  projectionEnvelope: "identical",
  statusStripReportRail: "identical",
  radioAskFormation: true,
  radioAskDutyOfficer: true,
  unitStatusAndAge: true,
};

export const CAPABILITY_MATRIX: Readonly<Record<ConditionId, CapabilityRow>> = {
  directed: {
    ...IDENTICAL_ACROSS_ALL,
    referenceData: "browse_by_map_object",
    situationLog: "scroll_and_filter",
    trafficLog: "request_by_named_unit_only",
    crossSourceFreeTextQuery: false,
    aiDrawerPresent: false,
    pushedChannelSignals: false,
  },
  assistive: {
    ...IDENTICAL_ACROSS_ALL,
    referenceData: "browse_and_free_text",
    situationLog: "free_text_search",
    trafficLog: "query_by_unit_group_time_content",
    crossSourceFreeTextQuery: true,
    aiDrawerPresent: true,
    pushedChannelSignals: false,
  },
  substitutive: {
    ...IDENTICAL_ACROSS_ALL,
    referenceData: "browse_and_free_text",
    situationLog: "free_text_search",
    trafficLog: "query_and_summarised_into_channel",
    crossSourceFreeTextQuery: true,
    aiDrawerPresent: true,
    pushedChannelSignals: true,
  },
};

/**
 * SPEC/02 revisions (f)/(g): the study configures only `directed` and
 * `substitutive`; `assistive` (LLM returning facts) "is not used in this
 * study." SPEC/04 revision (f): "CI asserts no session is configured
 * with `assistive`."
 */
export const CONDITIONS_IN_USE: readonly ConditionId[] = ["directed", "substitutive"];

export class ConditionNotInUseError extends Error {
  constructor(readonly condition: ConditionId) {
    super(`Condition "${condition}" is not configured for this study (SPEC/02 revision (f)/(g)); only ${CONDITIONS_IN_USE.join(", ")} are in use`);
    this.name = "ConditionNotInUseError";
  }
}

export function assertConditionInUse(condition: ConditionId): void {
  if (!CONDITIONS_IN_USE.includes(condition)) {
    throw new ConditionNotInUseError(condition);
  }
}
