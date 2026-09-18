# 09 — Methods, protocol and analysis

**Version 3.1 · 17 September 2026** (v3.0 · 13 September 2026). Supersedes `04_Methods_v2.md`. All two-sitting, eight-cycle and two-scenario language is replaced.

> **Changelog**
> - **17 Sep 2026 (f)** — LLM (facts) group removed. Two groups: Radio (70) and LLM reasoning (130, pull-only); LLM reasoning split 65 / 65 at the hinge (guidance once vs. intent line in AI answers).
> - **17 Sep 2026 (e)** — three Paper 1 groups restored — Radio, LLM, LLM reasoning; both LLM groups pull-only; only the LLM-reasoning group is split at the hinge by how it receives the guidance. Group sizes open (default 70 / 65 / 65).
> - **17 Sep 2026 (d)** — two groups (no AI 70, AI 130); AI group pull-only with group-specific training; AI group split 65/65 at the hinge, the via-AI half receiving query answers framed against the commanded strategy; branch choice adopted with four authored options plus *Ei mikään näistä*, no free text; per-choice alignment feedback removed.
> - **17 Sep 2026 (c)** — only the reasoning-AI group is split by guidance mode; prologue warm-up; 10 freezes × 5 items, 6 SPAM, 9 unprobed (see `15` v1.1).
> - **3.1 · 17 Sep 2026** — Participants (F8), procedure (F5), guidance split (F4) and power statements updated.

---

## 1. Administration

**Remote and unsupervised, on the participant's own computer**, via a hosted web application. There is no operator present at any point during the session.

Four consequences, each handled rather than absorbed.

**No live confederate.** The `directed` responder is automated, and the condition is named `directed` rather than `human` for that reason (`02` §1.1).

**No retrospective walkthrough inside the session.** It moves to a separately scheduled remote video call with a subsample, conducted against a replay of that participant's own session. What that costs is stated in §5.2.

**No invigilated attention.** Replaced by attention checks, idle and blur logging, a competence gate in training, and the exclusion rules in §6.

**Data leaves the participant's device.** The earlier claim that local-only processing removed a class of data-protection problem no longer holds. See §8.

---

## 2. Participants

> **[SUPERSEDED 2026-09-17]** Target and stratification updated in the amendment below.

Serving or training officers at wildfire incident-command level, recruited through a rescue-services training institution and regional rescue departments.

**Target thirty per condition after exclusion; recruit 110–130**, the upper figure raised because unsupervised administration and a 102-minute session both raise expected attrition.

> **The pool figure requires verification before the build reaches condition configuration.** Three conditions at thirty each is the minimum viable form of the mechanism design. If the realistic pool at this echelon is sixty, the design changes to two conditions or a within-subject structure. That decision is cheap now and expensive later. See `11` §1.1.

**Allocation.** Block randomisation with stratification on incident-command experience and prior simulation exposure, performed server-side at session start. The client never chooses its own condition.

**Covariates recorded:** role and rank, years of service, incidents commanded, prior simulation exposure, self-reported familiarity with the scenario region, and the environment descriptors captured automatically — viewport dimensions, device pixel ratio, pointer type, browser, operating system, and the pre-flight benchmark score.

**Viewport size is not a nuisance variable.** It determines how much of the map is visible, which affects every information-seeking measure, and it enters the models as a covariate.

---

## 3. Procedure

> **[SUPERSEDED 2026-09-17]** The pre-session battery row is reduced to 15 min; warm-up block and tutorial added; session ~135 min. See `15` §2.

| Stage | When | Duration | Notes |
|---|---|---|---|
| Pre-session battery | Several days before | 45 min | `01` §7. Never on the day |
| Scheduling and technical check | Before the day | 5 min | Pre-flight run standalone; refusal handled before the session is booked |
| Consent confirmation and briefing | Session start | 12 min | Includes the scripted-exercise statement, `06` §4.6 |
| Training scenario | Session start | included above | Three practice cycles in the participant's own condition, with a competence gate |
| **Cycles 1–10** | | ~35 min | Phase A |
| **Hinge pause** | Between 10 and 11 | 5 min | Dismissible early. Strategic guidance delivered on exit |
| **Cycles 11–20** | | ~35 min | Phase B |
| Post-session questionnaire | Immediately | 15 min | Before any debrief content |
| Asynchronous written debrief | Within 48 h | — | §5.1 |
| Retrospective walkthrough | Subsample, separately scheduled | 45 min | §5.2 |

**One continuous session.** The twenty cycles are not split into sittings. Sustained attention under accumulating fatigue is part of the phenomenon, and the hinge pause is the only break.

**Attestation, at session start, worded to match:** *that the session will be completed in one sitting without interruption; that no external sources or colleagues will be consulted; and that the scenario content will not be discussed with anyone who may also participate.* The previous wording implied a sitting could be one of several and must not be reused.

---

## 4. What the participant is told

They are commanding a wildfire incident in southeast Finland at the level of a *pelastusjoukkue*, reporting to a duty officer. They will receive reports, may seek further information by the means available to them, and will be asked at intervals to judge a projection, state their confidence, and assign resources.

They are told plainly that **the incident develops according to its own dynamics, fixed in advance so that all participants face the same situation, and that their decisions are recorded and evaluated.** They are not told their decisions "do not matter" — decisions are scored for robustness and safety, and doubt–action coherence is a primary measure.

They are not told the projection's accuracy rate, that a contradiction is embedded, or what the conditions are.

---

## 5. Debrief and reasoning mode

### 5.1 Debrief — required, not optional

A written debrief is sent within 48 hours. It discloses the embedded contradiction and the omission, explains why they were there, states the projection accuracy rate, and gives the participant a route to withdraw their data after learning what the study was doing.

This is not a courtesy. Participants were given a projection engineered to be wrong at a known rate and a planted inconsistency; leaving professionals with the impression that their judgement failed, when the materials were built to produce that, is not acceptable. It is asynchronous and written because the session is unsupervised, not because it is optional.

**The debrief is sent after the questionnaire, never before.** A debrief that reveals the planted inconsistency contaminates every self-report after it.

### 5.2 Reasoning mode

The direct test of whether the machine moves experts out of recognition-primed processing.

Collected by **retrospective walkthrough against a replay of the participant's own session**, on a separately scheduled remote video call with a subsample, audio-recorded and coded. Not by live think-aloud, which at this tempo would itself push participants toward deliberation and contaminate the comparison.

Codes: distinct options considered before commitment; presence and depth of mental-simulation statements; whether alternatives were compared or the first workable option satisficed; explicit assumption statements; self-reported basis for the judgement.

**What decoupling costs.** The walkthrough now happens days later rather than minutes later, so recall is weaker and the replay carries more of the load. The subsample is self-selecting among those willing to schedule a second session, which is a bias to declare. The measure therefore triangulates rather than carries a hypothesis. Target twelve to eighteen participants, balanced across conditions.

---

## 6. Post-session questionnaire and exclusions

### 6.1 Questionnaire

Administered immediately, while the session is fresh, and before any debrief content.

Perceived workload, using a short validated instrument — **required** for the workload-confound check (`02` §5). Perceived quality and trustworthiness of the situational picture. Trust in the information channel. **Perceived own accuracy** — how many of the twenty containment judgements the participant believes they got right — which paired with actual accuracy is a second, cruder calibration measure at almost no cost, and is the measure closest to the published performance–metacognition disconnect.

Substituting partially for the walkthrough: self-reported number of distinct possibilities considered at the most recent judgement; self-reported basis for that judgement as short free text; whether the participant recalls disagreeing with the projection at any point and what they did about it; whether anything in the picture felt wrong.

Fatigue items at the start and at the end, so the fatigue trajectory has a self-report anchor alongside the behavioural one.

These are retrospective self-reports and weaker than behavioural coding. Their role is to triangulate the log-derived measures, not to carry a hypothesis, and the chapter says so.

### 6.2 Exclusion rules

Pre-specified, applied blind to condition and outcome.

Session marked partial by a missing end-of-session checksum record. Cumulative `window_blur` exceeding a declared threshold. Cumulative idle above threshold exceeding a declared proportion of task time. Judgements submitted faster than a pilot-derived plausible-reading floor. Failed attention check. Fewer than a pre-set minimum of information-seeking acts. Attestation declined. Evidence of repeated attempts on the same token. More than one resume, or a resume after more than a declared interval. High self-reported familiarity with the scenario region above a pre-set threshold, after first entering as a covariate. Self-reported prior knowledge of the scenario or the planted contradiction. Pre-flight refusal prevents the session rather than excluding it.

**Plan for 25–35% attrition**, verify the surviving allocation stays balanced across conditions, and report the exclusion cascade as a figure.

---

## 7. Analysis plan

Pre-registered before collection. Models below are the confirmatory set; anything else is labelled exploratory in the paper.

### 7.1 Primary

**Calibration (H2).** Brier score with calibration and resolution components separated, computed per participant, modelled with condition as the predictor and cycle index, phase, viewport size and baseline metacognitive efficiency as covariates. Plus an item-level confidence-by-accuracy interaction model, which is the more sensitive form and is the pre-registered primary test. Pre-registered primary contrast: `substitutive` versus `assistive`.

**Detection (H3).** Logistic model on the blind-coded binary from the cycle-18 open probe, with the cycle-20 forced choice as a secondary outcome. Condition as predictor.

**Mechanism (H6).** Within-participant contrast between expectation-marked and unmarked cycles, with the condition-by-marking interaction as the test. Counterbalance order enters as a covariate.

### 7.2 Secondary

Judgement accuracy (H1) as a precondition check. Coverage confidence against outcome (H4). Between-participant divergence of judgements, localisations and allocations (H5), as dispersion by condition. Metacognitive efficiency predicting in-task calibration by condition (H7). Intent alignment across phase B (H8), with the guidance-mode confound declared.

Relative accuracy on rejection. Doubt–action coherence, with the pilot-established base rate. Allocation robustness and allocation safety, scored separately. Tier-4 discovery rate by condition and by item. Source-selection tracking against authored reliability. Drawer reliance.

### 7.3 Proxy validation by temporal holdout

**Proxies are developed on cycles 1–10 and evaluated on cycles 11–20 with no refitting.** A proxy that predicts calibration only on its development half is an artifact.

This is weaker than cross-scenario transfer: content and participant are shared, the phases differ systematically (the hinge, the fatigue gradient), and phase B is not an independent sample. It is declared as a limitation in exactly those terms. It replaces the transfer test that a second scenario would have provided, and that trade was made deliberately (`01` §2).

### 7.4 Blinding

Coding of the open uncertainty probe and of the walkthrough transcripts is done blind to condition by a coder who did not author the scenario. Inter-rater reliability on a 25% double-coded subset is reported.

---

## 8. Power

> **[SUPERSEDED 2026-09-17]** The battery-based per-participant estimate no longer exists; see amendment.

No closed form exists for the primary analysis. Power is established **by simulation**: synthetic datasets across plausible effect sizes using variance components from pilot 3, the pre-registered models run against each, and the detectable effect size at 80% power reported for the primary contrast.

Run after pilot 3 and before the pre-registration is locked. Use the raised attrition assumption.

Twenty containment judgements per participant is an improvement on the eighteen the two-scenario structure would have given, and it is still too few to support a per-participant metacognitive-efficiency estimate. That estimate comes from the pre-session battery, which is why the battery is load-bearing rather than preliminary.

---

## 9. Ethics and data protection

Ethics review at LUT and at the participating institution. Remote informed consent with a downloadable copy. **Written assurance from the host authority that participation and performance do not affect assessment or appraisal** — without it, the session is an evaluation and the data is about something else.

**Data protection.** Query text, marked geometry, free-text rationale and questionnaire responses are transmitted from the participant's own device. Required: EU hosting; a processing agreement with the host; TLS in transit and encryption at rest; pseudonymous session tokens carrying no identifying data; a stated retention and deletion schedule; and consent text that says plainly what is transmitted and where it is held. **Query text and free-text fields are named explicitly as personal data.** Walkthrough recordings are personal data under their own consent clause.

**Settle this before pilot 1, not before the main study** — pilot 1 already transmits real participant data.

Scenario materials are fictional in incident and real in geography and data, all from CC BY 4.0 sources, with attribution rendered in the instrument and stated in the methods section.

---

## 10. Pilot plan

**Pilot 1 — instrument, telemetry and remote delivery. Eight to twelve non-specialists.**
Determinism; every telemetry record present with its fields; every derived measure in `07` §4 computable; the analysis pipeline end to end; local-first logging and upload resumption under a deliberately interrupted connection; behaviour on small windows, trackpads and three browsers; the training competence gate; session timing against the `08` §5 budget; the fatigue profile across a full 102-minute session. Also collects the Finnish query corpus used as the retrieval recall regression set.

**Pilot 2 — materials calibration. Four to six officers or instructors, remote.**
Plausibility; **containment accuracy in the 60–80% band**; per-item discrimination; **detection rate for each of the three candidate contradictions in the 20–70% band**; no Level 2 recall item answerable verbatim from the channel. The contradiction is selected here and the selection is recorded in the scenario version.

**Pilot 3 — full remote dress rehearsal. Two sessions per condition.**
Timing; channel engagement rate in `substitutive`; probe intrusiveness; the continuous-session flow and the hinge pause; fault and resume behaviour; attrition and upload completeness; doubt–action coherence base rate. **Variance components for the power simulation come from here.**

**Do not proceed to collection until both gates in `01` §5 are met.**

---

## 11. Limitations to state in the chapter

The `directed` condition used an automated responder rather than a person, so it contrasts directed with pooled retrieval rather than human with machine mediation.

Sessions were unsupervised on heterogeneous hardware; environment descriptors are covariates but cannot fully absorb the variance.

Proxy validation was by temporal holdout within one scenario, not by transfer to a second scenario; phases A and B differ systematically and phase B is not an independent sample.

One scenario means scenario-specific content cannot be separated from the manipulation. The conditions are compared within the same content, which is the correct comparison, but generality across incidents is unestablished.

Guidance mode is nested inside condition rather than crossed with it, so Paper 2's claim is about a package — a channel that integrates and maintains intent — not about continuous guidance in isolation.

Reasoning-mode data comes from a self-selected subsample, days after the session, against a replay.

Fire magnitude sits at the severe end of Finnish experience and the projection breach rate is deliberately higher than an operational system's. Both are declared in the validity claim and both limit generalisation to real deployed tools.

Freezes are intrusive; the defence rests on within-participant calibration being less sensitive to uniform intrusion than absolute performance would be, and on intrusion being constant across conditions.

Idle time without eye tracking is ambiguous between thinking and disengagement. It is recorded and is not over-interpreted.

---

## Amendment 2026-09-17

**Participants.** 200 firefighters, mostly at *pelastusjoukkue* command level (`15` §8). Randomisation stratified on echelon, incident-command experience and prior simulation exposure; guidance mode randomised within the reasoning-AI group (`02` amendment). **Open:** whether 200 is recruited or completed; with the planned 25–35% attrition, recruited 200 leaves ~130–150 for analysis.

**Power.** Still established by simulation after pilot 3. Chat-stage simulations (assumptions, not pilot values) suggested: with ~67 per Paper 1 group, medium effects on SA accuracy and calibration are detectable; with ~33 vs ~33 in the Paper 2 primary contrast (reasoning AI, once vs. maintained) and ~10 phase-B decisions each, a 15-point alignment difference is detected with power ≈ .74 and a 10-point difference with ≈ .4; after attrition (~22–25 per cell) power falls further. Enlarging the reasoning-AI group is the main lever (`02` amendment). These are to be replaced by the pilot-based simulation. Metacognitive efficiency is estimated hierarchically from all paired responses (`15` §7).

**Limitations (§11) — updated.** The guidance-mode confound is removed; replace that paragraph with: *guidance mode was randomised within the reasoning-AI group, so Paper 2's contrast isolates maintained vs. one-time guidance, at the cost of small cells (~33 each before attrition).* Add: *no offline metacognition battery was administered; baseline metacognition was measured in-task during a no-AI prologue, and domain-general metacognitive ability is not measured.* Add: *the reasoning-AI condition served pre-compiled, reviewed interpretations rather than live generated text.*

---

## Revision 17 Sep 2026 (d) — supersedes earlier amendments where they conflict

**Participants.** 200 firefighters: **70 no AI, 130 AI**, the AI group split 65 / 65 for Paper 2.

**Primary contrast (replaces §7.1 "`substitutive` versus `assistive`").** No AI vs. AI, phase A.

**Power (chat-stage, assumption-based).** Paper 1: 70 vs. 130 has the power of about 91 per group in a balanced design; with 30% attrition about 64. Paper 2: 65 vs. 65 with ~10 phase-B decisions each gives power ≈ .96 for a 15-point alignment difference and ≈ .6 for a 10-point difference; with 30% attrition (~45 per cell) about .88 and .5. Replace with the pilot-based simulation.

**Limitations (added).** Paper 1 compares AI support with none and cannot separate integration from machine retrieval. The Paper 2 manipulation depends on how often participants query; its dose is reported and modelled.

---

## Revision 17 Sep 2026 (e) — supersedes revision (d) where they conflict

**Participants.** Default 70 Radio / 65 LLM / 65 LLM reasoning (split ~32 / 33 at the hinge); allocation open (`02` revision (e)).

**Primary contrast.** LLM reasoning vs. LLM, phase A (as v3.0 §7.1, pull-only).

**Power (assumption-based).** Paper 1 primary, 65 vs. 65: medium effects detectable. Paper 2, ~32 vs. 33 with ~10 phase-B decisions: power ≈ .75 for a 15-point alignment difference and ≈ .4 for 10 points, before dropout; with ~30% dropout about .6 and .3. Enlarging the LLM-reasoning group is the main lever.

**Limitation (replaces (d)).** Paper 2 cells are small unless the LLM-reasoning group is enlarged; the Paper 2 manipulation's dose depends on query volume.

---

## Revision 17 Sep 2026 (f) — supersedes revisions (d) and (e) where they conflict

**Participants.** 70 Radio, 130 LLM reasoning (65 / 65 at the hinge).

**Primary contrast.** LLM reasoning vs. Radio, phase A.

**Power (assumption-based).** Paper 1: 70 vs. 130 ≈ 91 per group balanced; ≈ 64 after 30% dropout. Paper 2: 65 vs. 65 with ~10 phase-B decisions: ≈ .96 (15 points) and ≈ .6 (10 points); after 30% dropout ≈ .88 and ≈ .5.

**Limitation.** Paper 1 cannot separate integration from access to an AI; the LLM-facts arm was deliberately dropped.
