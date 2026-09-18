/**
 * The render boundary — invariant I4 (SPEC/00_README.md §3):
 *
 * "TruthAnnotation is stripped at a type boundary before any payload
 * crosses into rendering. This is the bug class that would silently
 * invalidate the study and remain invisible until analysis."
 *
 * SPEC/04_Data_Model.md §9 names three independent guards, "all three
 * exist; none alone is sufficient":
 *   1. A static guard (the `AssertNoTruth` conditional type below) — this
 *      is what M2's acceptance criterion ("the truth-boundary static guard
 *      compiles") checks.
 *   2. A runtime guard: "a frozen deep-clone at the boundary plus a
 *      property-presence assertion in development builds" — implemented
 *      here as {@link toRenderable} (freezes) and
 *      {@link assertNoTruthKeysPresent} (the presence assertion).
 *   3. An integration test that "walks the live render tree at every
 *      logged `seq` of a golden run" — that is M3's job (SPEC/10, M3),
 *      once there is an actual render tree to walk; it belongs in
 *      `test/boundary/no-truth.spec` against a real session, not here.
 */

import { sortedKeys } from "../engine/deterministic-object.js";
import type { CycleIndex, LatLon, Polygon, VirtualTime, WarmupIndex } from "../engine/primitives.js";
import type {
  BranchStatement,
  Certainty,
  CycleSpec,
  Degradation,
  Envelope,
  InfoAtom,
  Phase,
  Provenance,
  RateMark,
  RecordPayload,
  SensorFootprint,
} from "../scenario/types.js";

/** Everything the render layer may ever see. Deliberately a narrow allowlist, not "InfoAtom minus truth" — fields not named here (tier, origin, cycle, loadBearing, routes, retrievalKeys, consequence, truth) never cross either. */
export interface RenderableAtom {
  readonly id: string;
  readonly record: RecordPayload;
  readonly provenance: Provenance;
  readonly degradationVisible: readonly Degradation["form"][]; // only what is inferable — the form tag, never the reviewer-only `note`
}

/** Envelope minus its two explicitly-TRUTH fields (`flag`, `breachGeometry`, SPEC/04 §6) — AND minus `isOmissionCycle`. That field carries no `// TRUTH` comment in SPEC/04, but rendering it (or anything derived from it) would announce "this is the cycle where the hidden thing happens", defeating the omission's entire purpose (SPEC/03 §5). I4's stated purpose — "the bug class that would silently invalidate the study" — covers this even though the literal tag doesn't; excluded here rather than waiting for the spec to catch up. */
export interface RenderableEnvelope {
  readonly cycle: CycleIndex;
  readonly polygon: Polygon;
  readonly certainty: Certainty;
  readonly attribution: string;
  readonly horizonVirtual: VirtualTime;
  readonly horizonLabel: string;
  readonly containmentToleranceMetres: number;
}

/** RateMark minus `consistentWithEnvelope` (explicit TRUTH, SPEC/12 §10). */
export interface RenderableRateMark {
  readonly id: string;
  readonly cycle: CycleIndex;
  readonly flank: RateMark["flank"];
  readonly anchor: LatLon;
  readonly bearingDeg: number;
  readonly rateMetresPerMinute: number;
  readonly provenance: Provenance;
}

/**
 * CycleSpec pared down to what a map actually displays. Excludes
 * `actualPerimeterAtEnd` (explicit TRUTH: "Resolves the judgement");
 * `gaps` (each `RecordGap.whatWasHappening` is "truth-side only; NEVER
 * rendered" — SPEC/04 §5 — and a gap's whole point is to render as
 * nothing, so the render layer needs no gap data at all); `title`
 * ("internal; not shown"); and the push-scheduling fields
 * (`pushedAtomIds`, `deliveryOffsetsSeconds`, `probeIds`), which belong to
 * the delivery/probe orchestration layer, not the render layer — a bubble
 * reaches rendering through its own `bubble_available` event, not by the
 * render layer reading the schedule ahead of time.
 */
export interface RenderableCycle {
  readonly index: CycleIndex;
  readonly phase: Phase;
  readonly startsAtVirtual: VirtualTime;
  readonly clockLabel: string;
  readonly perimeter: Polygon;
  readonly unitPositions: Readonly<Record<string, LatLon>>;
  readonly rateMarks: readonly RenderableRateMark[];
  readonly sensorFootprints: readonly SensorFootprint[];
}

/** BranchStatement minus `truth` (SPEC/04 revision 2026-09-17, "Stripped before render (I4)"). */
export interface RenderableBranchStatement {
  readonly branchId: string;
  readonly cycle: CycleIndex | WarmupIndex;
  readonly statementFi: string;
}

/** Compile-time guard: RenderableAtom must not structurally admit a `truth` key. Must not be `never`. */
export type AssertNoTruth<T> = T extends { truth: unknown } ? never : T;
export type _Check = AssertNoTruth<RenderableAtom>; // must not be `never` — a `never` here would mean this file itself fails to compile

/** The exact key names of `TruthAnnotation` (SPEC/04 §3.2). Kept as a literal list, independent of the type, so the runtime check does not rely on the same code path it is meant to catch mistakes in. */
const TRUTH_ANNOTATION_KEYS = [
  "isGroundTruth",
  "isDecoy",
  "contradictionRole",
  "relevantInvariants",
  "tierRationale",
  "saidOn",
] as const;

export class TruthLeakError extends Error {
  constructor(readonly path: string, readonly key: string) {
    super(`Truth annotation key "${key}" reachable from the render layer at ${path || "<root>"}`);
    this.name = "TruthLeakError";
  }
}

/**
 * Recursively walks a value and throws {@link TruthLeakError} if any
 * object in the graph carries a key from {@link TRUTH_ANNOTATION_KEYS}.
 * This is a property-presence assertion, not a type check — it exists to
 * catch a `TruthAnnotation` (or a fragment of one) smuggled in somewhere
 * the type system did not anticipate, e.g. nested inside a `ReferenceDatum`'s
 * open `fields` record.
 */
export function assertNoTruthKeysPresent(value: unknown, path = ""): void {
  if (value === null || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertNoTruthKeysPresent(item, `${path}[${i}]`));
    return;
  }
  const record = value as Record<string, unknown>;
  for (const key of sortedKeys(record)) {
    if ((TRUTH_ANNOTATION_KEYS as readonly string[]).includes(key)) {
      throw new TruthLeakError(path, key);
    }
    assertNoTruthKeysPresent(record[key], path ? `${path}.${key}` : key);
  }
}

/** Runs the presence assertion, then deep-freezes. Shared tail for every `toRenderableX` function below, so each stays exhaustive (fields spelled out by name, nothing spread) while not repeating the guard/freeze pair. */
function finalize<T extends object>(renderable: T): T {
  assertNoTruthKeysPresent(renderable);
  return deepFreeze(renderable);
}

/**
 * The primary function permitted to cross the render boundary for atoms.
 * Exhaustive (every `RenderableAtom` field is populated from a named
 * `InfoAtom` field, nothing is spread), total (never throws on a
 * well-typed `InfoAtom`), and freezes its output deeply so a render-layer
 * bug cannot mutate the atom in place. Runs the presence assertion before
 * returning, so a structurally-impossible-but-runtime-real leak still
 * fails loudly rather than silently reaching a component.
 */
export function toRenderable(atom: InfoAtom): RenderableAtom {
  return finalize<RenderableAtom>({
    id: atom.id,
    record: atom.record,
    provenance: atom.provenance,
    degradationVisible: atom.degradation.map((d) => d.form),
  });
}

export function toRenderableEnvelope(envelope: Envelope): RenderableEnvelope {
  return finalize<RenderableEnvelope>({
    cycle: envelope.cycle,
    polygon: envelope.polygon,
    certainty: envelope.certainty,
    attribution: envelope.attribution,
    horizonVirtual: envelope.horizonVirtual,
    horizonLabel: envelope.horizonLabel,
    containmentToleranceMetres: envelope.containmentToleranceMetres,
  });
}

export function toRenderableRateMark(mark: RateMark): RenderableRateMark {
  return finalize<RenderableRateMark>({
    id: mark.id,
    cycle: mark.cycle,
    flank: mark.flank,
    anchor: mark.anchor,
    bearingDeg: mark.bearingDeg,
    rateMetresPerMinute: mark.rateMetresPerMinute,
    provenance: mark.provenance,
  });
}

export function toRenderableCycle(cycle: CycleSpec): RenderableCycle {
  return finalize<RenderableCycle>({
    index: cycle.index,
    phase: cycle.phase,
    startsAtVirtual: cycle.startsAtVirtual,
    clockLabel: cycle.clockLabel,
    perimeter: cycle.perimeter,
    unitPositions: cycle.unitPositions,
    rateMarks: cycle.rateMarks.map(toRenderableRateMark),
    sensorFootprints: cycle.sensorFootprints,
  });
}

export function toRenderableBranchStatement(statement: BranchStatement): RenderableBranchStatement {
  return finalize<RenderableBranchStatement>({
    branchId: statement.branchId,
    cycle: statement.cycle,
    statementFi: statement.statementFi,
  });
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  Object.freeze(value);
  const record = value as Record<string, unknown>;
  for (const key of sortedKeys(record)) {
    deepFreeze(record[key]);
  }
  return value;
}
