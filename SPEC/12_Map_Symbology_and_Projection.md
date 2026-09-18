# 12 — Map symbology and projection rendering

**Version 3.0 · 16 September 2026.** New document. Closes the open item `11` §3.1 (the visual encoding system) and answers three questions the earlier set left unspecified: how the projection is drawn, whether it is graded by probability, and what is drawn on units and aircraft.

---

## 1. The three questions, answered up front

| Question | Answer | Section |
|---|---|---|
| Is the projection graded — nested bands, darker red = higher chance? | **No. One envelope, one boundary.** Graded bands make the primary measure undefined | §3 |
| Is anything drawn showing where a unit should go? | **Only where the participant has sent it**, in the anticipated-status convention. Never a machine recommendation | §6 |
| Is magnitude of change shown? | **Yes — on the fire, as a reported rate, not on the units as a plan** | §5 |

The reasoning matters more than the answers, because two of them are counter-intuitive and a builder who does not understand why will reintroduce the problem the first time the map looks sparse.

---

## 2. What operational practice actually does

### 2.1 Probability surfaces — and the documented misreading

The US **FSPro** model inside WFDSS produces exactly what the question describes: nested burn-probability contours from a large ensemble of simulations, at breaks around 0.2%, 5%, 10%, 20%, 30%, 40%, 60% and 80%.

It also carries, in its own documentation, the warning that makes this design decision for us:

> "It is important to remember that the different colors in an FSPro map represent burn probability contours, **NOT fire perimeters or fire shapes**."

and

> "The resulting burn probability maps are **easily misinterpreted as a fire progression** … FSPro results show probability contours NOT daily progression perimeters!"

An agency that has used graded probability contours operationally for two decades finds it necessary to warn trained users, in bold, that the bands are not perimeters. That is a strong signal about what a graded surface does to a reader under time pressure.

### 2.2 Deterministic construal error

The same finding is established experimentally in the hurricane forecast literature. The "cone of uncertainty" is a probability region, and people consistently read it as an object: they read the outer boundary as a hard safety line, and they read the widening of the cone as the storm *growing* rather than as forecast uncertainty increasing. Ruginski and colleagues (2016) and Broad and colleagues (2007, on the 2004 Florida season) document the misinterpretations; the general pattern is named the **deterministic construal error** — a probabilistic display construed as a statement about a single determinate object.

This is not a reason never to show uncertainty. It is a reason not to show uncertainty **in the geometry that a study is asking people to judge**.

### 2.3 Time-of-arrival isochrones

The dominant operational form in tactical products — Technosylva's Wildfire Analyst and Tactical Analyst, FARSITE, Prometheus — is the **time-of-arrival isochrone**: nested bands showing where the head is expected at +1 h, +2 h, +3 h. These are not probability; they are time. They are the most-used form because they answer the commander's actual question, which is *when does it reach the road*.

Isochrones are rejected here too, for a different reason (§7.2).

### 2.4 Military practice — the one convention worth stealing

MIL-STD-2525 and NATO APP-6 encode a distinction this design needs and had not specified: **status**. `STATUS_PRESENT` versus `STATUS_ANTICIPATED` (also called planned) is a first-class attribute of every symbol, rendered as a **solid frame for present and a dashed frame for anticipated or planned**.

That is exactly the distinction between "this unit is here" and "this unit is going here", and it is the right way to draw an allocation without drawing a recommendation. It is adopted in §6.

---

## 3. Why graded bands break this study specifically

Three arguments. The first alone is decisive.

### 3.1 The judged artifact must have one boundary

The primary measure is a containment judgement: *will the fire stay inside this envelope*, answered three ways with a confidence, twenty times. That judgement presupposes an unambiguous inside and outside.

Draw three nested bands and "the envelope" is undefined. One participant judges against the 80% band, another against the outer 5% band, a third against something in between — and none of them tells you which. Between-participant variance in **which line was judged** becomes indistinguishable from variance in **judgement accuracy**, which is the dependent variable. Calibration computed on top of that is calibration of an unknown quantity.

There is no scoring rule that recovers this. The answer key is polygon containment with a declared tolerance (`08` §6); with three polygons there are three answer keys and no way to know which one applies to a given response.

**This is not a preference. A graded envelope makes H2, the primary hypothesis, untestable.**

### 3.2 It hands back the cue the study removes

The claim is that machine integration delivers a forecast without the cues by which its reliability is judged (`01` §1). A display that renders the machine's own uncertainty as visible gradation gives part of that cue back, for free, in every condition.

That is a genuinely interesting manipulation — *does displayed uncertainty repair the metacognitive collapse?* — and it is a **fourth arm or a follow-up study**, not a rendering choice. Putting it in all three conditions weakens the manipulation and measures nothing about it, because there is no ungraded comparison.

### 3.3 The known misreading lands on the measured judgement

§2.1 and §2.2 together: under time pressure, readers treat the outer boundary of a graded region as a hard line and read band width as magnitude rather than uncertainty. In this study the participant is asked, twenty times, to judge exactly that boundary. Importing a documented perceptual confound into the dependent variable is not a trade worth making for visual richness.

---

## 4. What is drawn instead — the envelope

### 4.1 Geometry

**One polygon. One crisp boundary. One stated horizon.**

```
Stroke      2 px, solid, the projection hue, full opacity
Fill        the same hue at 12% opacity, FLAT — no gradient of any kind
Horizon     rendered as a label anchored to the polygon:
            "ennuste voimassa klo 15:05 saakka"
Attribution rendered with it: which system produced it, and at what time
```

**No gradient, deliberately.** An unlabelled gradient is read as probability whether or not it means probability — the value-suppressing-palette literature (Correll, Moritz & Heer) is consistent that a gradient the designer does not intend semantically is a gradient the reader will interpret semantically. If the design does not mean a gradient, it must not draw one.

### 4.2 Uncertainty is carried as an attribute, not as geometry

The envelope is not certain, and the display does not pretend otherwise. It carries the same four-value `Certainty` vocabulary as everything else (`04` §1), rendered on the **stroke**, not the area:

| Certainty | Stroke | Rationale |
|---|---|---|
| `confirmed` | solid | |
| `probable` | solid, lighter weight | |
| `uncertain` | dashed | Consistent with the anticipated-status convention in §6 |
| `unknown` | dashed + the explicit `unknown` badge | Never rendered as an absent envelope |

This gives honest uncertainty communication **without ambiguating the boundary being judged**. The inside/outside test is unchanged; only the reader's warrant for the line changes.

Certainty is identical across the three conditions, like every other property of the envelope (`02` §2).

### 4.3 The participant's own correction

When a participant answers `fundamentally_wrong` and draws a corrected projection, it is drawn in a **visually distinct treatment** — a different hue, heavier stroke — and both polygons remain on screen until the cycle closes.

Both visible simultaneously is the point: the correction is scored for relative accuracy against the machine's envelope (`08` §6.1), and a participant who cannot see both while allocating cannot exhibit doubt–action coherence one way or the other.

---

## 5. Rate of spread — where magnitude belongs

The request for magnitude is right. It belongs on the fire, and it must be an **observation, not a projection**.

### 5.1 The rate mark

At the fire head, and at each active flank, a directional mark whose **length is the distance the fire has been reported to travel over one cycle horizon** at the last reported rate. Twenty minutes at 9 m/min is 180 m, drawn to the map's scale so it can be laid against the envelope by eye.

```
Geometry    a tapered arrow from the reported perimeter point, along the
            reported direction, length = reportedRate * 1200 s, to scale
Label       Plex Mono: "9 m/min · EK11 · 16:42 (12 min)"
            value, source, observation time, and age
Staleness   graded with age, per §8
Absence     when no rate has been reported for that flank, NOTHING is drawn
            and the flank carries the explicit `unknown` badge
```

### 5.2 Why this is the right addition, and why it is safe

It puts the study's central cognitive act on the map without performing it. The participant can lay the reported rate against the projected envelope and see whether they agree. That comparison — reports versus projection — is precisely what `06` §4.3 says the study measures, as against the perceptual change-detection it deliberately removes.

It is safe because it is **authored data with provenance and age, subject to every other rule in the design**. It is a T1 atom. It has a source class with a reliability. It goes stale. And at the cycles where the record thins, it is simply absent — during the crown-run gap (`03` §7.3) there is no rate mark on that flank at all, which renders eighty-one minutes of organisational silence as a visible hole in the picture rather than as apparent stability.

**Authoring obligation.** The rate marks are authored per cycle per flank alongside the perimeters, and they are subject to Gate 1. If a rate mark and its envelope visibly disagree at every breach cycle, containment accuracy goes to ceiling and calibration becomes uninterpretable. The mix of agreeing, disagreeing, stale and absent rate marks is a **tuned quantity**, set in pilot 2, exactly like the containment item difficulty.

### 5.3 Rate marks by flag

Indicative authoring pattern, to be tuned in pilot 2:

| Flag | Typical rate-mark state |
|---|---|
| `holds` | Present, current, consistent with the envelope |
| `breach_quantitative` | Present but **stale** (20–60 min old), or current and only marginally inconsistent |
| `breach_categorical` | **Absent** on the breaching flank, or present on a flank that is not the one that fails |
| Omission cycle (12) | Present and current on the surface flanks, showing a *slowing* fire. Nothing represents subsurface smouldering, because no observation of it exists |

That last row is the omission mechanism made visual: every mark on the map is accurate, current and reassuring, and the thing that matters is not on the map because nobody observed it.

---

## 6. Units, aircraft and the arrow question

Three different things could be drawn on a unit. They are not the same thing and the design treats them differently.

### 6.1 (a) Where the unit is — **included**

Solid-framed symbol at the last reported position, with the position's age. Never rendered as present-at-last-known-position; staleness is graded and visible (`06` §3).

### 6.2 (b) Where the participant has sent it — **included, in the anticipated convention**

When the participant assigns a formation or asset to a sector and task, the map shows it, borrowing the MIL-STD-2525 status convention directly:

```
Solid symbol      last reported position          "it is here"
Dashed symbol     assigned sector                 "it is going here"
Thin dashed line  between the two                 the assignment
Task label        on the dashed symbol            what it was sent to do
```

This is **the participant's own order echoed back**, not a recommendation. It is state display in exactly the sense the standard intends, and it is strictly an improvement to the measurement: a participant who cannot see their own plan cannot reason about it, and allocation robustness, safety and decision-space narrowing are all measures of a plan the participant is assumed to be able to hold in view.

It is identical across conditions, and it appears only after the participant has allocated.

### 6.3 (c) Where the machine says it should go — **excluded**

Kalle's own instinct on this — *"Or perhaps no"* — is right. Four things break.

**The manipulation moves boundary.** The study's claim is about the **integration** boundary: the machine combines information that the human then acts on. A tasking arrow moves the machine to the **decision** boundary. That is a larger and different manipulation, and the two cannot be separated post hoc.

**Doubt–action coherence dies.** That measure asks whether a participant who rejects the projection then allocates consistently with their own correction (`08` §6.2). With arrows on the map, the participant is choosing between their correction and the machine's instruction. You would be measuring **compliance with a recommendation** — automation bias in tasking, a well-studied phenomenon — instead of the thing nobody has measured, which is whether a stated doubt survives contact with a decision.

**H5 collapses trivially.** Between-participant divergence in `substitutive` would fall toward zero because everyone followed the same arrows. The hypothesis predicts convergence *on a wrong picture through unnoticed integration*; convergence through explicit instruction is a different finding wearing the same number.

**Equal access is broken.** `directed` would receive no arrows. The conditions would then differ in what participants are *told to do*, not only in how information reaches them, and the capability matrix (`02` §2) would no longer hold.

### 6.4 The follow-up study this makes obvious

(c) is excluded from **this** study, not from the programme. A fourth condition — call it `directive`, where the machine integrates *and* recommends tasking — is the natural next experiment, and it is exactly the meaningful-human-control and responsibility-gap question the literature chapter already sets up.

**The architecture must not preclude it.** `AllocationRecommendation` is therefore defined in the data model (§10) and is simply never populated in this study's scenario. A later scenario populates it, the renderer already knows how to draw it in the anticipated convention with a machine attribution, and the engine needs no change. This costs one type and one unused branch now, and saves a fork later.

### 6.5 Aircraft

The drone and helicopter follow the same rules with two additions. A rendered sensor footprint while the platform is airborne, which **disappears when the platform is grounded** — the coverage gap after the drone goes down (cycle 8) is then visible as an absence rather than inferable only from missing reports. And endurance shown as remaining time with its own staleness, because the battery warning is a load-bearing T4 item (`02` §3.2).

---

## 7. Rejected alternatives, and what it would take to adopt each

Recorded so they are not re-proposed, and so a later study can pick them up deliberately.

### 7.1 Graded probability bands

**Rejected** per §3. To adopt: make it a fourth condition against an ungraded control, accept a larger recruitment, and restate the containment judgement against a single named band declared in the manifest and in the briefing. This is a good study. It is not this one.

### 7.2 Time-of-arrival isochrones (+20, +40, +60 min)

**Rejected**, though tempting — it is the dominant operational form and it would add realism cheaply.

The reason is independence. Showing +40 and +60 at cycle *N* gives the participant information about cycle *N+1* and *N+2*'s envelopes before those judgements are made. The twenty containment judgements would no longer be independent observations, which is the assumption every item-level model in `09` §7 rests on. It would also create an unauthored inconsistency channel: a participant comparing this cycle's +20 band against last cycle's +40 band has found a discrepancy nobody wrote, scored, or controlled.

To adopt: reduce to one judgement per session, or author the isochrone consistency explicitly across all twenty cycles as an additional truth surface. Both are expensive.

### 7.3 Ensemble or spaghetti perimeters

**Rejected.** Same defect as §3.1 — no single boundary to judge — plus the requirement to author an ensemble rather than a perimeter, which multiplies the geometry authoring by the ensemble size.

### 7.4 Animated perimeter growth

**Already rejected** in `06` §4.2, for reasons that stand: it converts the task into visual extrapolation, and it would shrink the `assistive`–`substitutive` difference toward nothing because a participant who can watch the fire advance does not need the channel's integration.

### 7.5 A soft or feathered envelope edge

**Rejected.** More realistic and less measurable: a feathered edge makes polygon containment scoring ambiguous at exactly the tolerance distances that decide the dependent variable.

---

## 8. The visual encoding system

This closes `11` §3.1. Five orthogonal properties must coexist on one map without collapsing into noise, remain legible for colour-vision deficiency, and survive a mediocre laptop panel.

**The rule: no property is carried by hue alone.** Every one has a redundant non-colour channel.

| Property | Values | Primary channel | Redundant channel |
|---|---|---|---|
| **Certainty** | confirmed · probable · uncertain · unknown | Stroke style: solid · solid light · dashed · dashed + badge | A glyph in the element's label row |
| **Staleness** | 0–5 · 5–15 · 15–40 · 40+ min | Opacity: 100 · 85 · 70 · 55% | Age in minutes, always printed in Plex Mono |
| **Unknown** | — | The `unknown` badge, an outlined glyph | Literal text *ei tiedossa*. **Never an empty cell** |
| **Urgency** (channel signals only) | 0 · 1 · 2 · 3 | Left-edge bar weight | Numeral printed in the signal row |
| **Standard identity** | own formation · aerial asset · fire · civilian/value at risk | Hue | Symbol shape, distinct at 16 px |

### 8.1 Hue assignments

Four hues only, plus the basemap. More than four and the map stops reading at a glance.

| Element | Hue | Notes |
|---|---|---|
| Own formations and assets | Cyan-blue | The MIL-STD friendly convention, which participants with any exercise background will read instantly |
| Fire — reported perimeter | Deep orange | The observed thing |
| Fire — projection envelope | Magenta-red | **Deliberately different from the reported perimeter.** The participant must never confuse what was observed with what was projected; that confusion is the whole study, and the display must not cause it |
| Participant's own correction | Yellow-green | Distinct from both |
| Values at risk, civilians | Neutral dark outline | |
| Basemap | Desaturated grey-green | Deliberately low-salience (`06` §3) |

The reported-versus-projected hue separation is the counterpart of the serif/sans rule for human report versus system output (`06` §3.1): the same distinction, carried twice, in two modalities.

### 8.2 Constraints that are tested, not assumed

Every pair in §8.1 is checked under deuteranopia and protanopia simulation and must remain distinguishable by shape alone with hue removed entirely. Every staleness step must be distinguishable at 100% and 125% text scaling. The whole encoding is verified on a low-gamut panel, because participants run this on their own machines. These are named tests in §11.

---

## 9. Per-cycle rendering

What the map shows at each cycle's projection reveal. Authored alongside the perimeters; this table is the authoring brief, and the specific rate values come from the domain reviewer (`11` §2.1).

| # | Flag | Envelope certainty | Rate marks | What the picture invites |
|---|---|---|---|---|
| 1 | H | `uncertain` | Head only, 20 min old, from the first arriving unit | Little to go on. The initial-uncertainty state is visible, not hidden |
| 2 | H | `probable` | Head + south flank, current | The picture firms up. Baseline for what "agreeing" looks like |
| 3 | Q | `probable` | Head current; **nothing on the second ignition** | A new fire with no rate reported. The envelope covers it anyway |
| 4 | H | `confirmed` | All flanks current | Reassuring and correct. Necessary — not every cycle is a trap |
| 5 | Q | `confirmed` | Head current, **but the stand boundary is on the reference layer, not the fire layer** | Mechanism M3. The rate is right for the fuel it is in and wrong for the fuel it is entering |
| 6 | **C** | `probable` | **Head mark absent** — the run started between reports | Categorical breach with nothing on the map to predict it, except the T4 ember warning from cycle 4 |
| 7 | H | `confirmed` | All flanks current | Recovery |
| 8 | Q | `probable` | Aerial-derived marks stop; **sensor footprint disappears** | The drone is grounded. Coverage loss is visible as an absence |
| 9 | **C** | `uncertain` | North flank **40 min stale**, others current | The wind backs onto a flank nobody has observed since the drone went down |
| 10 | H | `confirmed` | All flanks current, **all showing a slowing fire** | Apparent success. Every mark is accurate and the picture is wrong |
| — | | **HINGE** | | |
| 11 | H | `confirmed` | All current | Compliance. The private doubt is in the traffic, not on the map |
| 12 | **C + om** | `confirmed` | **Current, accurate, and showing continued slowing** | **The omission.** Nothing represents subsurface burning because nothing observed it. The map is honest and incomplete |
| 13 | H | `probable` | Current; the water route is a reference-layer feature, not a fire feature | The line fails where cycle 11's traffic said it would |
| 14 | Q | `uncertain` | Two flanks current, one absent | |
| 15 | **C** | `probable` | Present but **measuring surface spread while depth is the problem** | The rate mark is correct and answers the wrong question |
| 16 | H | `confirmed` | Current | Bridge limit is a reference-layer fact |
| 17 | Q | `probable` | **Gusts are in the weather series, not in the rate mark** | Mechanism M2, discoverable only by querying the weather |
| 18 | H | `probable` | **North flank carries two rate marks from two sources, different values, both current** | **The contradiction, visible on the map as two marks.** In `substitutive` the channel resolves them into one signal and the map still shows both — the seam exists and nothing points at it |
| 19 | Q | `uncertain` | Degrading as crews rotate | Fatigue in the data, not only in the participant |
| 20 | H | `probable` | Partial | Handover with an incomplete picture, as real ones are |

**Cycle 18 is worth a second look.** The two rate marks are on the map in every condition. In `directed` and `assistive` nothing has reconciled them, so a participant who looks sees two numbers. In `substitutive` the channel has emitted one settled signal, and the map still shows both marks — the evidence is present, unaltered, and unremarked. Equal access, unequal likelihood of looking (`02` §4), rendered.

---

## 10. Data model additions

Added to `04_Data_Model.md`. The types are defined here and the canonical copy lives there.

```ts
interface Envelope {
  // ... existing fields ...
  readonly certainty: Certainty;        // NEW — rendered on the stroke, §4.2
  readonly attribution: string;         // NEW — which system, at what time
}

/** An observed rate of spread. Data, not projection. §5 */
interface RateMark {
  readonly id: string;
  readonly cycle: CycleIndex;
  readonly flank: "head" | "north" | "south" | "east" | "west" | "rear";
  readonly anchor: LatLon;              // on the reported perimeter
  readonly bearingDeg: number;
  readonly rateMetresPerMinute: number;
  readonly provenance: Provenance;      // source, observedAt, age, certainty
  readonly consistentWithEnvelope: boolean;  // TRUTH. Never rendered
}
// A flank with no RateMark for a cycle renders the `unknown` badge.
// Absence is authored, never incidental.

/** The participant's own allocation, drawn in anticipated status. §6.2 */
interface AllocationMark {
  readonly assetId: string;
  readonly fromPosition: LatLon;        // solid symbol, last reported
  readonly toSectorId: string;          // dashed symbol, assigned
  readonly taskId: string;
  readonly assignedAtCycle: CycleIndex;
}

/** DEFINED AND NEVER POPULATED IN THIS STUDY. §6.4 */
interface AllocationRecommendation {
  readonly assetId: string;
  readonly toSectorId: string;
  readonly taskId: string;
  readonly machineAttribution: string;
  readonly certainty: Certainty;
}

interface SensorFootprint {
  readonly platformId: string;
  readonly cycle: CycleIndex;
  readonly geometry: Polygon | null;    // null once grounded — absence is the signal
}
```

**CI assertion:** `scenario.allocationRecommendations.length === 0`. The type exists so the architecture does not fork later; a scenario that populates it in this study is a defect, and the check says so out loud.

---

## 11. What must be tested

Added to `10_Build_Plan_and_Acceptance.md` under M3.

`test/render/envelope-single.spec` — exactly one envelope polygon is rendered per cycle, with no gradient fill and no nested geometry. This is the guard on §3.1 and it is the most important test in this document.

`test/render/no-recommendation.spec` — no allocation mark is rendered that the participant did not create. Asserted by driving a full scenario with zero allocations and checking the map carries no anticipated-status symbol.

`test/render/rate-absence.spec` — a flank with no authored `RateMark` renders the `unknown` badge and not an empty space.

`test/render/cvd.spec` — every hue pair in §8.1 remains distinguishable by shape with hue removed, under deuteranopia and protanopia simulation.

`test/render/staleness.spec` — the four staleness steps are distinguishable at 100% and 125% text scale, and the age is always printed.

`test/render/hue-separation.spec` — reported perimeter and projection envelope are never rendered in the same hue, in any state, including during change highlighting.

---

## 12. Open items this document creates

Added to `11_Open_Design_Register.md`.

**The rate-mark consistency mix** (§5.2) is a tuned quantity and is not yet set. It interacts directly with Gate 1: too many disagreeing marks and containment accuracy goes to ceiling. Pilot 2 sets it.

**The exact rate values per flank per cycle** (§9) come from the domain reviewer along with the spread rates, and are the same blocking item as `11` §2.1.

**Whether the graded-envelope variant becomes a fourth arm** (§7.1). This is a real study and a real decision, and it is downstream of the participant-pool question (`11` §1.1). Do not commit until the pool is known.

**Symbol shapes** for the four standard identities, distinct at 16 px. Not drawn. Small, but it blocks `test/render/cvd.spec`.
