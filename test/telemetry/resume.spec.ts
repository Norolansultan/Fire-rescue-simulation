/**
 * SPEC/10_Build_Plan_and_Acceptance.md, M4: "`test/telemetry/resume.spec`
 * interrupts at each cycle boundary and asserts correct resume."
 */

import { describe, expect, it } from "vitest";
import { asVirtualTime } from "../../app/engine/primitives.js";
import { InMemoryLogSink, SessionLog, type LogHeader } from "../../app/telemetry/log.js";
import { appendTelemetryEvent } from "../../app/telemetry/emit.js";
import { planResume, resumeSession } from "../../app/telemetry/resume.js";
import type { CycleIndex } from "../../app/engine/primitives.js";

const HEADER: LogHeader = {
  formatVersion: "0.1.0", sessionId: "resume-test", participantCode: "p", condition: "directed", scenarioId: "s",
  scenarioVersion: "0.1.0", seed: "1", bundleHash: "b", appVersion: "0.1.0", startedAtIso: "2026-01-01T00:00:00.000Z",
  userAgent: "vitest", viewport: { w: 1280, h: 800, dpr: 1 }, counterbalance: { expectationOrder: "A" }, cell: "radio", echelon: "command",
};

async function makeLogThroughCycles(completedCycles: number): Promise<SessionLog> {
  const log = new SessionLog(HEADER, new InMemoryLogSink());
  for (let c = 1; c <= completedCycles; c++) {
    await appendTelemetryEvent(log, asVirtualTime((c - 1) * 1200), 0, { kind: "cycle_start", detail: { cycle: c as CycleIndex, phase: "A", clockLabel: "13:20" } });
    await appendTelemetryEvent(log, asVirtualTime(c * 1200), 0, { kind: "cycle_end", detail: { cycle: c as CycleIndex, totalRealDurationMs: 180000 } });
  }
  return log;
}

describe("planResume — interrupted cleanly at a cycle boundary, for every cycle 1..19", () => {
  it.each(Array.from({ length: 19 }, (_, i) => i + 1))("after cycle %i completes cleanly, resume targets cycle %i+1", async (n) => {
    const log = await makeLogThroughCycles(n);
    const plan = planResume(await log.readAll());
    expect(plan.resumeFromCycle).toBe(n + 1);
    expect(plan.cycleWasInterruptedMidway).toBe(false);
  });
});

describe("planResume — interrupted mid-cycle (cycle_start logged, no matching cycle_end), for every cycle 1..20", () => {
  it.each(Array.from({ length: 20 }, (_, i) => i + 1))("mid-cycle %i must be replayed from its start, not resumed in place", async (n) => {
    const log = await makeLogThroughCycles(n - 1);
    await appendTelemetryEvent(log, asVirtualTime((n - 1) * 1200), 0, { kind: "cycle_start", detail: { cycle: n as CycleIndex, phase: n <= 10 ? "A" : "B", clockLabel: "13:20" } });
    // Interruption happens here — some interaction records logged, but no cycle_end.
    await appendTelemetryEvent(log, asVirtualTime((n - 1) * 1200 + 30), 0, { kind: "bubble_available", detail: { atomId: "atom.1", mapPosition: null, tier: "T1_pushed", sourceId: "EK11" } });

    const plan = planResume(await log.readAll());
    expect(plan.resumeFromCycle).toBe(n);
    expect(plan.cycleWasInterruptedMidway).toBe(true);
  });
});

describe("planResume — before any cycle has started", () => {
  it("resumes at cycle 1", async () => {
    const log = new SessionLog(HEADER, new InMemoryLogSink());
    await appendTelemetryEvent(log, asVirtualTime(0), 0, { kind: "session_started", detail: HEADER });
    const plan = planResume(await log.readAll());
    expect(plan.resumeFromCycle).toBe(1);
    expect(plan.cycleWasInterruptedMidway).toBe(false);
  });

  it("resumes at cycle 1 with an entirely empty log", () => {
    const plan = planResume([]);
    expect(plan.resumeFromCycle).toBe(1);
    expect(plan.cycleWasInterruptedMidway).toBe(false);
    expect(plan.lastRecordSeq).toBeNull();
  });
});

describe("planResume — the documented edge case: interrupted cleanly right after cycle 20", () => {
  it("resumeFromCycle is 21 (past the last real cycle) and is not itself a valid CycleIndex", async () => {
    const log = await makeLogThroughCycles(20);
    const plan = planResume(await log.readAll());
    expect(plan.resumeFromCycle).toBe(21);
    expect(plan.cycleWasInterruptedMidway).toBe(false);
  });
});

describe("resumeSession — logs session_resumed and reflects the plan", () => {
  it("records resumeCount, intervalSinceInterruptionMs and cycleReplayed", async () => {
    const log = await makeLogThroughCycles(3);
    await appendTelemetryEvent(log, asVirtualTime(3 * 1200), 0, { kind: "cycle_start", detail: { cycle: 4, phase: "A", clockLabel: "13:20" } });

    const { plan, resumedRecord } = await resumeSession(log, 1, 45000);
    expect(plan.resumeFromCycle).toBe(4);
    expect(plan.cycleWasInterruptedMidway).toBe(true);
    expect(resumedRecord.kind).toBe("session_resumed");
    expect(resumedRecord.detail).toEqual({ resumeCount: 1, intervalSinceInterruptionMs: 45000, cycleReplayed: 4 });
  });

  it("clamps cycleReplayed to 20 for the past-cycle-20 edge case rather than throwing", async () => {
    const log = await makeLogThroughCycles(20);
    const { resumedRecord } = await resumeSession(log, 1, 1000);
    expect(resumedRecord.detail).toMatchObject({ cycleReplayed: 20 });
  });

  it("multiple resumes increment resumeCount and each is a distinct, gapless log record", async () => {
    const log = await makeLogThroughCycles(5);
    const first = await resumeSession(log, 1, 1000);
    const second = await resumeSession(log, 2, 2000);
    expect(first.resumedRecord.seq).toBeLessThan(second.resumedRecord.seq);
    expect((second.resumedRecord.detail as { resumeCount: number }).resumeCount).toBe(2);
  });

  it("does not mutate or remove the interrupted cycle's partial records — append-only, per I5", async () => {
    const log = await makeLogThroughCycles(3);
    await appendTelemetryEvent(log, asVirtualTime(3 * 1200), 0, { kind: "cycle_start", detail: { cycle: 4, phase: "A", clockLabel: "13:20" } });
    await appendTelemetryEvent(log, asVirtualTime(3 * 1200 + 10), 0, { kind: "bubble_available", detail: { atomId: "a1", mapPosition: null, tier: "T1_pushed", sourceId: "EK11" } });
    const beforeCount = (await log.readAll()).length;

    await resumeSession(log, 1, 1000);

    const after = await log.readAll();
    expect(after.length).toBe(beforeCount + 1); // only the new session_resumed record was added
    expect(after.some((r) => r.kind === "bubble_available")).toBe(true); // the interrupted cycle's partial record is still there, untouched
  });
});
