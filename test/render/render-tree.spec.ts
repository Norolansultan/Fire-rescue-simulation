import { describe, expect, it } from "vitest";
import { applyRenderEvent, EMPTY_RENDER_TREE, renderTreeTimeline, type RenderEvent } from "../../app/render/render-tree.js";
import { buildValidScenario } from "../scenario/fixtures/valid-scenario.js";

const scenario = buildValidScenario();
const cycle1 = scenario.cycles.find((c) => c.index === 1)!;
const cycle2 = scenario.cycles.find((c) => c.index === 2)!;
const envelope1 = scenario.envelopes.find((e) => e.cycle === 1)!;
const atom = scenario.atoms[0]!;

describe("applyRenderEvent", () => {
  it("cycle_start populates cycleInfo and resets everything else", () => {
    const tree = applyRenderEvent(EMPTY_RENDER_TREE, { kind: "cycle_start", cycle: cycle1 });
    expect(tree.cycleInfo?.index).toBe(1);
    expect(tree.bubbles).toEqual([]);
    expect(tree.envelope).toBeNull();
    expect(tree.correction).toBeNull();
    expect(tree.allocationMarks).toEqual([]);
    expect(tree.branchStatementsShown).toEqual([]);
  });

  it("bubble_delivered appends a renderable atom", () => {
    let tree = applyRenderEvent(EMPTY_RENDER_TREE, { kind: "cycle_start", cycle: cycle1 });
    tree = applyRenderEvent(tree, { kind: "bubble_delivered", atom });
    expect(tree.bubbles).toHaveLength(1);
    expect(tree.bubbles[0]!.id).toBe(atom.id);
  });

  it("envelope_revealed sets a renderable envelope", () => {
    const tree = applyRenderEvent(EMPTY_RENDER_TREE, { kind: "envelope_revealed", envelope: envelope1 });
    expect(tree.envelope?.cycle).toBe(1);
  });

  it("allocation_submitted replaces allocationMarks", () => {
    const marks = [{ assetId: "EK11", fromPosition: { lat: 60.8, lon: 27.0 }, toSectorId: "L1", taskId: "task.direct-attack", assignedAtCycle: 1 as const }];
    const tree = applyRenderEvent(EMPTY_RENDER_TREE, { kind: "allocation_submitted", marks });
    expect(tree.allocationMarks).toEqual(marks);
  });

  it("a new cycle_start clears bubbles, envelope and allocation marks from the previous cycle — nothing leaks forward", () => {
    let tree = applyRenderEvent(EMPTY_RENDER_TREE, { kind: "cycle_start", cycle: cycle1 });
    tree = applyRenderEvent(tree, { kind: "bubble_delivered", atom });
    tree = applyRenderEvent(tree, { kind: "envelope_revealed", envelope: envelope1 });
    tree = applyRenderEvent(tree, {
      kind: "allocation_submitted",
      marks: [{ assetId: "EK11", fromPosition: { lat: 60.8, lon: 27.0 }, toSectorId: "L1", taskId: "task.direct-attack", assignedAtCycle: 1 }],
    });
    expect(tree.bubbles).toHaveLength(1);

    tree = applyRenderEvent(tree, { kind: "cycle_start", cycle: cycle2 });
    expect(tree.cycleInfo?.index).toBe(2);
    expect(tree.bubbles).toEqual([]);
    expect(tree.envelope).toBeNull();
    expect(tree.allocationMarks).toEqual([]);
  });

  it("does not mutate the input tree (each call returns a new object)", () => {
    const before = EMPTY_RENDER_TREE;
    const after = applyRenderEvent(before, { kind: "cycle_start", cycle: cycle1 });
    expect(after).not.toBe(before);
    expect(before.cycleInfo).toBeNull(); // unchanged
  });
});

describe("renderTreeTimeline", () => {
  it("returns one tree snapshot per event, in order", () => {
    const events: RenderEvent[] = [
      { kind: "cycle_start", cycle: cycle1 },
      { kind: "bubble_delivered", atom },
      { kind: "envelope_revealed", envelope: envelope1 },
    ];
    const timeline = renderTreeTimeline(events);
    expect(timeline).toHaveLength(3);
    expect(timeline[0]!.cycleInfo?.index).toBe(1);
    expect(timeline[1]!.bubbles).toHaveLength(1);
    expect(timeline[2]!.envelope?.cycle).toBe(1);
  });

  it("is a pure function of the event sequence", () => {
    const events: RenderEvent[] = [{ kind: "cycle_start", cycle: cycle1 }, { kind: "bubble_delivered", atom }];
    const a = renderTreeTimeline(events);
    const b = renderTreeTimeline(events);
    expect(a).toEqual(b);
  });
});
