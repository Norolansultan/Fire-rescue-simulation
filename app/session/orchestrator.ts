/**
 * The session orchestrator — the boundary-crossing layer between
 * truth-bearing scenario content and the render layer, in the same
 * spirit as `test/boundary/golden-render-run.ts`: it is the one place
 * allowed to touch a raw `ScenarioContract`, `InfoAtom` or `Envelope`.
 * Everything it exposes to the UI (`SessionSnapshot`) is built from
 * `Renderable*` types plus plain UI state — never truth.
 *
 * Drives the real `EngineRunLoop` (M1) and `SessionLog` (M4), and
 * follows the primary loop from `HANDOFF_Projection_Judgement_Loop.md`:
 * working period -> envelope reveal -> three-way judgement -> confidence
 * -> follow-up (breach point, or draw-then-choose) -> verification ->
 * allocation -> cycle end. Preflight, briefing, the warm-up prologue,
 * SPAM probes and the decision task are out of scope for this preview
 * (see `app/render/ui/README.md`).
 */

import { toRenderable, toRenderableBranchStatement, toRenderableEnvelope } from "../boundary/render-boundary.js";
import type { RenderableAtom, RenderableBranchStatement, RenderableEnvelope } from "../boundary/render-boundary.js";
import { EngineRunLoop } from "../engine/run-loop.js";
import type { CycleIndex, LatLon, Polygon } from "../engine/primitives.js";
import { retrieveClosed } from "../retrieval/closure.js";
import { appendTelemetryEvent } from "../telemetry/emit.js";
import { InMemoryLogSink, SessionLog, type LogHeader } from "../telemetry/log.js";
import { applyRenderEvent, EMPTY_RENDER_TREE, type RenderTree } from "../render/render-tree.js";
import type { AllocationMark, ContainmentJudgement, ScenarioContract } from "../scenario/types.js";

export type JudgementStep =
  | "working"
  | "judging"
  | "confidence"
  | "follow_up_breach_point"
  | "follow_up_draw"
  | "follow_up_branch"
  | "verification"
  | "allocation"
  | "hinge_pause"
  | "complete";

export interface SessionSnapshot {
  readonly currentCycle: CycleIndex;
  readonly phase: "A" | "B";
  readonly clockLabel: string;
  readonly step: JudgementStep;
  readonly renderTree: RenderTree;
  readonly currentEnvelope: RenderableEnvelope | null;
  readonly branchList: readonly RenderableBranchStatement[];
  readonly judgement: ContainmentJudgement | null;
  readonly confidence: number | null;
  readonly breachPoint: LatLon | null;
  readonly correctedPolygon: Polygon | null;
  readonly selectedBranchId: string | null;
  readonly logRecordCount: number;
  readonly conditionLabel: "directed" | "substitutive";
}

type Listener = (snapshot: SessionSnapshot) => void;

export class SessionOrchestrator {
  private readonly loop = new EngineRunLoop();
  private readonly log: SessionLog;
  private renderTree: RenderTree = EMPTY_RENDER_TREE;
  private step: JudgementStep = "working";
  private judgement: ContainmentJudgement | null = null;
  private confidence: number | null = null;
  private breachPoint: LatLon | null = null;
  private correctedPolygon: Polygon | null = null;
  private selectedBranchId: string | null = null;
  private currentBranchList: RenderableBranchStatement[] = [];
  private listeners: Listener[] = [];
  private currentCycle: CycleIndex = 1;

  constructor(
    private readonly scenario: ScenarioContract,
    private readonly condition: "directed" | "substitutive",
  ) {
    const header: LogHeader = {
      formatVersion: "0.1.0", sessionId: "preview-session", participantCode: "preview",
      condition, scenarioId: scenario.id, scenarioVersion: scenario.version, seed: scenario.seed.toString(),
      bundleHash: "preview-bundle", appVersion: "0.1.0", startedAtIso: new Date(0).toISOString(),
      userAgent: "preview-ui", viewport: { w: 1280, h: 800, dpr: 1 },
      counterbalance: { expectationOrder: "A" }, cell: condition === "directed" ? "radio" : "reasoning_once", echelon: "command",
    };
    this.log = new SessionLog(header, new InMemoryLogSink());
  }

  subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    listener(this.snapshot());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const snapshot = this.snapshot();
    for (const l of this.listeners) l(snapshot);
  }

  private snapshot(): SessionSnapshot {
    const cycleSpec = this.scenario.cycles.find((c) => c.index === this.currentCycle)!;
    return {
      currentCycle: this.currentCycle,
      phase: cycleSpec.phase,
      clockLabel: cycleSpec.clockLabel,
      step: this.step,
      renderTree: this.renderTree,
      currentEnvelope: this.renderTree.envelope,
      branchList: this.currentBranchList,
      judgement: this.judgement,
      confidence: this.confidence,
      breachPoint: this.breachPoint,
      correctedPolygon: this.correctedPolygon,
      selectedBranchId: this.selectedBranchId,
      logRecordCount: this.log.currentSeq(),
      conditionLabel: this.condition,
    };
  }

  /** Boots BOOT -> RUNNING and starts cycle 1's working period. */
  async start(): Promise<void> {
    for (const trigger of ["start", "preflight_passed", "briefing_complete", "warmup_complete", "tutorial_complete"] as const) {
      const event = this.loop.transition(trigger);
      await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, { kind: "state_transition", detail: event });
    }
    await this.enterCycle(1 as CycleIndex);
  }

  private async enterCycle(index: CycleIndex): Promise<void> {
    this.currentCycle = index;
    this.step = "working";
    this.judgement = null;
    this.confidence = null;
    this.breachPoint = null;
    this.correctedPolygon = null;
    this.selectedBranchId = null;
    this.currentBranchList = [];

    const cycleSpec = this.scenario.cycles.find((c) => c.index === index)!;
    this.renderTree = applyRenderEvent(EMPTY_RENDER_TREE, { kind: "cycle_start", cycle: cycleSpec });
    await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, { kind: "cycle_start", detail: { cycle: index, phase: cycleSpec.phase, clockLabel: cycleSpec.clockLabel } });

    for (const atomId of cycleSpec.pushedAtomIds) {
      const atom = this.scenario.atoms.find((a) => a.id === atomId)!;
      this.renderTree = applyRenderEvent(this.renderTree, { kind: "bubble_delivered", atom });
      const renderable: RenderableAtom = toRenderable(atom);
      await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, { kind: "bubble_available", detail: { atomId: renderable.id, mapPosition: null, tier: atom.tier, sourceId: atom.provenance.sourceId } });
    }
    this.notify();
  }

  /** Working period -> envelope reveal -> judging. */
  async revealEnvelope(): Promise<void> {
    const envelope = this.scenario.envelopes.find((e) => e.cycle === this.currentCycle)!;
    this.renderTree = applyRenderEvent(this.renderTree, { kind: "envelope_revealed", envelope });
    await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, { kind: "envelope_revealed", detail: { cycle: this.currentCycle, envelopeId: `envelope.cycle_${this.currentCycle}` } });
    this.step = "judging";
    this.notify();
  }

  async submitJudgement(judgement: ContainmentJudgement): Promise<void> {
    this.judgement = judgement;
    this.step = "confidence";
    this.notify();
  }

  async submitConfidence(value: number): Promise<void> {
    this.confidence = value;
    if (this.judgement === "holds") {
      await this.finishJudgement();
      return;
    }
    this.step = this.judgement === "partly_wrong" ? "follow_up_breach_point" : "follow_up_draw";
    this.notify();
  }

  async markBreachPoint(point: LatLon): Promise<void> {
    this.breachPoint = point;
    await this.finishJudgement();
  }

  async submitCorrection(polygon: Polygon): Promise<void> {
    this.correctedPolygon = polygon;
    this.renderTree = applyRenderEvent(this.renderTree, { kind: "correction_drawn", correction: { correctedPolygon: polygon } });
    this.currentBranchList = this.scenario.branchStatements
      .filter((b) => b.cycle === this.currentCycle)
      .map(toRenderableBranchStatement);
    await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, {
      kind: "branch_list_presented",
      detail: { probeId: `probe.j.cycle_${this.currentCycle}`, statementIds: [...this.currentBranchList.map((b) => b.branchId), "none_of_these"] },
    });
    this.renderTree = applyRenderEvent(this.renderTree, {
      kind: "branch_list_presented",
      statements: this.scenario.branchStatements.filter((b) => b.cycle === this.currentCycle),
    });
    this.step = "follow_up_branch";
    this.notify();
  }

  async selectBranch(branchId: string): Promise<void> {
    this.selectedBranchId = branchId;
    await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, { kind: "branch_selected", detail: { statementId: branchId as string | "none_of_these" } });
    await this.finishJudgement();
  }

  private async finishJudgement(): Promise<void> {
    await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, {
      kind: "containment_judgement_submitted",
      detail: {
        probeId: `probe.j.cycle_${this.currentCycle}`,
        judgement: this.judgement!,
        confidence: this.confidence!,
        ...(this.breachPoint ? { breachPoint: this.breachPoint } : {}),
        ...(this.correctedPolygon ? { correctedProjection: this.correctedPolygon } : {}),
      },
    });
    this.step = "verification";
    this.notify();
  }

  proceedToAllocation(): void {
    this.step = "allocation";
    this.notify();
  }

  async submitAllocation(marks: readonly AllocationMark[], rationaleFi: string): Promise<void> {
    this.renderTree = applyRenderEvent(this.renderTree, { kind: "allocation_submitted", marks });
    await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, {
      kind: "allocation_submitted",
      detail: { assignments: Object.fromEntries(marks.map((m) => [m.assetId, { sectorId: m.toSectorId, taskId: m.taskId }])), rationaleFi },
    });

    const finished = this.currentCycle;
    this.loop.endCycle();
    await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, { kind: "cycle_end", detail: { cycle: finished, totalRealDurationMs: 0 } });

    if (finished === 10) {
      this.step = "hinge_pause";
      this.notify();
      return;
    }
    if (finished === 20) {
      this.step = "complete";
      this.notify();
      return;
    }
    await this.enterCycle((finished + 1) as CycleIndex);
  }

  /**
   * Haku / Avaa tekoäly / Radio all resolve to the same closed,
   * deterministic retrieval (I6 — "structurally incapable of generating
   * text"): searching, asking the AI drawer, and asking a named unit are
   * three different *queries* over the same never-generative corpus, not
   * three different retrieval mechanisms. Only atoms belonging to a cycle
   * already reached are searchable — the corpus does not leak the future.
   */
  private searchableCorpus() {
    return this.scenario.atoms.filter((a) => a.cycle <= this.currentCycle);
  }

  searchAtoms(query: string): readonly RenderableAtom[] {
    return retrieveClosed(query, this.searchableCorpus()).map(toRenderable);
  }

  askUnit(unitId: string): readonly RenderableAtom[] {
    return this.searchableCorpus()
      .filter((a) => a.provenance.sourceId === unitId)
      .map(toRenderable);
  }

  async dismissHinge(): Promise<void> {
    this.loop.dismissHinge();
    await appendTelemetryEvent(this.log, this.loop.clock.now(), 0, { kind: "hinge_pause_end", detail: { realDurationMs: 0, dismissedEarly: true } });
    await this.enterCycle(11 as CycleIndex);
  }
}
