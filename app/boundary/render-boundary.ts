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
import type { Degradation, InfoAtom, Provenance, RecordPayload } from "../scenario/types.js";

/** Everything the render layer may ever see. Deliberately a narrow allowlist, not "InfoAtom minus truth" — fields not named here (tier, origin, cycle, loadBearing, routes, retrievalKeys, consequence, truth) never cross either. */
export interface RenderableAtom {
  readonly id: string;
  readonly record: RecordPayload;
  readonly provenance: Provenance;
  readonly degradationVisible: readonly Degradation["form"][]; // only what is inferable — the form tag, never the reviewer-only `note`
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

/**
 * The only function permitted to cross the render boundary. Exhaustive
 * (every `RenderableAtom` field is populated from a named `InfoAtom`
 * field, nothing is spread), total (never throws on a well-typed
 * `InfoAtom`), and freezes its output deeply so a render-layer bug cannot
 * mutate the atom in place. Runs the presence assertion before returning,
 * so a structurally-impossible-but-runtime-real leak still fails loudly
 * rather than silently reaching a component.
 */
export function toRenderable(atom: InfoAtom): RenderableAtom {
  const renderable: RenderableAtom = {
    id: atom.id,
    record: atom.record,
    provenance: atom.provenance,
    degradationVisible: atom.degradation.map((d) => d.form),
  };
  assertNoTruthKeysPresent(renderable);
  return deepFreeze(renderable);
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
