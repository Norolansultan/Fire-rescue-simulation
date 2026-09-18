/**
 * The live render tree — the "what is currently rendered" snapshot that
 * SPEC/10_Build_Plan_and_Acceptance.md's M3 acceptance test walks:
 * "`test/boundary/no-truth.spec` walks the live render tree at every
 * logged `seq` of a golden run and asserts no reachable object contains
 * any `TruthAnnotation` key."
 *
 * This module owns exactly one responsibility: turning a stream of
 * scenario events (which carry truth — real `InfoAtom`s, real
 * `Envelope`s with their flags) into a tree built only from `Renderable*`
 * types. Every event handler calls the matching `toRenderableX` function
 * from `app/boundary/render-boundary.ts` as the *first* thing it does
 * with truth-bearing input — this module IS the type boundary I4
 * describes ("stripped at a type boundary before any payload crosses
 * into rendering"), not a consumer of it.
 *
 * Deliberately NOT here: an actual map, DOM, or MapLibre binding. That is
 * the part of M3 that needs real geographic tile data (PMTiles, via the
 * not-yet-built `tools/bundle/`) and a browser/WebGL test harness this
 * environment has not been asked to stand up — see the M3 scope note in
 * `test/boundary/no-truth.spec.ts` for the full accounting of what is and
 * isn't attempted. This module is the part of "the render boundary and
 * map" milestone that is pure logic, fully testable in Node, and does not
 * depend on any of that.
 */

import {
  toRenderable,
  toRenderableBranchStatement,
  toRenderableCycle,
  toRenderableEnvelope,
  type RenderableAtom,
  type RenderableBranchStatement,
  type RenderableCycle,
  type RenderableEnvelope,
} from "../boundary/render-boundary.js";
import type { LatLon, Polygon } from "../engine/primitives.js";
import type { AllocationMark, BranchStatement, CycleSpec, Envelope, InfoAtom } from "../scenario/types.js";

export interface RenderedCorrection {
  readonly breachPoint?: LatLon; // partly_wrong follow-up
  readonly correctedPolygon?: Polygon; // fundamentally_wrong follow-up
}

export interface RenderTree {
  readonly cycleInfo: RenderableCycle | null;
  /** New bubbles announce themselves here; scrollable back within the current cycle only (SPEC/06 §2.1) — cleared at cycle_start, not carried forward. */
  readonly bubbles: readonly RenderableAtom[];
  readonly envelope: RenderableEnvelope | null;
  readonly correction: RenderedCorrection | null;
  /** Only ever populated by an explicit `allocation_submitted` event — never seeded from scenario content. SPEC/12 §11 `test/render/no-recommendation.spec`. */
  readonly allocationMarks: readonly AllocationMark[];
  readonly branchStatementsShown: readonly RenderableBranchStatement[];
}

export const EMPTY_RENDER_TREE: RenderTree = Object.freeze({
  cycleInfo: null,
  bubbles: [],
  envelope: null,
  correction: null,
  allocationMarks: [],
  branchStatementsShown: [],
});

export type RenderEvent =
  | { readonly kind: "cycle_start"; readonly cycle: CycleSpec }
  | { readonly kind: "bubble_delivered"; readonly atom: InfoAtom }
  | { readonly kind: "envelope_revealed"; readonly envelope: Envelope }
  | { readonly kind: "correction_drawn"; readonly correction: RenderedCorrection }
  | { readonly kind: "allocation_submitted"; readonly marks: readonly AllocationMark[] }
  | { readonly kind: "branch_list_presented"; readonly statements: readonly BranchStatement[] };

/**
 * Applies one event to a tree, returning a new tree (never mutates
 * `tree`). `cycle_start` resets every per-cycle field — nothing is pushed
 * again after its arrival, and the previous cycle's envelope/correction/
 * allocation marks do not leak into the next cycle's picture.
 */
export function applyRenderEvent(tree: RenderTree, event: RenderEvent): RenderTree {
  switch (event.kind) {
    case "cycle_start":
      return {
        ...EMPTY_RENDER_TREE,
        cycleInfo: toRenderableCycle(event.cycle),
      };
    case "bubble_delivered":
      return { ...tree, bubbles: [...tree.bubbles, toRenderable(event.atom)] };
    case "envelope_revealed":
      return { ...tree, envelope: toRenderableEnvelope(event.envelope) };
    case "correction_drawn":
      return { ...tree, correction: event.correction };
    case "allocation_submitted":
      return { ...tree, allocationMarks: event.marks };
    case "branch_list_presented":
      return { ...tree, branchStatementsShown: event.statements.map(toRenderableBranchStatement) };
  }
}

/** Folds a sequence of events into the tree at every step — used by `no-truth.spec` to check every intermediate state, not just the final one. */
export function renderTreeTimeline(events: readonly RenderEvent[]): RenderTree[] {
  const timeline: RenderTree[] = [];
  let tree = EMPTY_RENDER_TREE;
  for (const event of events) {
    tree = applyRenderEvent(tree, event);
    timeline.push(tree);
  }
  return timeline;
}
