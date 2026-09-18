/**
 * A minimal, structurally complete `ScenarioContract` that satisfies every
 * construction-throws check (SPEC/04 §2) and every CI validator check
 * (SPEC/03 §11) at once. Not real authored content — geometry is a
 * placeholder square, Finnish text is a placeholder, and there is no real
 * fire science in it. Its only job is to be a legitimate baseline that
 * `test/validate/contract.spec.ts` and the validator's tests can mutate
 * one field at a time to prove each individual check fires for the right
 * reason.
 *
 * Real content authoring is blocked on the domain reviewer (SPEC/11 §1.2)
 * and is explicitly out of scope here.
 */

import { asVirtualTime, WGS84, type CycleIndex } from "../../../app/engine/primitives.js";
import {
  CANONICAL_FLAG_SEQUENCE,
  LOAD_BEARING_T4_IDS,
  type Branch,
  type ChannelSignalSet,
  type CycleSpec,
  type DutyOfficerMessage,
  type Envelope,
  type ExpectedInvariant,
  type InfoAtom,
  type ProbeSpec,
  type ScenarioContract,
  type SourceClass,
} from "../../../app/scenario/types.js";

const SQUARE = [
  [
    { lat: 60.8, lon: 27.0 },
    { lat: 60.8, lon: 27.01 },
    { lat: 60.81, lon: 27.01 },
    { lat: 60.81, lon: 27.0 },
    { lat: 60.8, lon: 27.0 },
  ],
];

const SOURCE_CLASSES: readonly SourceClass[] = [
  {
    id: "sc.experienced",
    label: "Kokenut yksikkö",
    reliability: "known-good",
    replyLatency: { kind: "lognormal", medianSeconds: 25, sigma: 0.5, minSeconds: 5, maxSeconds: 120 },
  },
  {
    id: "sc.volunteer",
    label: "VPK",
    reliability: "unproven",
    replyLatency: { kind: "lognormal", medianSeconds: 40, sigma: 0.6, minSeconds: 10, maxSeconds: 180 },
  },
];

function makeCycles(): CycleSpec[] {
  const cycles: CycleSpec[] = [];
  for (let i = 1; i <= 20; i++) {
    const index = i as CycleIndex;
    cycles.push({
      index,
      phase: index <= 10 ? "A" : "B",
      title: `Cycle ${index} (placeholder)`,
      startsAtVirtual: asVirtualTime((index - 1) * 1200),
      clockLabel: "13:20",
      pushedAtomIds: [],
      deliveryOffsetsSeconds: [],
      perimeter: SQUARE,
      unitPositions: {},
      actualPerimeterAtEnd: SQUARE,
      probeIds: [`probe.j.cycle_${index}`],
      gaps: [],
      rateMarks: [],
      sensorFootprints: [],
    });
  }
  return cycles;
}

function makeEnvelopes(): Envelope[] {
  return CANONICAL_FLAG_SEQUENCE.map((flag, i) => {
    const index = (i + 1) as CycleIndex;
    const envelope: Envelope = {
      cycle: index,
      polygon: SQUARE,
      certainty: { kind: "probable", basis: "national spread-simulation service" },
      attribution: "Kansallinen palonlevintäpalvelu, laskettu 13:20",
      horizonVirtual: asVirtualTime(index * 1200), // next cycle boundary
      horizonLabel: "ennuste voimassa saakka (placeholder)",
      flag,
      containmentToleranceMetres: 50,
      isOmissionCycle: index === 12,
    };
    return envelope;
  });
}

function makeChannelSets(): ChannelSignalSet[] {
  const sets: ChannelSignalSet[] = [];
  for (let i = 1; i <= 20; i++) {
    sets.push({
      cycle: i as CycleIndex,
      emitAtOffsetSeconds: 60,
      signals: [], // vacuously satisfies "traceable to authored atoms" and "never flags the contradiction"
      trafficSummary: "",
      trafficSummaryOmitsAtomIds: [],
      restatesIntent: i > 10,
    });
  }
  return sets;
}

function makeInvariantsAndProbes(): { invariants: ExpectedInvariant[]; probes: ProbeSpec[] } {
  const invariants: ExpectedInvariant[] = [];
  const probes: ProbeSpec[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = `containment.cycle_${i}`;
    invariants.push({ name, expected: CANONICAL_FLAG_SEQUENCE[i - 1] === "holds", tolerance: 0 });
    probes.push({
      id: `probe.j.cycle_${i}`,
      type: "J",
      mode: "PROBING_VISIBLE",
      cycle: i as CycleIndex,
      orderWithinCycle: 1,
      invariantName: name,
      prompt: "Pitääkö ennuste paikkansa? (placeholder)",
      response: { kind: "containment_three_way" },
      collectsConfidence: true,
      contentKind: "situation",
    });
  }
  return { invariants, probes };
}

function makeLoadBearingAtoms(): InfoAtom[] {
  const consequenceCycle: Record<(typeof LOAD_BEARING_T4_IDS)[number], CycleIndex> = {
    "t4.ember_warning": 8,
    "t4.private_doubt": 13,
    "t4.water_state": 13,
  };
  const atomCycle: Record<(typeof LOAD_BEARING_T4_IDS)[number], CycleIndex> = {
    "t4.ember_warning": 6,
    "t4.private_doubt": 11,
    "t4.water_state": 4,
  };
  return LOAD_BEARING_T4_IDS.map((id) => ({
    id,
    tier: "T4_lateral",
    origin: "lateral",
    cycle: atomCycle[id],
    loadBearing: true,
    routes: {
      directed: { kind: "request_traffic", selector: { byUnit: "EK12" } },
      assistive: { kind: "free_text", exampleQueries: ["mitä EK12 sanoi?"] },
      substitutive: { kind: "free_text", exampleQueries: ["mitä EK12 sanoi?"] },
    },
    record: {
      kind: "lateral_traffic",
      speakerUnitId: "EK12",
      addresseeUnitId: "EK11",
      at: asVirtualTime((atomCycle[id] - 1) * 1200 + 300),
      content: "placeholder lateral traffic content",
      droppedFromChannelSummary: true,
    },
    provenance: {
      sourceId: "EK12",
      sourceClassId: "sc.experienced",
      sourceReliability: "known-good",
      observedAt: asVirtualTime((atomCycle[id] - 1) * 1200 + 300),
      recordedAt: asVirtualTime((atomCycle[id] - 1) * 1200 + 310),
      deliveredAt: null, // T4 is never pushed, in any condition (SPEC/02 §3.4)
      certainty: { kind: "probable", basis: "single source" },
      supports: [],
      contradicts: [],
    },
    degradation: [],
    retrievalKeys: [id],
    truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [], saidOn: "talk_group" },
    consequence: { description: `placeholder consequence for ${id}`, manifestsAtCycle: consequenceCycle[id], measureId: `t4_discovery.${id}` },
  }));
}

/** Bulk-generates filler atoms to hit the SPEC/02 §3 tier count bands' minimums. */
function makeFillerAtoms(): InfoAtom[] {
  const atoms: InfoAtom[] = [];
  const plans: readonly [InfoAtom["tier"], number][] = [
    ["T1_pushed", 90],
    ["T2_system", 80],
    ["T3_person", 70],
    ["T4_lateral", 47], // 47 + 3 load-bearing T4 atoms = 50, the T4 band minimum
  ];
  for (const [tier, count] of plans) {
    for (let i = 0; i < count; i++) {
      const cycle = (((i % 20) + 1) as CycleIndex);
      atoms.push({
        id: `atom.filler.${tier}.${i}`,
        tier,
        origin: tier === "T1_pushed" ? "sensor" : "below",
        cycle,
        loadBearing: false,
        routes: {
          directed: { kind: "browse", surface: "situation_log" },
          assistive: { kind: "free_text", exampleQueries: ["placeholder"] },
          substitutive: { kind: "free_text", exampleQueries: ["placeholder"] },
        },
        record: {
          kind: "situation_log",
          entryId: `log.filler.${tier}.${i}`,
          authorUnitId: "EK11",
          text: "placeholder filler record",
        },
        provenance: {
          sourceId: "EK11",
          sourceClassId: "sc.experienced",
          sourceReliability: "known-good",
          observedAt: asVirtualTime((cycle - 1) * 1200),
          recordedAt: asVirtualTime((cycle - 1) * 1200 + 60),
          deliveredAt: tier === "T1_pushed" ? asVirtualTime((cycle - 1) * 1200 + 30) : null,
          certainty: { kind: "confirmed" },
          supports: [],
          contradicts: [],
        },
        degradation: [],
        retrievalKeys: ["placeholder"],
        truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [] },
      });
    }
  }
  return atoms;
}

function makeContradictionAtoms(): InfoAtom[] {
  const base = {
    cycle: 18 as CycleIndex,
    loadBearing: false,
    routes: {
      directed: { kind: "pushed" as const },
      assistive: { kind: "free_text" as const, exampleQueries: ["pohjoisreuna?"] },
      substitutive: { kind: "free_text" as const, exampleQueries: ["pohjoisreuna?"] },
    },
    degradation: [],
    retrievalKeys: ["pohjoisreuna"],
  };
  const premise: InfoAtom = {
    ...base,
    id: "atom.contradiction.premise",
    tier: "T1_pushed",
    origin: "above",
    record: { kind: "aerial_observation", platform: "fixed_wing", platformId: "SPOT", at: asVirtualTime(17 * 1200), geometry: SQUARE, text: "pohjoisreuna kiihtyy", available: true },
    provenance: {
      sourceId: "SPOT", sourceClassId: "sc.experienced", sourceReliability: "known-good",
      observedAt: asVirtualTime(17 * 1200), recordedAt: asVirtualTime(17 * 1200), deliveredAt: asVirtualTime(17 * 1200),
      certainty: { kind: "probable", basis: "aerial" }, supports: [], contradicts: ["atom.contradiction.counter"],
    },
    truth: { isGroundTruth: true, isDecoy: false, contradictionRole: "premise", relevantInvariants: [] },
  };
  const counter: InfoAtom = {
    ...base,
    id: "atom.contradiction.counter",
    tier: "T1_pushed",
    origin: "below",
    record: { kind: "situation_log", entryId: "log.contradiction.counter", authorUnitId: "EK14", text: "linja pitää" },
    provenance: {
      sourceId: "EK14", sourceClassId: "sc.experienced", sourceReliability: "known-good",
      observedAt: asVirtualTime(17 * 1200), recordedAt: asVirtualTime(17 * 1200), deliveredAt: asVirtualTime(17 * 1200),
      certainty: { kind: "confirmed" }, supports: [], contradicts: ["atom.contradiction.premise"],
    },
    truth: { isGroundTruth: true, isDecoy: false, contradictionRole: "counter-evidence", relevantInvariants: [] },
  };
  const reconciling: InfoAtom = {
    ...base,
    id: "atom.contradiction.reconciling",
    tier: "T4_lateral",
    origin: "lateral",
    routes: { directed: { kind: "ask_unit", unitId: "EK14" }, assistive: { kind: "free_text", exampleQueries: ["EK14 näkee?"] }, substitutive: { kind: "free_text", exampleQueries: ["EK14 näkee?"] } },
    record: { kind: "lateral_traffic", speakerUnitId: "EK14", addresseeUnitId: "EK15", at: asVirtualTime(17 * 1200 + 200), content: "näemme vain oman lohkomme", droppedFromChannelSummary: true },
    provenance: {
      sourceId: "EK14", sourceClassId: "sc.experienced", sourceReliability: "known-good",
      observedAt: asVirtualTime(17 * 1200 + 200), recordedAt: asVirtualTime(17 * 1200 + 210), deliveredAt: null,
      certainty: { kind: "confirmed" }, supports: [], contradicts: [],
    },
    truth: { isGroundTruth: true, isDecoy: false, contradictionRole: "reconciling", relevantInvariants: [], saidOn: "dmo" },
  };
  return [premise, counter, reconciling];
}

function makeOmissionAtoms(): InfoAtom[] {
  const atom: InfoAtom = {
    id: "atom.omission.development",
    tier: "T2_system",
    origin: "below",
    cycle: 12,
    loadBearing: false,
    routes: {
      directed: { kind: "browse", surface: "reference_maintenance" },
      assistive: { kind: "free_text", exampleQueries: ["ojitus?"] },
      substitutive: { kind: "free_text", exampleQueries: ["ojitus?"] },
    },
    record: { kind: "reference", surface: "reference_maintenance", featureId: "ditch.bog-s", fields: { maintainedYear: 2024 }, registerUpdatedAt: "2024-09-01" },
    provenance: {
      sourceId: "register", sourceClassId: "sc.experienced", sourceReliability: "known-good",
      observedAt: asVirtualTime(11 * 1200), recordedAt: asVirtualTime(11 * 1200), deliveredAt: null,
      certainty: { kind: "confirmed" }, supports: [], contradicts: [],
    },
    degradation: [],
    retrievalKeys: ["ojitus", "suo"],
    truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [] },
  };
  return [atom];
}

function makeDutyOfficerMessages(): DutyOfficerMessage[] {
  return [
    { cycle: 1, at: asVirtualTime(0), text: "Johtovastuu siirretty (placeholder).", isStrategicGuidance: false, expectsReply: false },
    { cycle: 11, at: asVirtualTime(10 * 1200), text: "Uusi linja (placeholder strateginen ohjaus).", isStrategicGuidance: true, expectsReply: true },
  ];
}

function makeBranches(): Branch[] {
  const factors: Branch["variedFactor"][] = ["weather", "discrete_event", "resource", "weather", "discrete_event"];
  return factors.map((variedFactor, i) => ({
    id: `branch.${i + 1}`,
    label: `Branch ${i + 1} (placeholder)`,
    divergesAtCycle: ((i * 4) + 1) as CycleIndex,
    variedFactor,
    description: "placeholder counterfactual",
    perimeterByCycle: { [(i * 4) + 2]: SQUARE },
  }));
}

export function buildValidScenario(): ScenarioContract {
  const { invariants, probes } = makeInvariantsAndProbes();
  const loadBearing = makeLoadBearingAtoms();
  const filler = makeFillerAtoms();
  const contradictionAtoms = makeContradictionAtoms();
  const omissionAtoms = makeOmissionAtoms();

  return {
    id: "fixture-scenario",
    version: "0.1.0",
    seed: 42n,
    constructs: ["containment-judgement-accuracy", "calibration"],
    validity: {
      represents: ["initial attack through handover on one scripted incident"],
      doesNotRepresent: ["multi-incident regional command", "live fire behaviour"],
      authoredBy: "fixture",
      reviewedBy: ["fixture-reviewer"],
      sourceBasis: ["placeholder"],
      knownDivergences: [
        "breach-rate: the projection breach rate is deliberately higher than an operational system's, to create error variance to calibrate against.",
        "fire-magnitude: the fire's magnitude is at the severe end of Finnish experience, chosen so the task requires multi-unit command.",
        "simulated-responder: the `directed` responder is an automated, authored system rather than a live person.",
      ],
    },
    extent: { crs: WGS84, south: 60.62, north: 61.07, west: 26.68, east: 27.6 },
    cycleCount: 20,
    virtualSecondsPerCycle: 1200,
    startVirtualClock: "13:20",
    invariants,
    contradiction: {
      id: "contradiction.main",
      cycle: 18,
      premiseAtomId: "atom.contradiction.premise",
      counterAtomId: "atom.contradiction.counter",
      reconcilingAtomId: "atom.contradiction.reconciling",
      subtlety: "medium",
      detectionProbeId: "probe.j.cycle_18",
      backupProbeId: "probe.j.cycle_20",
    },
    omission: {
      id: "omission.main",
      cycle: 12,
      mechanism: "M1_shower",
      outsideEveryEnvelope: true,
      developmentAtomIds: ["atom.omission.development"],
    },
    probeSchedule: { probes },
    cycles: makeCycles(),
    atoms: [...loadBearing, ...filler, ...contradictionAtoms, ...omissionAtoms],
    envelopes: makeEnvelopes(),
    channelSets: makeChannelSets(),
    dutyOfficerMessages: makeDutyOfficerMessages(),
    branches: makeBranches(),
    branchStatements: [],
    allocationSpace: {
      sectors: [{ id: "L1", label: "Pohjoinen (placeholder)", geometry: SQUARE }],
      assets: [{ id: "EK11", label: "EK11", type: "pelastusyksikko", availableFromCycle: 1, availableUntilCycle: null }],
      tasks: [{ id: "task.direct-attack", label: "Suora hyökkäys (placeholder)", appliesToTypes: ["pelastusyksikko"] }],
      viability: [],
    },
    allocationRecommendations: [],
    hinge: {
      afterCycle: 10,
      guidanceMessageId: "duty.hinge",
      pauseSeconds: 300,
      intentStatement: "placeholder strategic intent",
      alignmentRules: [],
    },
    sourceClasses: SOURCE_CLASSES,
  };
}
