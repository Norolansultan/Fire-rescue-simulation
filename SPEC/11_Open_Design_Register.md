# 11 — Open design register

**Version 3.14 · 17 September 2026.** Supersedes `06_Pre_Build_Checklist.md` and `12_Consistency_Audit_and_Open_Design.md`.

> **Changelog**
> - **3.14 · 17 Sep 2026** — `18` adopted into `03`; query database specified in `19`; §7.4 added.
> - 3.13 · 17 Sep 2026 — §7.3 items drafted in `18_Scenario_World_State.md` (pending domain review).
> - 3.12 · 17 Sep 2026 — §7.3 added: scenario world-state gaps.
> - 3.11 · 17 Sep 2026 — revision (f): LLM (facts) group removed; Radio 70, LLM reasoning 130 (65/65).
> - 3.10 · 17 Sep 2026 — revision (e): three groups restored (Radio, LLM, LLM reasoning); only LLM reasoning split; F3 closed.
> - 3.9 · 17 Sep 2026 — allocation free-text rationale kept; branch-list ground-truth rule confirmed.
> - 3.8 · 17 Sep 2026 — no fifth option in the course-of-action choice; branch-list ground-truth rule added (`03`, `04`, `10`).
> - 3.7 · 17 Sep 2026 — P2 answered (fixed template); P8 answered (session length accepted as is).
> - 3.6 · 17 Sep 2026 — P1, P4, P5, H1, H3 and the group structure answered (revision (d)). §7.1 and §7.2 updated.
> - 3.5 · 17 Sep 2026 — §7.2 added from the pre-build review (`17`) and the projection-loop handoff.
> - 3.4 · 17 Sep 2026 — F4 sub-question answered (only the reasoning-AI group is split); probe schedule revised (10 / 6 / 9, five items per freeze); prologue decided. §7.1 updated.
> - 3.3 · 17 Sep 2026 — F5, F6, F7 and F8 answered and implemented in `15` and `16` with amendments to `01`–`10`. New open items §7.1. §4.1 reduced.
> - 3.2 · 17 Sep 2026 — F2 answered (no live LLM for now; reasoning-AI group served by the same closed retrieval engine; see `14`). F3 answered provisionally (no AI / query AI / reasoning AI). F4 answered in principle (single guidance episode; AI groups split into guidance-via-AI and guidance-as-for-no-AI); one sub-question remains.
> - 3.1 · 17 Sep 2026 — §1.1 updated: participant pool stated as 200 firefighters; echelon unconfirmed. New §7 registers forks F1–F8 arising from study-plan decisions made on 16–17 Sep 2026 that conflict with v3.0; see `13_Plan_Reconciliation_2026-09-17.md`. No other document was changed.
> - 3.0 · 13 Sep 2026 — initial consolidated register; §3.1 closed by `12` (16 Sep).

**This document overrides any other that appears to settle an item listed here.** An item marked open must not be guessed by a builder. If you are an AI agent implementing this system and you reach one of these, stop and ask.

Each item states: what is missing, who can supply it, what it blocks, and what it costs to get wrong.

---

## 1. Blocking — the build cannot correctly proceed past a named milestone

### 1.1 Participant pool at incident-command level — **verify first**

**Missing:** how many serving or training officers at *pelastusjoukkue* command level can realistically be recruited through the training institution and regional departments.

**Who:** Kalle, with the host institution. A conversation, not research.

> **Update 17 Sep 2026 — partially answered.** Kalle states the pool is **200 firefighters**. That size supports three conditions at ~67 each and reopens the options in `02` §7.2 (see §7, F4). Echelon answered the same day: mostly incident-command level (F8, `15` §8). **Still open:** whether 200 is the recruited or completed figure (§7.1).

**Blocks:** M5 condition configuration, and the whole design.

**Cost of getting it wrong:** three conditions at thirty each is the minimum viable form of the mechanism design. If the realistic pool is sixty, the design must change to two conditions (dropping `directed`, keeping the primary contrast) or to a within-subject structure — and a within-subject structure is incompatible with a single twenty-cycle scenario, so it would also change the scenario. **This decision is free today and catastrophic in month six.**

It also decides whether Paper 2 can run as a separate study with its own participants (`02` §7.2), which is the cleaner resolution of the guidance-mode confound.

### 1.2 A named domain reviewer

**Missing:** an identified, committed fire officer or *Pelastusopisto* instructor with time budgeted.

**Who:** Kalle.

**Blocks:** the scenario, and therefore pilot 2, and therefore everything after it.

**What they must rule on**, in order: rates of spread cycle by cycle (§2.1); whether four formations plus a drone is right for this incident in this region and when escalation would occur; drone endurance, payload and the airspace deconfliction rule when a helicopter arrives; whether the ditch-slash re-ignition mechanism is recognised in southeast Finland; whether the released-formations conflict in phase B is realistic; the exact field structures of the seven record types; the Finnish register of every authored record; and the channel vocabulary (§1.3).

**Cost of getting it wrong:** officers disengage from an implausible scenario, and disengagement is indistinguishable from the effect being measured.

### 1.3 The channel signal vocabulary — **the single blocking technical item**

**Missing:** six to eight situation categories for the wildfire domain, fixed before the study, each expressible with urgency 0–3 and a certainty value.

**Who:** Kalle with the domain reviewer.

**Blocks:** M6, and therefore the entire `substitutive` condition, and therefore the primary contrast.

**What the vocabulary must satisfy:** closed and small; jointly exhaustive over what the twenty cycles contain; mutually exclusive enough that authoring a signal set is deterministic; orthogonal to urgency; expressible in a short Finnish phrase; and capable of carrying an all-clear.

Candidate shape, for the reviewer to accept, reject or replace — *not a decision*: fire behaviour and spread; resource state and availability; access and terrain; values at risk and civilians; crew safety; weather; information quality or gap.

**Cost of getting it wrong:** if the vocabulary is too rich, the channel becomes a summariser and the manipulation collapses into an explanation-design study. If too poor, participants disregard it and the condition has no effect to measure.

**Mitigation available now:** `directed` and `assistive` are fully buildable without this. If the vocabulary is delayed, build and pilot those two arms (`10` §3).

### 1.4 The allocation task space

**Missing:** the actual sectors on the map, the asset types and their real designations, and the task options per sector — enough to produce twenty to sixty meaningful distinct allocations.

**Who:** Kalle with the domain reviewer.

**Blocks:** M8, and the viability / robustness / safety table, which is the largest single authoring artifact after the corpus.

**Cost of getting it wrong:** allocation robustness, allocation safety, decision-space narrowing and doubt–action coherence all depend on it. Four secondary measures and one of the study's most interpretable findings.

### 1.5 Hosting, processing agreement and the DPIA

**Missing:** the hosting decision, the processing agreement, the retention schedule, and the consent text naming query text and free-text fields as personal data.

**Who:** Kalle with LUT's data-protection function.

**Blocks:** **pilot 1**, not the main study. Pilot 1 already transmits real participant data.

**Cost of getting it wrong:** a data-protection problem discovered after collection is unrecoverable.

---

## 2. Blocking authoring — the corpus cannot be written without these

### 2.1 Rates of spread, cycle by cycle

The judgement Kalle cannot make alone and the one that decides whether officers engage. Indicative values are in `03` §3.2; the per-cycle series is not authored. **Everything geometric in the scenario derives from this** — the twenty perimeters, the twenty envelopes, the breach geometries, the branch perimeters.

### 2.2 The perimeter and envelope geometry series

Twenty authored perimeters, twenty envelopes with their breach geometries, and the actual-perimeter-at-end for each cycle. None drawn. This is a GIS task, not a writing task, and it needs a drawing workflow decided before it starts — QGIS with an export to the bundle format is the obvious route and is not yet specified.

### 2.3 The Finnish register of every record

The clumsiness catalogue in `03` §7.2 gives the *forms*; the wording is placeholder and reads as a non-native approximation of radio Finnish. A native professional must rewrite all 290–400 records. **This is not polish.** Records that read wrong are records officers discount, and the whole information-seeking measure depends on them being taken seriously.

### 2.4 The Finnish string table

Every interface string, every probe prompt, every option label, every error message. Not written. It is also the artifact the domain reviewer reviews as a unit for register.

### 2.5 The item banks

Thirty containment items for twenty slots. Thirty recall items for eighteen. Five falsification items for three. Three contradiction candidates of graded subtlety. The forced-choice distractor set. None written.

### 2.6 The five counterfactual branches

Easy to postpone and impossible to omit. Three secondary measures and the off-branch definition depend on them.

### 2.7 The allocation viability / robustness / safety table

Twenty to sixty allocations × at least five branches × three scores. This is combinatorially large and needs a generation-then-review workflow, not hand authoring. Not designed.

---

## 3. Design decisions not yet made — buildable placeholders exist, but the choice is real

### 3.1 The visual encoding system — **CLOSED**

Specified in `12` §8: five properties, each with a redundant non-colour channel, four hues, and six named tests. `12` also settles the projection rendering (one boundary, no gradation), the unit and aircraft marks, and the reported-rate mark.

Three smaller items were opened in its place and are listed at §3.10 below.

### 3.2 Drawer internal organisation

Tabs, a single scrolling surface, or search-first with results. The one remaining information-architecture question. Recommendation, not decision: search-first in `assistive` and `substitutive` (the free-text field is the point), tabs in `directed` (there is no free-text field, so the surfaces must be navigable).

### 3.3 Bubble delivery timing within the working period

The working period is 90 seconds and bubbles arrive at authored offsets. The *distribution* of those offsets — even, front-loaded, clustered — is a real manipulation of workload and is unspecified. It must be identical across conditions and declared.

### 3.4 Retrieval ranking and the recall floor

The scoring function over key overlap, recency and reliability is described in `05` §7 but not specified numerically, and the recall floor for `test/retrieval/recall.spec` has no value. Both come out of pilot 1's Finnish query corpus.

### 3.5 The declared thresholds

Every exclusion rule and several tests reference a "declared threshold" that has no value yet:

blur threshold · idle proportion of task time · plausible-reading floor for judgements · minimum information-seeking acts · region-familiarity exclusion threshold · containment tolerance in metres · pre-flight benchmark threshold · resume interval limit · channel engagement floor · retrieval recall floor · latency-distribution match tolerance.

Most come from pilot 1 or 2. **All must be fixed and pre-registered before main collection**, and a table of them belongs in the pre-registration.

### 3.6 The attention check and the training competence gate

Neither is designed. The training scenario is three practice cycles in the participant's own condition; what the gate tests and what failing it means are unspecified.

### 3.7 Whether the revised-projection option is adopted

`08` §7. Costs twenty envelopes and a UI action; yields a measure of whether a doubting participant asks the machine again. **Decide at pilot 2**, and if adopted, confirm the viability table can score against a participant-drawn projection before M8.

### 3.8 Degenerate participant input

What happens when a participant draws a two-vertex "polygon", a polygon covering the whole extent, or marks a breach point in a lake. Not specified. The instrument must accept it, log it, and let analysis handle it — **it must not validate the participant's judgement**, because a rejection the instrument refuses is a measurement that never happened.

### 3.9 Unit designators and sector names

`EK11`, `EK12`, `EK14`, `DRONE1`, `P3` are used throughout as placeholders. Whether they match South Karelia and Kymenlaakso practice is unverified, and they appear in hundreds of authored records — changing them later is a corpus-wide edit.

---

### 3.10 Items opened by the symbology decision

**The rate-mark consistency mix.** How often the reported rate mark agrees with the envelope, disagrees, is stale, or is absent (`12` §5.2). This interacts directly with Gate 1: too many visibly disagreeing marks and containment accuracy goes to ceiling, and calibration becomes uninterpretable. **Pilot 2 sets it**, alongside the containment item difficulty and for the same reason.

**Symbol shapes** for the four standard identities — own formation, aerial asset, fire, value at risk — distinct at 16 px with hue removed entirely. Not drawn. Small, but it blocks `test/render/cvd.spec`.

**Whether the graded-envelope variant becomes a fourth arm** (`12` §7.1). Showing the machine's uncertainty as nested probability bands is excluded from this study because it makes the containment judgement undefined — but *does displayed uncertainty repair the metacognitive collapse* is a good question and the natural companion experiment. It needs an ungraded control, so it is a fourth arm or a follow-up, never a rendering change. **Downstream of §1.1; do not commit until the pool is known.**

**Whether a `directive` fourth condition follows** (`12` §6.4). A machine that recommends tasking, not only integrates information. `AllocationRecommendation` is defined in the data model and asserted empty, so the architecture does not fork — but whether the experiment runs is undecided, and it is the same recruitment question.

---

## 4. Separate deliverables, not part of this instrument

### 4.1 The pre-session battery

> **[SUPERSEDED 2026-09-17]** The metacognition battery is dropped (F5). The pre-session component is now consent, demographics incl. echelon, and the AI-literacy instrument (~15 min). It still needs instrument selection and ethics coverage, but no adaptive staircase.

Forty-five minutes: consent and demographics, an AI-literacy instrument plus a short performance component, and a metacognition battery of two blocks with an adaptive staircase and 100+ trials.

**It is load-bearing** — per-participant metacognitive efficiency comes from here, because twenty in-scenario judgements cannot support that estimate — **and it is not built on this codebase.** The specific instruments are not selected. It needs its own build plan, its own ethics coverage and its own pilot.

### 4.2 The coding manuals

The open uncertainty probe has four categories named in `08` §3.5 and no operationalisation — no anchors, no examples, no disagreement-resolution rule. The walkthrough coding scheme has five codes named in `09` §5.2 and the same gap. Both need a manual, a training set, and a double-coded reliability subset.

### 4.3 The pre-registration

Not drafted. It must carry: the hypotheses as stated in `01` §3; the primary contrast; the models in `09` §7; the threshold table from §3.5 above; the exclusion cascade; the power simulation result; and the direction of the AI-literacy prediction.

---

## 5. Risks that are decided but should be watched

**The session is 102 minutes.** Deliberate (`01` §2) and the largest attrition risk in the design. Pilot 3 measures it. If dropout concentrates in phase B it will correlate with fatigue, which is exactly the variable of interest — meaning attrition is not missing-at-random and must be modelled, not merely reported.

**Guidance mode is confounded with condition** (`02` §7.2). Declared, and revisited if §1.1 shows the pool supports a separate Paper 2 study.

**The breach rate is deliberately high.** Declared in `knownDivergences`. It limits generalisation to real deployed tools and a reviewer will say so; the answer is that without error variance there is nothing to calibrate.

**One scenario** means content and manipulation cannot be separated. The correct comparison is still being made — conditions are compared within identical content — but generality across incidents is unestablished and the temporal holdout is a weaker substitute for a transfer test.

**`directed` may be slower than `assistive` despite latency matching**, because navigating by hand takes longer than querying regardless of reply latency. This is not a confound to remove — it is part of what the conditions are — but it must be measured and reported, because a tempo difference will be offered as an alternative explanation for any calibration difference.

---

## 6. What to do first

In order, and the first three are conversations rather than work.

0. **Close the remaining items in §7.1.** F2 and F5–F8 are answered; the F4 sub-question and the block split change cell sizes and authoring volume.
1. **Verify the participant pool** (§1.1). It can change the design. *Size now known (200); echelon still open.*
2. **Secure the domain reviewer** with time budgeted (§1.2).
3. **Settle hosting and the DPIA** (§1.5), because pilot 1 needs it.
4. **Fix the channel vocabulary** with the reviewer (§1.3), so M6 is not the critical path.
5. **Author the rate-of-spread series and the perimeter geometry** (§2.1, §2.2), because every other authored artifact derives from them.
6. **Build M1–M4** in parallel with 4 and 5. They depend on none of it.
7. **Draw the four symbol shapes** (§3.10) before M3 writes its first map layer. The rest of the encoding is settled in `12` §8.

Everything else can wait, and most of it will be answered by a pilot rather than by thinking harder.

---

## 7. Forks raised on 17 September 2026 — **open, do not build past them**

Study-plan decisions made in chat on 16–17 Sep 2026 conflict with v3.0 in the places below. Each is analysed in `13_Plan_Reconciliation_2026-09-17.md` §3. **Until answered, v3.0 governs**; a builder reaching any affected milestone stops and asks.

| Fork | Question | Blocks |
|---|---|---|
| **F1** | Is v3.0 the base, with chat decisions applied on top, or is it replaced? | Everything below |
| **F2** | ~~Language model in the instrument?~~ **Answered 17 Sep:** reasoning-AI group required; built on the same closed retrieval engine as query AI; LLM used at authoring time only; live LLM deferred. See `14` | M5, M6 must be re-specified from `14` |
| **F3** | **Provisionally answered:** no AI = `directed`, query AI = `assistive`, reasoning AI = `substitutive`. Still open: keep or rename the ids; reasoning AI is now request-driven, not pushed (`14` §7) | M5 configuration, `02` §1 |
| **F4** | **Answered:** one guidance episode (the hinge). Only one AI group — reasoning AI — is split into guidance-once and guidance-via-AI; all others receive it once (`02` amendment) | `02` §7.2, `04` §11, `09` §2, H8 |
| **F5** | ~~Drop the battery?~~ **Answered:** dropped; replaced by five warm-up cycles (`15` §3, §7) | Done |
| **F6** | ~~Probe schedule?~~ **Answered (revised):** 10 freezes × 5 items (2 × L1, 2 × L2, 1 × L3), 6 SPAM, 9 unprobed; prologue 2/1/2; deterministic (`15` v1.1 §4) | Done |
| **F7** | ~~Decision task?~~ **Answered:** both — course-of-action choice then allocation (`16`) | Done |
| **F8** | ~~Echelon?~~ **Answered:** mostly incident-command level; echelon stratified and modelled (`15` §8) | Done; recruited vs. completed open (§7.1) |

### 7.1 Still open after 17 September 2026

| Item | Default in the spec | Where |
|---|---|---|
| ~~Group structure~~ **Answered (d):** no AI 70, AI 130 split 65/65 | — | `02` revision (d) |
| ~~Group sizes~~ **Answered (f):** Radio 70, LLM reasoning 130 (65/65) | — | `02` revision (f) |
| ~~Fifth option in the course-of-action choice?~~ **Answered:** no | — | `16` revision (d) |
| ~~Free-text allocation rationale~~ **Answered:** kept | — | `06` §4.5, `08` |
| **F1** — v3.0 as base | Treated as yes | `13` |
| ~~F3 — condition ids~~ **Answered (e):** `directed` / `assistive` / `substitutive` = Radio / LLM / LLM reasoning | — | `04` revision (e) |
| ~~Reasoning-AI group size~~ superseded by 70 / 130 | — | — |
| Which L1 item becomes the phase-B intent item | Second L1 item | `15` §4.4 |
| 200 recruited or completed | Recruited | `15` §8 |
| Embedding model and runtime library (licence check) | None chosen | `14` §5 |
| Reasoning-package topic list | Not written | `14` §10 |
| Cycle 1 re-authoring to follow the prologue | Not written | `03` amendment |

### 7.2 Raised by the pre-build review (`17`) — **block M5–M8**

| Id | Question | Recommended | Blocks |
|---|---|---|---|
| **P1** | ~~Push or pull?~~ **Answered (d):** pull only, with group-specific training; hypotheses restated (`01` revision (d)) | — | Done |
| **P2** | ~~Prose or template?~~ **Answered:** fixed template (`14` revision (d)) | — | Done |
| **P3** | Rule: reasoning packages derive from the envelope's model state, never from truth | Adopt | `14` §4; authoring |
| **P4** | ~~How intent is maintained~~ **Answered (d):** query answers carry an intent line (`14` revision (d)) | — | Done |
| **P5** | ~~Alignment feedback~~ **Answered (d):** removed | — | Done |
| **P6** | Paper 1 primary window | Phase A only | `09` §7.1; pre-registration |
| **P7** | Freeze L3 items: consequence rule written into `08` revision (d) — **confirm** | Consequence items only | Item bank |
| **P8** | ~~Session length~~ **Answered:** kept at ~145 min; attrition modelled, not designed away | — | Done |
| **H1** | ~~Adopt branch choice?~~ **Answered (d):** adopted — four authored options + *Ei mikään näistä*, no free text | — | Done |
| **H2** | Branch list on `fundamentally_wrong` only, or also `partly_wrong` | Pilot | M7 |
| **H3** | ~~Degenerate input~~ **Answered:** accept and log | — | Done |

### 7.3 Scenario world state — **adopted (`18` v0.2, `03` revision (g)); pending domain review**

`03` fixes the story skeleton (20 cycle titles, flags, failure mechanisms, hidden information). It does not yet fix the concrete world a builder renders. Possibly present in `PhD_Simulation_Scenarios.xlsx`, which has not been reviewed.

| Missing | Why it blocks |
|---|---|
| **Initial commander's intent** and **the hinge guidance text** (what the strategy is, and what changes) | Paper 2 decision items, intent recall items, intent lines — all score against it |
| Ignition point, sector names and geometry, stand map (where the spruce, lichen-heath ridge, peat, deciduous breaks and ditch-slash are) | Envelopes, perimeters, allocation space |
| Per-cycle weather series: wind direction and speed / gusts, shower timing, FFMC, DC, ISI, BUI | Spread, M1–M4, weather atoms |
| Per-cycle unit timeline: EK11, EK12, EK14, fourth formation, DRONE1, helicopter, escalation units, relief and reinforcements — positions, status, arrivals | Unit layer, status atoms, allocation |
| Drone timeline: sectors covered, battery, grounding at 8, return or not | Sensor footprint, staleness, T4 battery item |
| Values at risk: summer houses, roads, bridge, water points, water-shuttle route, evacuation area | Allocation safety, cycles 9, 13, 16, 17 |
| Omission location (cycle 12) and contradiction geography (cycle 18) | The two designed failures |
| The second incident and the released-formations conflict (cycle 14) | Phase B storyline |
| Prologue storyline W1–W5 and re-authored cycle 1 | Warm-up |
| Update of `03` §2.2, §8, §10, §11 for pull-only, two conditions and the unused channel | CI validation list still references three conditions and the pushed channel |

### 7.4 Query database (`19`) — open

| Item | Default |
|---|---|
| Talk-group plan and names | Placeholders JOHTO, TOIMINTA-1/2, ILMA, YHTEISTOIMINTA |
| Automatic transcription of talk groups available in-incident by 2030 | Assumed; reviewer to confirm |
| Record volume (~460–590 authored) vs. authoring budget | Exceeds `02` §3 range; budget to be re-estimated |
| Police evacuation status shared with the commander | Not shared (ask only) |
