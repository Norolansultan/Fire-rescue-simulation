/**
 * The demo scenario — SYNTHETIC PLACEHOLDER CONTENT. See `content/demo/README.md`
 * for what this is and is not. Built so the UI and workflow can be seen
 * and driven end to end while the real authored scenario (`SPEC`
 * documents `20`/`21`, in progress with the domain reviewer) doesn't
 * exist yet. Every number here — rates of spread, distances, perimeter
 * shapes — is invented for visual plausibility, not derived or reviewed.
 *
 * Geography, units, and the story beats are *inspired by*
 * `SPEC/18_Scenario_World_State.md` (same region, same call signs, same
 * rough incident shape) so that when real content lands, swapping this
 * generator out changes nothing about how the UI consumes a
 * `ScenarioContract` — only the content itself changes.
 *
 * Applies the fixes from the uploaded "22 — Scenario content: second
 * pass" review where they're implementable without the real geometry it
 * revises: irregular (not elliptical) perimeters (§2.5), a wind-reduction
 * "fifth error" that makes some `holds` cycles genuine rather than
 * author's-margin (§2.3), and values at risk placed at distances the
 * fire can actually reach within the session (§2.2). NOT applied: the
 * cycle-12 two-disjoint-parts perimeter (§2.4) — `Polygon` in this
 * codebase is a single ring-with-holes, not a multi-polygon, and
 * changing that data model is a bigger decision than this generator
 * should make silently; cycle 12 here is a single elongated lobe
 * instead, noted as a simplification.
 */

import { asVirtualTime, WGS84, type CycleIndex, type LatLon, type Polygon } from "../engine/primitives.js";
import { deriveSeed, Xorshift64Star } from "../engine/prng.js";
import {
  CANONICAL_FLAG_SEQUENCE,
  type Branch,
  type BranchStatement,
  type ChannelSignalSet,
  type CycleSpec,
  type DutyOfficerMessage,
  type Envelope,
  type ExpectedInvariant,
  type Flag,
  type InfoAtom,
  type ProbeSpec,
  type ScenarioContract,
  type SourceClass,
} from "./types.js";
import { createScenarioContract } from "./contract.js";

// ---------------------------------------------------------------------------
// Geography — inspired by SPEC/18 §5, distances adjusted per "22" §2.2
// ---------------------------------------------------------------------------

const ORIGIN: LatLon = { lat: 60.9, lon: 27.35 }; // IGN, SPEC/18 §5

function offset(base: LatLon, dNorthM: number, dEastM: number): LatLon {
  const dLat = dNorthM / 111_320;
  const dLon = dEastM / (111_320 * Math.cos((base.lat * Math.PI) / 180));
  return { lat: base.lat + dLat, lon: base.lon + dLon };
}

export const LANDMARKS = {
  ignition: ORIGIN,
  road: offset(ORIGIN, 400, 0),
  ridge: offset(ORIGIN, 900, 500),
  spruce: offset(ORIGIN, 1700, 900),
  pond: offset(ORIGIN, 1300, -700),
  // V1 cabins — "22" §2.2: 2.3 km NW of origin (moved in from the original 2.5 km draft)
  cabins: offset(ORIGIN, 1900, -1300),
  bog: offset(ORIGIN, -900, 700),
  salpaLine: offset(ORIGIN, -2000, 200),
  // V2 village — "22" §2.2: 2.2 km SE of origin
  village: offset(ORIGIN, -1600, 1500),
  commandPoint: offset(ORIGIN, -100, -1000),
} as const;

// ---------------------------------------------------------------------------
// Deterministic irregular perimeter geometry — "22" §2.5: "must be
// irregular and multi-lobed, not smooth ellipses."
// ---------------------------------------------------------------------------

function bearingToward(from: LatLon, to: LatLon): number {
  return Math.atan2(to.lon - from.lon, to.lat - from.lat); // planar approximation, fine at this scale
}

/** An irregular, direction-elongated blob — not a true multi-polygon, but visually far from an ellipse. */
function irregularPerimeter(rng: Xorshift64Star, center: LatLon, radiusM: number, spreadBearingRad: number, elongation: number): Polygon {
  const points = 16;
  const ring: LatLon[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const directional = 1 + elongation * Math.cos(angle - spreadBearingRad);
    const jitter = 0.75 + rng.nextFloat() * 0.5; // 0.75-1.25x, deterministic per point
    const r = Math.max(20, radiusM * directional * jitter);
    ring.push(offset(center, Math.cos(angle) * r, Math.sin(angle) * r));
  }
  ring.push(ring[0]!);
  return [ring];
}

// ---------------------------------------------------------------------------
// Per-cycle fire extent — invented growth curve reaching ~170 ha by cycle
// 20, the same order of magnitude "22" §1 validates for the real content.
// ---------------------------------------------------------------------------

interface CycleGeometry {
  readonly centroid: LatLon;
  readonly radiusM: number;
  readonly spreadBearingRad: number;
  readonly elongation: number;
}

const SPREAD_TARGETS: readonly LatLon[] = [LANDMARKS.ridge, LANDMARKS.spruce, LANDMARKS.cabins, LANDMARKS.village];

function cycleGeometry(index: CycleIndex): CycleGeometry {
  // Phase A: head runs NE toward the ridge/spruce. After the wind backs (~cycle 9) the
  // active edge swings NW toward the cabins. After it veers (~cycle 17) the SE edge
  // toward the village becomes active. Simplification, not a real wind-driven model.
  const target = index <= 9 ? SPREAD_TARGETS[1]! : index <= 16 ? LANDMARKS.cabins : LANDMARKS.village;
  const growth = Math.min(1, index / 20);
  const radiusM = 150 + growth * 950; // ~150m at cycle 1 to ~1100m at cycle 20 (order-of-magnitude match to "22" §1's 172 ha)
  const centroid = {
    lat: ORIGIN.lat + (target.lat - ORIGIN.lat) * growth * 0.6,
    lon: ORIGIN.lon + (target.lon - ORIGIN.lon) * growth * 0.6,
  };
  return { centroid, radiusM, spreadBearingRad: bearingToward(ORIGIN, target), elongation: 0.5 };
}

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

const UNIT_IDS = ["EK11", "EK12", "EK14", "KY21", "VPK"] as const;
type UnitId = (typeof UNIT_IDS)[number];

function unitPosition(unit: UnitId, cycle: CycleIndex): LatLon {
  const geo = cycleGeometry(cycle);
  const angleByUnit: Record<UnitId, number> = { EK11: 0.3, EK12: 1.4, EK14: 2.6, KY21: 4.0, VPK: 5.3 };
  const r = geo.radiusM * 0.7;
  const angle = angleByUnit[unit];
  return offset(geo.centroid, Math.cos(angle) * r, Math.sin(angle) * r);
}

const SOURCE_CLASSES: readonly SourceClass[] = [
  { id: "sc.experienced", label: "Kokenut yksikkö", reliability: "known-good", replyLatency: { kind: "lognormal", medianSeconds: 24, sigma: 0.5, minSeconds: 5, maxSeconds: 120 } },
  { id: "sc.volunteer", label: "VPK", reliability: "unproven", replyLatency: { kind: "lognormal", medianSeconds: 38, sigma: 0.6, minSeconds: 10, maxSeconds: 180 } },
  { id: "sc.sensor", label: "Anturi", reliability: "known-good", replyLatency: { kind: "lognormal", medianSeconds: 6, sigma: 0.3, minSeconds: 2, maxSeconds: 30 } },
];

// ---------------------------------------------------------------------------
// Story beats — short, invented Finnish text per cycle. Register not
// reviewed (see content/demo/README.md).
// ---------------------------------------------------------------------------

interface BubbleSeed {
  readonly authorUnitId: UnitId | "DR1" | "SPOT";
  readonly text: string;
}

const CYCLE_STORY: Readonly<Record<CycleIndex, { readonly title: string; readonly bubbles: readonly BubbleSeed[] }>> = {
  1: { title: "Komennon siirto", bubbles: [{ authorUnitId: "EK11", text: "Johtovastuu otettu. Palo noin 12 ha, kärki koilliseen. EK14 ja KY21 tulossa." }, { authorUnitId: "DR1", text: "Kuva päivitetty. Reuna metsäautotien pohjoispuolella." }] },
  2: { title: "Linjan rakentaminen", bubbles: [{ authorUnitId: "EK14", text: "Aloitamme linjan pohjoisreunalle. Perääntymistie tarkistettu." }] },
  3: { title: "Toinen syttymä", bubbles: [{ authorUnitId: "EK11", text: "Uusi savu harjulla, noin 250 m nykyisestä kärjestä. Syytä ei tiedossa." }, { authorUnitId: "SPOT", text: "Havaittu pieni liekki harjun laella." }] },
  4: { title: "Liittymä", bubbles: [{ authorUnitId: "EK12", text: "Palot yhdistyneet. Vesipiste W1 valittu, matka pitkä." }] },
  5: { title: "Kuusikkoon", bubbles: [{ authorUnitId: "EK12", text: "Kärki kuusikon reunalla. Tiheä alikasvos, näkyvyys huono." }] },
  6: { title: "Latvapalo", bubbles: [{ authorUnitId: "EK12", text: "Latvapalo alkanut. Vetäydymme, kipinöintiä havaittu 200-400 m eteenpäin." }, { authorUnitId: "DR1", text: "Kuva kylläinen lämpökameralla, ei tarkkaa rajaa." }] },
  7: { title: "Resurssit", bubbles: [{ authorUnitId: "EK11", text: "Latvapalo laskeutunut koivikkoon, pintapalo jatkuu. Pyydetään lisäyksiköitä." }] },
  8: { title: "Ilmatuki", bubbles: [{ authorUnitId: "EK11", text: "Helikopteri työskentelee kärjessä. Dronet laskeutuneet tien pohjoispuolella." }] },
  9: { title: "Tuuli kääntyy", bubbles: [{ authorUnitId: "EK14", text: "Tuuli kääntynyt etelään, pohjoisreuna aktivoitunut kohti järveä." }, { authorUnitId: "EK11", text: "Mökkien käyttöaste ei tiedossa, poliisi pyydetty tarkistamaan." }] },
  10: { title: "Näennäinen hallinta", bubbles: [{ authorUnitId: "EK11", text: "Lohko 1 ja 2 hallinnassa. Sadekuuro alueen yli, savu vähenee." }, { authorUnitId: "VPK", text: "Maa lämmin jalkojen alla suon reunalla." }] },
  11: { title: "Rauhallinen jakso", bubbles: [{ authorUnitId: "EK11", text: "Tilanne rauhallinen. Vapautusta suunnitellaan lohkolla 1." }] },
  12: { title: "Kytee", bubbles: [{ authorUnitId: "KY21", text: "Avotulta suon eteläreunalla, ei ollut kartalla." }] },
  13: { title: "Uudelleenvakiinnutus", bubbles: [{ authorUnitId: "EK14", text: "Palo ylitti huoltotien. Vesikuljetusreitti poikki." }] },
  14: { title: "Konflikti", bubbles: [{ authorUnitId: "EK11", text: "Alue pyytää KY21:tä toiselle palolle. Ei vapauteta ennen lämpökamera­varmistusta." }] },
  15: { title: "Turve ja syvyys", bubbles: [{ authorUnitId: "KY21", text: "Vesi ei imeydy kunnolla, harkitaan kastelu­ainetta." }] },
  16: { title: "Vahvistus", bubbles: [{ authorUnitId: "EK11", text: "Uudet yksiköt saapumassa. Silta rajoittaa raskaan kaluston reittiä." }] },
  17: { title: "Toinen tuulitapahtuma", bubbles: [{ authorUnitId: "EK14", text: "Puuskat voimistuneet luoteesta. Kylän suunnalle liikettä." }, { authorUnitId: "SPOT", text: "Kärki etenee kaakkoon kohti kylää." }] },
  18: { title: "Ristiriita", bubbles: [{ authorUnitId: "SPOT", text: "Pohjoisreuna kiihtyy, havaittu uutta savua uran itäpuolella." }, { authorUnitId: "EK14", text: "Oma linjamme pitää, ei muutosta." }] },
  19: { title: "Väsymys", bubbles: [{ authorUnitId: "EK11", text: "Miehistö kentällä yli seitsemän tuntia. Kierto käynnissä." }] },
  20: { title: "Luovutus", bubbles: [{ authorUnitId: "EK11", text: "Yöorganisaatio ottaa vastuun klo 20. Tilanne kirjattu." }] },
};

const BRANCH_TEMPLATES: readonly [string, string, string, string] = [
  "Palo hidastuu ja pysyy nykyisten linjojen sisällä.",
  "Kärki jatkaa samaan suuntaan, nopeus kasvaa hieman.",
  "Uusi kehitys ilmenee alueella, jota ei ole vielä havaittu.",
  "Palo jakautuu kahteen suuntaan nykyisestä kärjestä.",
];

// ---------------------------------------------------------------------------
// Assembly
// ---------------------------------------------------------------------------

function envelopeCertaintyFor(flag: Flag, index: CycleIndex): Envelope["certainty"] {
  if (flag === "holds") return index % 2 === 0 ? { kind: "confirmed" } : { kind: "probable", basis: "suljettu latvusto, tuuli tasainen" };
  if (flag === "breach_quantitative") return { kind: "probable", basis: "avoin maasto, puuskaisuus" };
  return { kind: "uncertain", basis: "havainnot puutteelliset" };
}

export function buildDemoScenario(): ScenarioContract {
  const seed = 20260917n;
  const rng = new Xorshift64Star(deriveSeed(seed, "demo-scenario"));

  const cycles: CycleSpec[] = [];
  const envelopes: Envelope[] = [];
  const atoms: InfoAtom[] = [];
  const invariants: ExpectedInvariant[] = [];
  const probes: ProbeSpec[] = [];
  const branchStatements: BranchStatement[] = [];
  const dutyOfficerMessages: DutyOfficerMessage[] = [];

  let atomCounter = 0;

  for (let i = 1; i <= 20; i++) {
    const index = i as CycleIndex;
    const geo = cycleGeometry(index);
    const nextGeo = index < 20 ? cycleGeometry((index + 1) as CycleIndex) : cycleGeometry(index);
    const flag = CANONICAL_FLAG_SEQUENCE[i - 1]!;
    const perimeter = irregularPerimeter(rng, geo.centroid, geo.radiusM, geo.spreadBearingRad, geo.elongation);
    const actualPerimeterAtEnd = irregularPerimeter(rng, nextGeo.centroid, nextGeo.radiusM, nextGeo.spreadBearingRad, nextGeo.elongation);

    // Envelope: close to the true next perimeter when it "holds"; visibly off when it breaches.
    const envelopeRadiusBias = flag === "holds" ? 1.0 : flag === "breach_quantitative" ? 0.72 : 0.5;
    const envelopeBearingBias = flag === "breach_categorical" ? geo.spreadBearingRad + 1.1 : nextGeo.spreadBearingRad;
    const envelopePolygon = irregularPerimeter(rng, nextGeo.centroid, nextGeo.radiusM * envelopeRadiusBias, envelopeBearingBias, nextGeo.elongation);

    const story = CYCLE_STORY[index];
    const pushedAtomIds: string[] = [];
    const deliveryOffsetsSeconds: number[] = [];

    story.bubbles.forEach((seed_, bIdx) => {
      const id = `atom.demo.${index}.${bIdx}`;
      atomCounter += 1;
      const sourceIsUnit = (UNIT_IDS as readonly string[]).includes(seed_.authorUnitId);
      atoms.push({
        id,
        tier: "T1_pushed",
        origin: seed_.authorUnitId === "DR1" ? "sensor" : seed_.authorUnitId === "SPOT" ? "above" : "below",
        cycle: index,
        loadBearing: false,
        routes: {
          directed: { kind: "pushed" },
          assistive: { kind: "browse", surface: "situation_log" },
          substitutive: { kind: "pushed" },
        },
        record:
          seed_.authorUnitId === "DR1"
            ? { kind: "aerial_observation", platform: "drone", platformId: "DR1", at: asVirtualTime((index - 1) * 1200 + 60 * (bIdx + 1)), geometry: perimeter, text: seed_.text, available: true }
            : { kind: "situation_log", entryId: `log.${id}`, authorUnitId: seed_.authorUnitId, text: seed_.text },
        provenance: {
          sourceId: seed_.authorUnitId,
          sourceClassId: sourceIsUnit ? "sc.experienced" : "sc.sensor",
          sourceReliability: "known-good",
          observedAt: asVirtualTime((index - 1) * 1200 + 60 * (bIdx + 1)),
          recordedAt: asVirtualTime((index - 1) * 1200 + 60 * (bIdx + 1) + 30),
          deliveredAt: asVirtualTime((index - 1) * 1200 + 60 * (bIdx + 1) + 30),
          certainty: { kind: "confirmed" },
          supports: [],
          contradicts: [],
        },
        degradation: [],
        retrievalKeys: [seed_.authorUnitId.toLowerCase(), ...seed_.text.toLowerCase().split(/\s+/).slice(0, 4)],
        truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [`containment.cycle_${index}`] },
      });
      pushedAtomIds.push(id);
      deliveryOffsetsSeconds.push(60 * (bIdx + 1));
    });

    const unitPositions: Record<string, LatLon> = {};
    for (const u of UNIT_IDS) unitPositions[u] = unitPosition(u, index);

    cycles.push({
      index,
      phase: index <= 10 ? "A" : "B",
      title: story.title,
      startsAtVirtual: asVirtualTime((index - 1) * 1200),
      clockLabel: formatClock(index),
      pushedAtomIds,
      deliveryOffsetsSeconds,
      perimeter,
      unitPositions,
      actualPerimeterAtEnd,
      probeIds: [`probe.j.cycle_${index}`],
      gaps: [],
      rateMarks: [],
      sensorFootprints: [{ platformId: "DR1", cycle: index, geometry: index === 8 || index === 9 ? null : perimeter }],
    });

    envelopes.push({
      cycle: index,
      polygon: envelopePolygon,
      certainty: envelopeCertaintyFor(flag, index),
      attribution: "Kansallinen palonlevintäpalvelu",
      horizonVirtual: asVirtualTime(index * 1200),
      horizonLabel: `ennuste voimassa klo ${formatClock((index + 1) as CycleIndex)} saakka`,
      flag,
      containmentToleranceMetres: 50,
      isOmissionCycle: index === 12,
    });

    invariants.push({ name: `containment.cycle_${index}`, expected: flag === "holds", tolerance: 0 });
    probes.push({
      id: `probe.j.cycle_${index}`,
      type: "J",
      mode: "PROBING_VISIBLE",
      cycle: index,
      orderWithinCycle: 1,
      invariantName: `containment.cycle_${index}`,
      prompt: "Pitääkö ennuste paikkansa seuraavan 20 minuutin aikana?",
      response: { kind: "containment_three_way" },
      collectsConfidence: true,
      contentKind: "situation",
    });

    const shuffledBranches = rng.shuffle(BRANCH_TEMPLATES.map((t, bi) => ({ id: `branch.${index}.${bi}`, text: t })));
    shuffledBranches.forEach((b, bi) => {
      branchStatements.push({
        branchId: b.id,
        cycle: index,
        statementFi: b.text,
        truth: { isActualDevelopment: bi === 0 },
      });
    });
  }

  // Filler content across T2/T3/T4 so the drawers have real content to browse and the
  // corpus satisfies SPEC/02 §3's tier bands (checked by the M2 validator below).
  const REFERENCE_FEATURES = [
    { id: "ref.stand.spruce", surface: "reference_stand" as const, fields: { laji: "kuusi", ikä: 65, harvennettu: "kyllä (rekisterissä, ei todellisuudessa)" } },
    { id: "ref.road.r1", surface: "reference_road" as const, fields: { luokka: "metsäautotie", kantavuus_t: 12 } },
    { id: "ref.water.w1", surface: "reference_water" as const, fields: { tyyppi: "lampi", kapasiteetti: "keskisuuri" } },
    { id: "ref.ditch.bog", surface: "reference_maintenance" as const, fields: { toimenpide: "ojitus", vuosi: 2024 } },
  ];
  REFERENCE_FEATURES.forEach((f, i) => {
    atoms.push({
      id: f.id, tier: "T2_system", origin: "below", cycle: ((i % 20) + 1) as CycleIndex, loadBearing: false,
      routes: { directed: { kind: "browse", surface: f.surface }, assistive: { kind: "browse", surface: f.surface }, substitutive: { kind: "free_text", exampleQueries: [f.surface] } },
      record: { kind: "reference", surface: f.surface, featureId: f.id, fields: f.fields, registerUpdatedAt: "2024-09-01" },
      provenance: { sourceId: "register", sourceClassId: "sc.sensor", sourceReliability: "known-good", observedAt: asVirtualTime(0), recordedAt: asVirtualTime(0), deliveredAt: null, certainty: { kind: "confirmed" }, supports: [], contradicts: [] },
      degradation: [], retrievalKeys: [f.surface], truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [] },
    });
  });
  for (let i = 0; i < 65; i++) {
    const cycle = ((i % 20) + 1) as CycleIndex;
    const unit = UNIT_IDS[i % UNIT_IDS.length]!;
    atoms.push({
      id: `atom.demo.filler.t1.${i}`, tier: "T1_pushed", origin: "below", cycle, loadBearing: false,
      routes: { directed: { kind: "pushed" }, assistive: { kind: "browse", surface: "situation_log" }, substitutive: { kind: "pushed" } },
      record: { kind: "unit_status", unitId: unit, status: "kohteessa", setAt: asVirtualTime((cycle - 1) * 1200 + 90), position: unitPosition(unit, cycle), positionSetAt: asVirtualTime((cycle - 1) * 1200 + 90), abandoned: false },
      provenance: { sourceId: unit, sourceClassId: "sc.experienced", sourceReliability: "known-good", observedAt: asVirtualTime((cycle - 1) * 1200 + 90), recordedAt: asVirtualTime((cycle - 1) * 1200 + 90), deliveredAt: asVirtualTime((cycle - 1) * 1200 + 90), certainty: { kind: "confirmed" }, supports: [], contradicts: [] },
      degradation: [], retrievalKeys: [unit.toLowerCase(), "tila"], truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [] },
    });
  }
  for (let i = 0; i < 85; i++) {
    const cycle = ((i % 20) + 1) as CycleIndex;
    atoms.push({
      id: `atom.demo.filler.t2.${i}`, tier: "T2_system", origin: "below", cycle, loadBearing: false,
      routes: { directed: { kind: "browse", surface: "situation_log" }, assistive: { kind: "browse", surface: "situation_log" }, substitutive: { kind: "free_text", exampleQueries: ["tilanne"] } },
      record: { kind: "situation_log", entryId: `log.filler.t2.${i}`, authorUnitId: UNIT_IDS[i % UNIT_IDS.length]!, text: `Rutiinikirjaus ${i + 1}: tilanne ennallaan, ei muutosta.` },
      provenance: { sourceId: UNIT_IDS[i % UNIT_IDS.length]!, sourceClassId: "sc.experienced", sourceReliability: "known-good", observedAt: asVirtualTime((cycle - 1) * 1200), recordedAt: asVirtualTime((cycle - 1) * 1200 + 60), deliveredAt: null, certainty: { kind: "confirmed" }, supports: [], contradicts: [] },
      degradation: [], retrievalKeys: ["rutiini"], truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [] },
    });
  }
  for (let i = 0; i < 75; i++) {
    const cycle = ((i % 20) + 1) as CycleIndex;
    const unit = UNIT_IDS[i % UNIT_IDS.length]!;
    atoms.push({
      id: `atom.demo.filler.t3.${i}`, tier: "T3_person", origin: "below", cycle, loadBearing: false,
      routes: { directed: { kind: "ask_unit", unitId: unit }, assistive: { kind: "ask_unit", unitId: unit }, substitutive: { kind: "free_text", exampleQueries: [unit] } },
      record: { kind: "unit_status", unitId: unit, status: "kohteessa", setAt: asVirtualTime((cycle - 1) * 1200), position: unitPosition(unit, cycle), positionSetAt: asVirtualTime((cycle - 1) * 1200), abandoned: false },
      provenance: { sourceId: unit, sourceClassId: "sc.experienced", sourceReliability: "known-good", observedAt: asVirtualTime((cycle - 1) * 1200), recordedAt: asVirtualTime((cycle - 1) * 1200), deliveredAt: null, certainty: { kind: "confirmed" }, supports: [], contradicts: [] },
      degradation: [], retrievalKeys: [unit.toLowerCase()], truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [] },
    });
  }

  const LOAD_BEARING_SEEDS: readonly { readonly id: "t4.ember_warning" | "t4.private_doubt" | "t4.water_state"; readonly cycle: CycleIndex; readonly speaker: UnitId; readonly addressee: UnitId; readonly text: string; readonly consequenceCycle: CycleIndex }[] = [
    { id: "t4.ember_warning", cycle: 6, speaker: "EK12", addressee: "EK11", text: "Kipinöitä tulee meidän puolelle harjun yli, pitäkää silmällä.", consequenceCycle: 8 },
    { id: "t4.private_doubt", cycle: 11, speaker: "VPK", addressee: "KY21", text: "Varmistetaan suon reuna vielä, ei ihan varma että pitää.", consequenceCycle: 13 },
    { id: "t4.water_state", cycle: 4, speaker: "VPK", addressee: "KY21", text: "Vesi kestää täällä enää noin kaksikymmentä minuuttia.", consequenceCycle: 13 },
  ];
  for (const seed_ of LOAD_BEARING_SEEDS) {
    atoms.push({
      id: seed_.id, tier: "T4_lateral", origin: "lateral", cycle: seed_.cycle, loadBearing: true,
      routes: {
        directed: { kind: "request_traffic", selector: { byUnit: seed_.speaker } },
        assistive: { kind: "free_text", exampleQueries: [`mitä ${seed_.speaker} sanoi?`] },
        substitutive: { kind: "free_text", exampleQueries: [`mitä ${seed_.speaker} sanoi?`] },
      },
      record: { kind: "lateral_traffic", speakerUnitId: seed_.speaker, addresseeUnitId: seed_.addressee, at: asVirtualTime((seed_.cycle - 1) * 1200 + 300), content: seed_.text, droppedFromChannelSummary: true },
      provenance: { sourceId: seed_.speaker, sourceClassId: "sc.experienced", sourceReliability: "known-good", observedAt: asVirtualTime((seed_.cycle - 1) * 1200 + 300), recordedAt: asVirtualTime((seed_.cycle - 1) * 1200 + 310), deliveredAt: null, certainty: { kind: "probable", basis: "single source" }, supports: [], contradicts: [] },
      degradation: [], retrievalKeys: [seed_.id, seed_.speaker.toLowerCase()],
      truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [], saidOn: "dmo" },
      consequence: { description: `placeholder consequence for ${seed_.id}`, manifestsAtCycle: seed_.consequenceCycle, measureId: `t4_discovery.${seed_.id}` },
    });
  }
  for (let i = 0; i < 47; i++) {
    const cycle = ((i % 20) + 1) as CycleIndex;
    const speaker = UNIT_IDS[i % UNIT_IDS.length]!;
    const addressee = UNIT_IDS[(i + 1) % UNIT_IDS.length]!;
    atoms.push({
      id: `atom.demo.filler.t4.${i}`, tier: "T4_lateral", origin: "lateral", cycle, loadBearing: false,
      routes: { directed: { kind: "request_traffic", selector: { byUnit: speaker } }, assistive: { kind: "free_text", exampleQueries: [speaker] }, substitutive: { kind: "free_text", exampleQueries: [speaker] } },
      record: { kind: "lateral_traffic", speakerUnitId: speaker, addresseeUnitId: addressee, at: asVirtualTime((cycle - 1) * 1200 + 400), content: "Kuittaus, jatketaan samalla tavalla.", droppedFromChannelSummary: false },
      provenance: { sourceId: speaker, sourceClassId: "sc.experienced", sourceReliability: "known-good", observedAt: asVirtualTime((cycle - 1) * 1200 + 400), recordedAt: asVirtualTime((cycle - 1) * 1200 + 410), deliveredAt: null, certainty: { kind: "confirmed" }, supports: [], contradicts: [] },
      degradation: [], retrievalKeys: [speaker.toLowerCase()], truth: { isGroundTruth: true, isDecoy: false, relevantInvariants: [] },
    });
  }

  // The contradiction's reconciling detail (cycle 18): EK14 mentions laterally that it can
  // only see its own sector, which is what actually explains the premise/counter conflict.
  const reconcilingAtomId = "atom.demo.contradiction.reconciling";
  atoms.push({
    id: reconcilingAtomId, tier: "T4_lateral", origin: "lateral", cycle: 18, loadBearing: true,
    routes: {
      directed: { kind: "ask_unit", unitId: "EK14" },
      assistive: { kind: "free_text", exampleQueries: ["EK14 näkee?"] },
      substitutive: { kind: "free_text", exampleQueries: ["EK14 näkee?"] },
    },
    record: { kind: "lateral_traffic", speakerUnitId: "EK14", addresseeUnitId: "EK12", at: asVirtualTime(17 * 1200 + 200), content: "Näemme vain oman lohkomme, emme pohjoisreunaa.", droppedFromChannelSummary: true },
    provenance: { sourceId: "EK14", sourceClassId: "sc.experienced", sourceReliability: "known-good", observedAt: asVirtualTime(17 * 1200 + 200), recordedAt: asVirtualTime(17 * 1200 + 210), deliveredAt: null, certainty: { kind: "confirmed" }, supports: [], contradicts: [] },
    degradation: [], retrievalKeys: ["ek14", "pohjoisreuna"],
    truth: { isGroundTruth: true, isDecoy: false, contradictionRole: "reconciling", relevantInvariants: [], saidOn: "dmo" },
    consequence: { description: "explains the cycle-18 contradiction", manifestsAtCycle: 18, measureId: "t4_discovery.contradiction_reconciling" },
  });

  dutyOfficerMessages.push(
    { cycle: 1, at: asVirtualTime(0), text: "Tavoite: palo rajataan metsäautotien ja suon väliin. Painopiste kärjen pysäyttäminen koilliseen.", isStrategicGuidance: false, expectsReply: false },
    { cycle: 11, at: asVirtualTime(10 * 1200), text: "Uusi linja: ihmiset ja asutus ensin. Ei vapautuksia ennen lämpökameravarmistusta.", isStrategicGuidance: true, expectsReply: true },
  );

  const branches: Branch[] = [1, 2, 3, 4, 5].map((n) => ({
    id: `branch.top.${n}`,
    label: `Vaihtoehtoinen kehitys ${n}`,
    divergesAtCycle: ((n - 1) * 4 + 1) as CycleIndex,
    variedFactor: n % 2 === 0 ? "weather" : "discrete_event",
    description: "placeholder counterfactual (demo)",
    perimeterByCycle: {},
  }));

  const channelSets: ChannelSignalSet[] = Array.from({ length: 20 }, (_, i) => ({
    cycle: (i + 1) as CycleIndex,
    emitAtOffsetSeconds: 60,
    signals: [],
    trafficSummary: "",
    trafficSummaryOmitsAtomIds: [],
    restatesIntent: i + 1 > 10,
  }));

  const raw: ScenarioContract = {
    id: "demo-scenario",
    version: "0.1.0-demo",
    seed,
    constructs: ["containment-judgement-accuracy", "calibration", "demo-visualisation"],
    validity: {
      represents: ["a scripted incident used to demonstrate the instrument's UI and workflow"],
      doesNotRepresent: ["a real or domain-reviewed scenario", "validated fire behaviour"],
      authoredBy: "demo generator (synthetic)",
      reviewedBy: ["none — synthetic demo content, not reviewed by a domain expert"],
      sourceBasis: ["SPEC/18_Scenario_World_State.md (geography and story beats only, not reviewed numbers)"],
      knownDivergences: [
        "breach-rate: the projection breach rate is deliberately higher than an operational system's, to create error variance to calibrate against.",
        "fire-magnitude: the fire's magnitude is at the severe end of Finnish experience, chosen so the task requires multi-unit command.",
        "simulated-responder: the directed responder is an automated, authored system rather than a live person.",
        "demo-content: this entire scenario is synthetic placeholder content, not reviewed by a domain expert — see content/demo/README.md.",
      ],
    },
    extent: { crs: WGS84, south: 60.62, north: 61.07, west: 26.68, east: 27.6 },
    cycleCount: 20,
    virtualSecondsPerCycle: 1200,
    startVirtualClock: "13:20",
    invariants,
    contradiction: {
      id: "contradiction.demo",
      cycle: 18,
      premiseAtomId: atoms.find((a) => a.cycle === 18 && a.provenance.sourceId === "SPOT")!.id,
      counterAtomId: atoms.find((a) => a.cycle === 18 && a.provenance.sourceId === "EK14")!.id,
      reconcilingAtomId,
      subtlety: "medium",
      detectionProbeId: "probe.j.cycle_18",
      backupProbeId: "probe.j.cycle_20",
    },
    omission: {
      id: "omission.demo",
      cycle: 12,
      mechanism: "M1_shower",
      outsideEveryEnvelope: true,
      developmentAtomIds: [atoms.find((a) => a.cycle === 12)!.id],
    },
    probeSchedule: { probes },
    cycles,
    atoms,
    envelopes,
    channelSets,
    dutyOfficerMessages,
    branches,
    branchStatements,
    allocationSpace: {
      sectors: [
        { id: "L1", label: "Pohjoinen", geometry: irregularPerimeter(rng, LANDMARKS.cabins, 600, 0, 0.3) },
        { id: "L2", label: "Kärki", geometry: irregularPerimeter(rng, LANDMARKS.spruce, 600, 0, 0.3) },
        { id: "L3", label: "Etelä", geometry: irregularPerimeter(rng, LANDMARKS.bog, 600, 0, 0.3) },
      ],
      assets: UNIT_IDS.map((u) => ({ id: u, label: u, type: "pelastusyksikko" as const, availableFromCycle: 1 as CycleIndex, availableUntilCycle: null })),
      tasks: [
        { id: "task.direct-attack", label: "Suora hyökkäys", appliesToTypes: ["pelastusyksikko"] },
        { id: "task.defend", label: "Puolustava toiminta", appliesToTypes: ["pelastusyksikko"] },
        { id: "task.mopup", label: "Jälkisammutus", appliesToTypes: ["pelastusyksikko"] },
      ],
      viability: [],
    },
    allocationRecommendations: [],
    hinge: {
      afterCycle: 10,
      guidanceMessageId: "duty.hinge",
      pauseSeconds: 300,
      intentStatement: "Ihmiset ja asutus ensin. Ei vapautuksia ennen varmistusta.",
      alignmentRules: [],
    },
    sourceClasses: SOURCE_CLASSES,
  };

  return createScenarioContract(raw);
}

function formatClock(cycle: CycleIndex): string {
  const totalMinutes = 13 * 60 + 20 + (cycle - 1) * 20;
  const hh = Math.floor(totalMinutes / 60) % 24;
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
