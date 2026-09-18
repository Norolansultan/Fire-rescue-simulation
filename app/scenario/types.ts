/**
 * The scenario data model — SPEC/04_Data_Model.md, "authoritative over
 * every prose description of data elsewhere."
 *
 * This file reconciles 04's base text with every dated amendment and
 * revision through 2026-09-17 into a single current state, per the
 * precedence rules in SPEC/00 §1: "Amendments dated 17 September 2026...
 * the document it points to (14, 15 or 16, or the file's own dated
 * amendment) wins over the marked text, regardless of file number." Where
 * 04 itself carries several dated revisions on one topic (e.g.
 * `ConditionId` was revised four times), the LAST one wins; superseded
 * intermediate shapes are not reproduced here.
 *
 * Deliberately NOT merged in yet, per 04's own closing note ("Decision
 * types are defined in 16 §7 and information packages in 14 §3.2; both
 * are authoritative as written there until merged here"):
 *   - `InfoPackage` and the retrieval engine's types (SPEC/14 §3.2) — M5.
 *   - `DecisionOption` / `DecisionItem` / `DecisionResponse` (SPEC/16 §7) — M8.
 * Building those now, ahead of the milestone that needs them, would mean
 * guessing at a design that has already been revised four times in the
 * source documents; better to add them when M5/M8 actually starts and the
 * fork registered in SPEC/11 §7.1 (embedding model, package topic list)
 * has something to build against.
 *
 * Scope note carried over from `engine/cycle-sequencer.ts`: prologue
 * (W1-W5) placement on the virtual timeline is unresolved (SPEC/17 §3,
 * item S1). `WarmupIndex` exists as a type because probes and cycle specs
 * reference it, but nothing here invents a timing answer for it.
 */

import type { CycleIndex, GeoExtent, LatLon, Polygon, VirtualTime, WarmupIndex } from "../engine/primitives.js";

// ---------------------------------------------------------------------------
// §1 primitives not already in engine/primitives.ts
// ---------------------------------------------------------------------------

export type Tier = "T1_pushed" | "T2_system" | "T3_person" | "T4_lateral";
export type Origin = "below" | "lateral" | "above" | "sensor";
export type SourceReliability = "known-good" | "unproven" | "degraded";

export type Certainty =
  | { readonly kind: "confirmed" }
  | { readonly kind: "probable"; readonly basis: string }
  | { readonly kind: "uncertain"; readonly basis: string }
  | { readonly kind: "unknown" }; // MUST be representable and renderable — never `undefined`.

// ---------------------------------------------------------------------------
// §1 amendment / revisions — condition ids, cells, echelon
// ---------------------------------------------------------------------------

/** Revision 2026-09-17 (f), final: `assistive` is defined but unused in this study (CI asserts no session is configured with it). */
export type ConditionId = "directed" | "assistive" | "substitutive";

/** Revision 2026-09-17 (f), final. Replaces `SessionConfig.guidanceMode`. */
export type Cell = "radio" | "reasoning_once" | "reasoning_intent";

/** Amendment 2026-09-17, §11. */
export type Echelon = "command" | "supervisory" | "crew";

export type Phase = "A" | "B";

// ---------------------------------------------------------------------------
// §2 the scenario contract
// ---------------------------------------------------------------------------

export interface ExpectedInvariant {
  readonly name: string; // e.g. "containment.cycle_04"
  readonly expected: number | string | boolean;
  readonly tolerance: number; // >= 0; 0 for categorical
  readonly unit?: string; // "m", "deg", "m/min" — documentation, not logic
}

export interface ValidityClaim {
  readonly represents: readonly string[];
  readonly doesNotRepresent: readonly string[];
  readonly authoredBy: string;
  readonly reviewedBy: readonly string[]; // domain reviewers, named
  readonly sourceBasis: readonly string[]; // incidents, doctrine, data drawn on
  readonly knownDivergences: readonly string[]; // where it is deliberately unrealistic
}

/**
 * `knownDivergences` must contain at minimum (SPEC/04 §2): the deliberate
 * breach-rate choice; the fire magnitude relative to Finnish experience;
 * and the fact that the `directed` responder is simulated rather than a
 * person. Checked by tag in {@link REQUIRED_DIVERGENCE_TAGS}.
 */
export const REQUIRED_DIVERGENCE_TAGS = ["breach-rate", "fire-magnitude", "simulated-responder"] as const;
export type RequiredDivergenceTag = (typeof REQUIRED_DIVERGENCE_TAGS)[number];

export interface ContradictionMarker {
  readonly id: string;
  readonly cycle: CycleIndex; // 18
  readonly premiseAtomId: string; // the aerial report
  readonly counterAtomId: string; // the ground report
  readonly reconcilingAtomId: string; // the T4 traffic that explains it
  readonly subtlety: "low" | "medium" | "high"; // pilot selects among three
  readonly detectionProbeId: string; // the open uncertainty probe
  readonly backupProbeId: string; // the forced-choice item
}

export interface OmissionMarker {
  readonly id: string;
  readonly cycle: CycleIndex; // 12
  readonly mechanism: "M1_shower" | "M2_gusts" | "M3_fuel_boundary" | "M4_spotting";
  readonly outsideEveryEnvelope: true; // literal; asserted in CI
  readonly developmentAtomIds: readonly string[];
}

export interface AlignmentRule {
  readonly id: string;
  readonly appliesToSectors: readonly string[];
  readonly alignedTasks: readonly string[];
  readonly misalignedTasks: readonly string[];
}

export interface HingeSpec {
  readonly afterCycle: 10;
  readonly guidanceMessageId: string;
  readonly pauseSeconds: 300; // real time, participant-dismissible
  readonly intentStatement: string; // Finnish; restated by the channel
  readonly alignmentRules: readonly AlignmentRule[]; // how allocations are scored
}

/** SPEC/12 §10: "DEFINED AND NEVER POPULATED IN THIS STUDY." §6.4. */
export interface AllocationRecommendation {
  readonly assetId: string;
  readonly toSectorId: string;
  readonly taskId: string;
  readonly machineAttribution: string;
  readonly certainty: Certainty;
}

export interface ScenarioContract {
  readonly id: string; // stable, human-readable, never reused
  readonly version: string; // semver; any content change bumps it
  readonly seed: bigint; // u64
  readonly constructs: readonly string[]; // what this scenario probes
  readonly validity: ValidityClaim; // mandatory
  readonly extent: GeoExtent;
  readonly cycleCount: 20; // literal; the engine is not variable-length
  readonly virtualSecondsPerCycle: 1200; // literal: twenty minutes
  readonly startVirtualClock: string; // "HH:MM" shown to the participant
  readonly invariants: readonly ExpectedInvariant[]; // the answer key
  readonly contradiction: ContradictionMarker; // exactly one
  readonly omission: OmissionMarker; // exactly one
  readonly probeSchedule: ProbeSchedule;
  readonly cycles: readonly CycleSpec[]; // length 20
  readonly atoms: readonly InfoAtom[];
  readonly envelopes: readonly Envelope[]; // length 20
  readonly channelSets: readonly ChannelSignalSet[]; // length 20
  readonly dutyOfficerMessages: readonly DutyOfficerMessage[];
  readonly branches: readonly Branch[]; // >= 5
  readonly branchStatements: readonly BranchStatement[]; // SPEC/03 revision (d), SPEC/04 revision (d)
  readonly allocationSpace: AllocationSpace;
  readonly allocationRecommendations: readonly AllocationRecommendation[]; // SPEC/12 §10: CI asserts length === 0 in this study
  readonly hinge: HingeSpec;
  readonly sourceClasses: readonly SourceClass[];
}

// ---------------------------------------------------------------------------
// §3 information atoms
// ---------------------------------------------------------------------------

export type RecordSurface =
  | "situation_log"
  | "traffic_log"
  | "unit_status"
  | "reference_stand"
  | "reference_road"
  | "reference_water"
  | "reference_maintenance"
  | "task_record"
  | "weather_series";

export interface TrafficSelector {
  readonly byUnit?: string;
  readonly byGroup?: string;
  readonly byTimeWindow?: readonly [VirtualTime, VirtualTime];
}

export type Route =
  | { readonly kind: "pushed" } // T1
  | { readonly kind: "ask_unit"; readonly unitId: string } // T3, T4
  | { readonly kind: "ask_duty_officer" }
  | { readonly kind: "request_traffic"; readonly selector: TrafficSelector } // T4
  | { readonly kind: "browse"; readonly surface: RecordSurface } // T2
  | { readonly kind: "free_text"; readonly exampleQueries: readonly string[] }
  | { readonly kind: "channel"; readonly signalSetCycle: CycleIndex };

/**
 * SPEC/02 revision (g): routes in use for the two groups this study
 * configures. `directed` -> browse | request_traffic | ask_unit.
 * `substitutive` -> free_text | ask_unit. `assistive` and the `channel`
 * route are unused (kept in the type so a later study can reinstate them
 * without an engine change).
 */
export interface Routes {
  readonly directed: Route | null; // non-null required if loadBearing
  readonly assistive: Route | null;
  readonly substitutive: Route | null;
}

export interface Provenance {
  // participant-visible
  readonly sourceId: string; // unit designator or sensor id
  readonly sourceClassId: string; // -> SourceClass
  readonly sourceReliability: SourceReliability;
  readonly observedAt: VirtualTime; // when it happened
  readonly recordedAt: VirtualTime; // when it was typed — may differ (degradation 4)
  readonly deliveredAt: VirtualTime | null; // when it reaches the participant; null for pull-only
  readonly certainty: Certainty;
  readonly supports: readonly string[]; // atom ids
  readonly contradicts: readonly string[]; // atom ids
}

/** SPEC/04 revision (g): explains why an item is, or is not, in the searchable database (SPEC/19). */
export type ChannelOfUtterance = "talk_group" | "dmo" | "phone" | "face_to_face" | "emergency_call";

export interface TruthAnnotation {
  // NEVER rendered. NEVER crosses the boundary.
  readonly isGroundTruth: boolean;
  readonly isDecoy: boolean;
  readonly contradictionRole?: "premise" | "counter-evidence" | "reconciling";
  readonly relevantInvariants: readonly string[];
  readonly tierRationale?: string; // why this fact sits at this tier
  readonly saidOn?: ChannelOfUtterance; // revision (g)
}

export interface Consequence {
  readonly description: string;
  readonly manifestsAtCycle: CycleIndex;
  readonly measureId: string; // e.g. "t4_discovery.private_doubt"
}

export interface SourceClass {
  readonly id: string;
  readonly label: string; // Finnish, participant-visible
  readonly reliability: SourceReliability; // CONSISTENT across the whole incident
  readonly replyLatency: LatencyDistribution; // for `directed`
}

export interface LatencyDistribution {
  readonly kind: "lognormal";
  readonly medianSeconds: number;
  readonly sigma: number;
  readonly minSeconds: number;
  readonly maxSeconds: number;
}

export interface InfoAtom {
  readonly id: string; // deterministic: hash(scenarioId, index)
  readonly tier: Tier;
  readonly origin: Origin;
  readonly cycle: CycleIndex; // the cycle it belongs to
  readonly loadBearing: boolean; // if true, `routes` must have all three
  readonly routes: Routes;
  readonly record: RecordPayload; // the discriminated union, §4
  readonly provenance: Provenance; // participant-visible
  readonly degradation: readonly Degradation[]; // §5
  readonly retrievalKeys: readonly string[]; // generated, then reviewed
  readonly truth: TruthAnnotation; // analysis only; STRIPPED at the boundary
  readonly consequence?: Consequence; // for load-bearing atoms
}

// ---------------------------------------------------------------------------
// §4 record sub-schemas
// ---------------------------------------------------------------------------

export interface TaskRecord {
  readonly kind: "task_record";
  readonly taskId: string;
  readonly callerAccount: string; // Finnish free text, as given
  readonly firstAddress: string;
  readonly reportedCoord: LatLon | null;
  readonly firstUnitCoord: LatLon | null; // may differ — degradation 11
  readonly initialAssignment: readonly string[]; // unit ids
  readonly taskType: string; // ERICA-style code
}

export interface SituationLogEntry {
  readonly kind: "situation_log";
  readonly entryId: string;
  readonly authorUnitId: string;
  readonly text: string; // Finnish, degraded as authored
  readonly supersedesEntryId?: string; // degradation 10: silent correction
  readonly structuredFieldOverflow?: string; // degradation 12: the discarded remainder
}

export interface UnitStatusRecord {
  readonly kind: "unit_status";
  readonly unitId: string;
  readonly status: "matkalla" | "kohteessa" | "vapautunut" | "ei_tiedossa";
  readonly setAt: VirtualTime; // the age is the point
  readonly position: LatLon | null;
  readonly positionSetAt: VirtualTime | null;
  readonly abandoned: boolean; // degradation 5: not updated since
}

export interface TrafficLogEntry {
  readonly kind: "traffic_log";
  readonly callerId: string;
  readonly calleeId: string;
  readonly group: string; // Virve talkgroup
  readonly startedAt: VirtualTime;
  readonly durationSeconds: number;
  readonly content: string | null; // null = degradation 14, voice-only
}

export interface LateralTrafficEntry {
  // TIER 4. Never pushed, in any condition.
  readonly kind: "lateral_traffic";
  readonly speakerUnitId: string;
  readonly addresseeUnitId: string; // both, so laterality is visible
  readonly at: VirtualTime;
  readonly content: string; // Finnish
  readonly droppedFromChannelSummary: boolean; // authored, per cycle
}

export interface AerialObservation {
  readonly kind: "aerial_observation";
  readonly platform: "drone" | "helicopter" | "fixed_wing";
  readonly platformId: string;
  readonly at: VirtualTime;
  readonly geometry: Polygon | LatLon;
  readonly text: string;
  readonly available: boolean; // false once the platform is grounded
}

export interface ReferenceDatum {
  readonly kind: "reference";
  readonly surface: Extract<RecordSurface, `reference_${string}`>;
  readonly featureId: string;
  readonly fields: Readonly<Record<string, string | number | null>>;
  readonly registerUpdatedAt: string; // ISO date. Accurate, complete, OUT OF DATE
}

export interface WeatherObservation {
  readonly kind: "weather";
  readonly at: VirtualTime;
  readonly windMeanMs: number;
  readonly windGustMs: number;
  readonly windDirectionDeg: number;
  readonly temperatureC: number;
  readonly relativeHumidity: number;
  readonly precipitationMm: number;
  readonly ffmc: number;
  readonly dmc: number;
  readonly dc: number;
  readonly isi: number;
  readonly bui: number;
  readonly fwi: number;
}

/** SPEC/04 revision (g): recorded, machine-transcribed authority talk-group traffic (SPEC/19 §3.5-3.6). */
export interface RadioTrafficRecord {
  readonly kind: "radio_traffic";
  readonly talkGroup: "JOHTO" | "TOIMINTA-1" | "TOIMINTA-2" | "ILMA" | "YHTEISTOIMINTA"; // placeholders, SPEC/19 §2
  readonly startAt: VirtualTime;
  readonly durationS: number;
  readonly speaker: string;
  readonly addressees: readonly string[];
  readonly transcriptFi: string | null; // null = metadata only
  readonly transcriptionConfidence: "low" | "medium" | "high" | null;
  readonly lateral: boolean; // T4 when true
}

export type RecordPayload =
  | TaskRecord
  | SituationLogEntry
  | UnitStatusRecord
  | TrafficLogEntry
  | LateralTrafficEntry
  | AerialObservation
  | ReferenceDatum
  | WeatherObservation
  | RadioTrafficRecord;

// ---------------------------------------------------------------------------
// §5 degradation encoding
// ---------------------------------------------------------------------------

export type DegradationForm =
  | "local_place_name" // 1
  | "unitless_number" // 2
  | "unmarked_hearsay" // 3
  | "typed_not_observed_time" // 4
  | "stale_status" // 5
  | "conflicting_duplicate" // 6
  | "workload_gap" // 7  — a property of a SPAN, see below
  | "implication_no_cause" // 8
  | "ambiguous_silence" // 9  — a property of a SPAN
  | "silent_correction" // 10
  | "dual_location" // 11
  | "field_overflow" // 12
  | "abbreviation_collision" // 13
  | "voice_only"; // 14

export type GapClass = "imprecise" | "misfiled" | "stale" | "workload_gap" | "voice_only" | "never_recorded";

export interface Degradation {
  readonly form: DegradationForm;
  readonly note: string; // what exactly is degraded, for the reviewer
  readonly gapClass: GapClass;
}

/** Forms 7 and 9 are spans, not records. They are authored as absences. */
export interface RecordGap {
  readonly id: string;
  readonly surface: RecordSurface;
  readonly unitId: string | null; // null = the whole log thinned
  readonly from: VirtualTime;
  readonly to: VirtualTime;
  readonly form: "workload_gap" | "ambiguous_silence";
  readonly whatWasHappening: string; // truth-side only; NEVER rendered
}

// ---------------------------------------------------------------------------
// §6 cycles, envelopes, channel — plus SPEC/12 §5, §10 rendering additions
// ---------------------------------------------------------------------------

/** SPEC/12 §10 §5: an observed rate of spread. Data, not projection. A flank with none for a cycle renders the `unknown` badge. */
export interface RateMark {
  readonly id: string;
  readonly cycle: CycleIndex;
  readonly flank: "head" | "north" | "south" | "east" | "west" | "rear";
  readonly anchor: LatLon; // on the reported perimeter
  readonly bearingDeg: number;
  readonly rateMetresPerMinute: number;
  readonly provenance: Provenance; // source, observedAt, age, certainty
  readonly consistentWithEnvelope: boolean; // TRUTH. Never rendered
}

/** SPEC/12 §10: disappears (null geometry) once the platform is grounded — absence is the signal. */
export interface SensorFootprint {
  readonly platformId: string;
  readonly cycle: CycleIndex;
  readonly geometry: Polygon | null;
}

/**
 * SPEC/12 §6.2, §10: the participant's own allocation, echoed back on the
 * map in the anticipated-status convention (solid symbol at the reported
 * position, dashed symbol at the assigned sector). No truth field — but a
 * real one must exist only for an asset the participant actually assigned
 * (SPEC/12 §11 `test/render/no-recommendation.spec`); it is never authored
 * scenario content, so it does not appear in `ScenarioContract` itself,
 * unlike `AllocationRecommendation`.
 */
export interface AllocationMark {
  readonly assetId: string;
  readonly fromPosition: LatLon; // solid symbol, last reported
  readonly toSectorId: string; // dashed symbol, assigned
  readonly taskId: string;
  readonly assignedAtCycle: CycleIndex;
}

export interface CycleSpec {
  readonly index: CycleIndex;
  readonly phase: Phase;
  readonly title: string; // internal; not shown
  readonly startsAtVirtual: VirtualTime; // (index-1) * 1200
  readonly clockLabel: string; // "14:35", shown on the map
  readonly pushedAtomIds: readonly string[]; // T1, with per-atom delivery offsets
  readonly deliveryOffsetsSeconds: readonly number[]; // parallel array, real seconds
  readonly perimeter: Polygon; // last reported situation
  readonly unitPositions: Readonly<Record<string, LatLon>>;
  readonly actualPerimeterAtEnd: Polygon; // TRUTH. Resolves the judgement.
  readonly probeIds: readonly string[];
  readonly gaps: readonly RecordGap[];
  readonly rateMarks: readonly RateMark[]; // SPEC/12 §5
  readonly sensorFootprints: readonly SensorFootprint[]; // SPEC/12 §6.5, §10
}

export type Flag = "holds" | "breach_quantitative" | "breach_categorical";

export interface Envelope {
  readonly cycle: CycleIndex;
  readonly polygon: Polygon; // exactly one. Never nested — see 12 §3
  readonly certainty: Certainty; // rendered on the stroke, not as bands
  readonly attribution: string; // which system produced it, and when
  readonly horizonVirtual: VirtualTime; // always the next cycle boundary
  readonly horizonLabel: string; // "ennuste voimassa klo 15:05 saakka"
  readonly flag: Flag; // TRUTH. Never rendered.
  readonly breachGeometry?: Polygon; // TRUTH. Where it fails.
  readonly containmentToleranceMetres: number; // declared, used in scoring
  readonly isOmissionCycle: boolean;
}

/** Optional feature, SPEC/08 §7 — decision deferred to pilot. Defined so the type exists if adopted. */
export interface RevisionEnvelope {
  readonly cycle: CycleIndex;
  readonly polygon: Polygon;
  readonly flag: Flag;
}

/** Closed vocabulary of 6-8, fixed before the study. Not currently blocking: SPEC/03 revision (g) — the channel is unused while the AI is pull-only. */
export type SituationCategory = string & { readonly __brand: "SituationCategory" };

export interface ChannelSignal {
  readonly category: SituationCategory;
  readonly urgency: 0 | 1 | 2 | 3; // orthogonal to category
  readonly certainty: Certainty;
  readonly attribution: readonly string[]; // named sources
  readonly quiet: boolean; // explicit all-clear
  readonly text: string; // from the closed template set only
  readonly derivedFromAtomIds: readonly string[]; // CI: all must exist
}

export interface ChannelSignalSet {
  readonly cycle: CycleIndex;
  readonly emitAtOffsetSeconds: number; // fixed offset into the working period
  readonly signals: readonly ChannelSignal[];
  readonly trafficSummary: string; // the T4 compression
  readonly trafficSummaryOmitsAtomIds: readonly string[]; // AUTHORED. Not incidental.
  readonly restatesIntent: boolean; // phase B only
  readonly alignmentFlag?: "aligned" | "diverging" | "unknown";
}

export interface DutyOfficerMessage {
  readonly cycle: CycleIndex;
  readonly at: VirtualTime;
  readonly text: string; // Finnish
  readonly isStrategicGuidance: boolean; // true exactly once, at the hinge
  readonly expectsReply: boolean;
}

// ---------------------------------------------------------------------------
// §7 allocation and branches
// ---------------------------------------------------------------------------

export interface Sector {
  readonly id: string;
  readonly label: string;
  readonly geometry: Polygon;
}

export interface Asset {
  readonly id: string; // "EK11", "HELI1", "DRONE1"
  readonly label: string;
  readonly type: "pelastusyksikko" | "sailioauto" | "maastoyksikko" | "helikopteri" | "drone" | "johtoauto";
  readonly availableFromCycle: CycleIndex;
  readonly availableUntilCycle: CycleIndex | null;
}

export interface TaskOption {
  readonly id: string;
  readonly label: string;
  readonly appliesToTypes: readonly string[];
}

export interface Allocation {
  readonly assignments: Readonly<
    Record<
      string /* assetId */,
      {
        readonly sectorId: string;
        readonly taskId: string;
      }
    >
  >;
}

export interface AllocationScore {
  readonly allocationKey: string; // canonical sorted serialisation
  readonly perBranch: Readonly<
    Record<
      string /* branchId */,
      {
        readonly viable: boolean;
        readonly robust: boolean;
        readonly safe: boolean; // crew exposure. SCORED SEPARATELY.
        readonly optionsForeclosed: readonly string[];
      }
    >
  >;
}

export interface AllocationSpace {
  readonly sectors: readonly Sector[];
  readonly assets: readonly Asset[];
  readonly tasks: readonly TaskOption[];
  readonly viability: readonly AllocationScore[]; // pre-computed, 20-60 allocations
}

export interface Branch {
  readonly id: string;
  readonly label: string;
  readonly divergesAtCycle: CycleIndex;
  readonly variedFactor: "weather" | "discrete_event" | "resource";
  readonly description: string;
  readonly perimeterByCycle: Readonly<Record<number, Polygon>>;
}

/**
 * SPEC/03 revision (d), SPEC/04 revision (d): the per-cycle Finnish
 * phrasing of a candidate development, presented after a `fundamentally_wrong`
 * judgement (HANDOFF §5.3). `branchId` is this statement's own id — distinct
 * from the ~5 scenario-level {@link Branch} entries it is drawn from; there
 * are up to 4 statements x 25 cycles, far more than 5 branches.
 */
export interface BranchStatement {
  readonly branchId: string;
  readonly cycle: CycleIndex | WarmupIndex;
  readonly statementFi: string;
  /** TRUTH. Exactly one true per cycle, none at the omission cycle. Stripped before render (I4). */
  readonly truth: BranchStatementTruth;
}

export interface BranchStatementTruth {
  readonly isActualDevelopment: boolean;
}

// ---------------------------------------------------------------------------
// §8 probes — amendment (Type S / PROBING_ONLINE) + revision (d) (branch choice)
// ---------------------------------------------------------------------------

export type ProbeType = "R" | "J" | "E" | "F" | "U" | "S"; // S = SPAM, online (amendment)
export type ProbeMode = "PROBING_VISIBLE" | "PROBING_BLANKED" | "ONLINE"; // amendment

export interface LocalisedOption {
  readonly id: string;
  readonly fi: string;
}

export type ResponseSpec =
  | { readonly kind: "categorical"; readonly options: readonly LocalisedOption[] }
  | { readonly kind: "numeric"; readonly min: number; readonly max: number; readonly step: number; readonly unit: string }
  | { readonly kind: "confidence"; readonly min: 0; readonly max: 100 }
  | { readonly kind: "map_point" }
  | { readonly kind: "map_polygon"; readonly maxVertices: number; readonly minVertices?: number } // minVertices: handoff §5.3 / SPEC/04 revision (d), "3-12"
  | { readonly kind: "free_text"; readonly maxChars: number }
  | { readonly kind: "containment_three_way" }; // see 08 §3.2

export interface ProbeSpec {
  readonly id: string;
  readonly type: ProbeType;
  readonly mode: ProbeMode; // blanking is a probe property
  readonly cycle: CycleIndex | WarmupIndex; // amendment
  readonly orderWithinCycle: number;
  readonly invariantName: string; // must exist in `invariants`
  readonly prompt: string; // Finnish
  readonly response: ResponseSpec;
  readonly counterbalanceGroup?: "A" | "B"; // expectation-marking order
  readonly offsetInWorkingPeriodMs?: number; // required iff type === "S"
  readonly readyTimeoutMs?: number; // S only, default 20000
  readonly answerTimeoutMs?: number; // S only, default 30000
  readonly collectsConfidence: boolean; // true for R, J, S, E
  readonly contentKind: "situation" | "intent";
  readonly saLevel?: 1 | 2 | 3; // required for R and S
}

export interface ProbeSchedule {
  readonly probes: readonly ProbeSpec[];
}

/** The three-way containment response. The binary is DERIVED, never collected. */
export type ContainmentJudgement = "holds" | "partly_wrong" | "fundamentally_wrong";

/** SPEC/04 revision (d): starts unset; submission requires non-null. */
export type ConfidenceValue = number | null;

export interface ContainmentResponse {
  readonly judgement: ContainmentJudgement;
  readonly confidence: ConfidenceValue; // 0-100, or null until the participant interacts
  readonly breachPoint?: LatLon; // required iff partly_wrong
  readonly correctedProjection?: Polygon; // required iff fundamentally_wrong
  readonly selectedBranchId?: string | "none_of_these"; // only after fundamentally_wrong
  readonly branchPresentedOrder?: readonly string[]; // four authored + "none_of_these" last
}

// ---------------------------------------------------------------------------
// §11 session configuration — revision (d): Cell replaces guidanceMode
// ---------------------------------------------------------------------------

export interface SessionConfig {
  readonly condition: ConditionId;
  readonly participantCode: string;
  readonly scenario: ScenarioContract;
  readonly pointerTrackHz: 0 | 10; // 0 = off (default)
  readonly idleThresholdSeconds: 5;
  readonly hingePauseSeconds: 300;
  readonly allowResume: true; // see 05 §7
  readonly echelon: Echelon;
  readonly warmupEnabled: true;
  readonly cell: Cell;
}

// ---------------------------------------------------------------------------
// Well-known constants referenced by the validator (SPEC/03 §4.2, §6.2, §10; SPEC/02 §3)
// ---------------------------------------------------------------------------

/** SPEC/03 §4.2: the exact 20-cycle flag sequence. Ten holds, six quantitative, four categorical. */
export const CANONICAL_FLAG_SEQUENCE: readonly Flag[] = [
  "holds", "holds", "breach_quantitative", "holds", "breach_quantitative", "breach_categorical", "holds",
  "breach_quantitative", "breach_categorical", "holds", // 1-10
  "holds", "breach_categorical", "holds", "breach_quantitative", "breach_categorical", "holds",
  "breach_quantitative", "holds", "breach_quantitative", "holds", // 11-20
];

/** SPEC/03 §6.2: containment base rate target band. */
export const CONTAINMENT_HOLDS_MIN = 0.45;
export const CONTAINMENT_HOLDS_MAX = 0.55;

/**
 * SPEC/02 §3: per-tier absolute count bands (the table's literal "Count"
 * column — unambiguous, unlike deriving a "share" fraction would be, since
 * the total corpus size is itself only a range, 290-400).
 */
export const TIER_COUNT_BANDS: Readonly<Record<Tier, { readonly min: number; readonly max: number }>> = {
  T1_pushed: { min: 90, max: 120 },
  T2_system: { min: 80, max: 110 },
  T3_person: { min: 70, max: 100 },
  T4_lateral: { min: 50, max: 70 },
};

/** SPEC/02 §3.2: the three named load-bearing T4 items. */
export const LOAD_BEARING_T4_IDS = ["t4.ember_warning", "t4.private_doubt", "t4.water_state"] as const;
