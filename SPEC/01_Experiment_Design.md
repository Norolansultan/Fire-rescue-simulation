# 01 — Experiment design

**Version 3.1 · 17 September 2026** (v3.0 · 13 September 2026). Supersedes `01_Experiment_Design_v2.md` in full.

> **Changelog**
> - **17 Sep 2026 (f)** — LLM (facts) group removed. Two groups: Radio (70) and LLM reasoning (130, pull-only); LLM reasoning split 65 / 65 at the hinge (guidance once vs. intent line in AI answers).
> - **17 Sep 2026 (e)** — three Paper 1 groups restored — Radio, LLM, LLM reasoning; both LLM groups pull-only; only the LLM-reasoning group is split at the hinge by how it receives the guidance. Group sizes open (default 70 / 65 / 65).
> - **17 Sep 2026 (d)** — two groups (no AI 70, AI 130); AI group pull-only with group-specific training; AI group split 65/65 at the hinge, the via-AI half receiving query answers framed against the commanded strategy; branch choice adopted with four authored options plus *Ei mikään näistä*, no free text; per-choice alignment feedback removed.
> - **17 Sep 2026 (c)** — only the reasoning-AI group is split by guidance mode; prologue warm-up; 10 freezes × 5 items, 6 SPAM, 9 unprobed (see `15` v1.1).
> - **3.1 · 17 Sep 2026** — Pre-session metacognition battery dropped (F5); H7 reformulated; course-of-action choice added alongside allocation (F7); H8 re-stated for the split guidance design (F4). See `15`, `16`.
Changes from v2: one scenario not two; twenty cycles not nine; `directed` replaces `human`; the conditions table is replaced by the capability matrix in `02`; transfer validation replaced by temporal holdout; retrospective walkthrough decoupled from the session.

---

## 1. Claim and mechanism

Machine projection substitutes for mental simulation. Mental simulation produces not only a forecast but the cues by which its reliability is judged — where a value was guessed, where a source was weak, where an assumption carried weight. Judgements of one's own understanding run on exactly those cues. When the machine performs the integration, the forecast arrives without them, and confidence becomes ungrounded: the comparison standard was never built.

The prediction is a **collapse at the point where integration moves from human to machine**, not a gradient across synthesis levels. Conditions are therefore typed `directed | assistive | substitutive` rather than placed on a continuum.

A counter-consideration is held open rather than dismissed. Collective-behaviour models show that group steering works without signalling and without members knowing who is informed; the inability to notice may be a cost of scalable coordination rather than a defect. The contribution is to state that tension and measure one side of it.

### 1.1 The failure mode being measured

Not error. Not hallucination. Not a machine that lies.

The machine takes two partially-true reports and compresses them into one reasonable summary. The summary is accurate and useful. It loses the one line that would have changed the decision. Nobody can point at a mistake. That is the failure mode, and the whole instrument exists to make it occur under controlled conditions and to detect whether anyone notices.

The clearest instance is authored at cycle 18 and described three ways in `02` §6.

---

## 2. Design

**One scenario. Twenty cycles. One continuous session.** Between-subjects on condition.

One scenario rather than two, because the twenty-cycle incident is the unit of realism: a strategic hinge at its midpoint, a fatigue arc across it, and an information corpus dense enough that querying is a skill. Two shorter scenarios would have given a clean transfer test and a worse study.

One continuous session rather than two sittings, because sustained attention under accumulating fatigue is part of the phenomenon. A commander at hour six is the case of interest, not a confound to be engineered away. Fatigue is therefore **measured**, not avoided: cycle index enters every model, and the pre/post fatigue items in the questionnaire are analysed as an outcome in their own right.

The cost of that decision, stated plainly: there is no second scenario on which to test a proxy without refitting. It is replaced by a **temporal holdout** — proxies are developed on cycles 1–10 and evaluated on cycles 11–20 with no refitting (`09` §7.3). This is weaker than cross-scenario transfer because content and participant are shared. It is declared as a limitation, not disguised.

---

## 3. Hypotheses

**H1.** Judgement accuracy about whether the projection will hold is equal or higher in `substitutive`. The channel is genuinely informative. *A null or positive result here is required for the study to be about metacognition rather than about a bad tool.*

**H2 (primary).** Confidence–accuracy calibration is substantially worse in `substitutive` than in `assistive`, with little difference between `assistive` and `directed`.

**H3.** Detection of the embedded contradiction is similar in `directed` and `assistive` and markedly lower in `substitutive`. In the first two it is available to anyone who compares; in the third the comparison has been performed and presented as settled, so detection requires doubting a synthesis.

**H4.** Confidence that actual development falls inside the displayed envelope is higher in `substitutive` and less related to whether it does.

**H5.** Between-participant divergence of judgements, failure localisations and allocations is lower in `substitutive`. Convergence here can be convergence on a wrong picture, which makes it error rather than loss of variety.

**H6 (mechanism).** Cycles carrying the expectation-marking step show better calibration, and the repair is larger in `directed` and `assistive` than in `substitutive`. A repair that fails specifically in `substitutive` localises the mechanism.

**H7 (exploratory).**

> **[SUPERSEDED 2026-09-17]** H7 is reformulated in the amendment below. Baseline metacognitive efficiency, from the pre-session battery, predicts in-task calibration more strongly in `directed` and `assistive` than in `substitutive`.

**H8 (phase B, Paper 2).**

> **[SUPERSEDED 2026-09-17]** H8 is re-stated in the amendment below; guidance mode is no longer nested in condition. Alignment of allocations with the strategic intent delivered at the hinge decays across phase B in `directed` and is sustained in `substitutive`, where the channel restates intent and flags alignment. See `02` §7 for the confound this carries.

**H2, H3 and H6 are the paper.** H1 is a precondition. The rest are reported.

---

## 4. What the instrument must make measurable

This section is the requirements bridge: every item here must have a named record in `07_Telemetry_and_Logging.md` or an authored answer key entry in `04_Data_Model.md`.

### 4.1 Primary

**Judgement accuracy.** Twenty containment judgements per participant, resolved against authored polygon containment with declared tolerance. The collected response is three-way (`holds` / `partly_wrong` / `fundamentally_wrong`); the binary needed for signal-detection analysis is **derived**, never collected. See `08` §3.2.

**Calibration.** Pre-registered primary: Brier score with calibration and resolution components separated, plus the over/underconfidence gap. Secondary: metacognitive efficiency estimated with a measure robust to dynamically varying difficulty, hierarchically pooled. Response-caution parameters are reported alongside, because metacognitive-efficiency ratios share variance with decision caution and any response-time proxy is entangled with the offline criterion through it.

**Contradiction detection.** Binary, from the open uncertainty probe at cycle 18, coded blind, with a forced-choice backup at cycle 20. Confidence in the overall picture is captured immediately before and after the detection window.

**Envelope coverage confidence.** Stated confidence that actual development falls inside the envelope, scored against whether it did.

### 4.2 Secondary

Failure-localisation accuracy: distance from marked geometry to the nearest actual breach.
**Relative accuracy on rejection:** was the participant's drawn correction closer to the actual outcome than the machine's envelope was? Binary, and the single most interpretable number the study produces.
**Doubt–action coherence:** after a rejection, is the allocation consistent with the correction, with the envelope, or with neither? The second pattern — stated rejection followed by an allocation that assumes the envelope — is the most interesting failure in the design.
Allocation robustness: branches under which the chosen allocation remains viable.
**Allocation safety:** branches under which the chosen allocation exposes a crew to an untenable position. Scored separately from robustness; a robust-but-unsafe allocation is a distinct and important outcome.
Decision-space narrowing: options preserved or foreclosed.
Source-selection behaviour: which units are asked, whether selection tracks authored reliability, and — in every condition — whose lateral traffic the participant chooses to read.
Tier-4 discovery: for each of the three load-bearing lateral items, whether it was reached, by which route, and in which cycle.

### 4.3 Process and telemetry

Specified for capture in `07` and for derivation in `09` §6. In summary: every click with target identity and latency from the relevant stimulus onset; dwell and revisits per element; **drawer open/close events, which are the cleanest reliance measure in the design**; query text verbatim with composition timing and reformulation chains, including abandoned queries; retrieval results and misses; which returned items were opened and how far they were scrolled; probe response latencies and confidence-slider dynamics including reversals; viewport and layer state; allocation changes.

### 4.4 Two probe modes are required

Blanking is a property of the probe set, not of the freeze. The containment judgement needs the envelope on screen; the recall probe needs the picture blank. Both halt the clock and disable the channel. Building only one mode makes half the measures impossible.

### 4.5 No outcome feedback during the session

Participants are never told whether a judgement was correct. With trial-by-trial feedback, confidence can be driven by reinforcement history and the measure stops being metacognitive. Full debrief follows the session, asynchronously and in writing (`09` §5).

---

## 5. Two gates that cannot be fixed later

These are pilot exit criteria. Failing either means re-authoring, not re-analysing.

**Gate 1 — containment accuracy.** Judgement accuracy must land between **60% and 80%** in pilot. Outside that band, calibration measures are uninterpretable: at ceiling there is no error variance to be calibrated against, at floor the task is not the task.

**Gate 2 — contradiction detection.** Detection in the `directed` condition must land between **20% and 70%**. Outside that band H3 has no variance.

Mitigation is authored in advance, not improvised: **three candidate contradictions of graded subtlety** and **thirty containment items for twenty slots** exist so that pilot 2 tunes by selection rather than by re-authoring. Selection is recorded in the scenario version.

---

## 6. Allocation space

Each ground formation and aerial asset is assigned to one of a fixed task set per sector, sized so that meaningful distinct allocations number roughly twenty to sixty, each with **viability**, **robustness** and **safety** pre-computed against every authored branch. A larger space makes that pre-computation intractable and pushes scoring back onto rater judgement.

A free-text rationale accompanies each allocation and carries the stated-premises artifact.

---

## 7. Pre-session battery

> **[SUPERSEDED 2026-09-17]** The metacognition battery is dropped. The pre-session component is consent, demographics (incl. echelon) and AI literacy only (~15 min). Baseline metacognition comes from the prologue (warm-up) — see `15` §3 and §7.

Administered online **several days before** the session, never on the day. A half-hour of confidence-monitoring practice immediately beforehand would prime the monitoring under test.

| Component | Duration | Notes |
|---|---|---|
| Consent, demographics | 5 min | Role, years of service, incident-command experience, prior simulation exposure, self-reported familiarity with the scenario region |
| AI literacy | 10 min | Validated instrument plus a short performance component. Pre-register the direction: prior work found higher AI literacy predicted *greater* overestimation and worse metacognitive accuracy |
| Metacognition battery | 30 min | Two blocks of different task type, one low-knowledge and one knowledge-based, so domain-generality is checked rather than assumed. Adaptive staircase holding first-order accuracy near 70–75%. Multi-point confidence. 100+ trials |

The battery is the offline criterion for Paper 3 and the covariate for H7. It is load-bearing, not preliminary: per-participant metacognitive efficiency comes from here, because twenty in-scenario judgements cannot support a per-participant estimate.

**The battery is a separate deliverable from the instrument** and is not built on this codebase. See `11` §2.

---

## 8. Portability

The engine treats domain as data. The same conditions, cycle structure and measures instantiate in a military or industrial-crisis scenario, which is the cross-domain replication that would license any claim of transferability beyond emergency response. Identical instruments across domains are what would make that claim honest. Nothing in the code may assume wildfire semantics: fire-specific vocabulary lives in the scenario bundle and the Finnish string table, not in the engine.

---

## Amendment 2026-09-17

**H7 (exploratory, reformulated).** Baseline calibration from the prologue (identical for everyone, no AI) predicts in-task calibration more strongly in `directed` and `assistive` than in `substitutive`.

**H8 (Paper 2, re-stated).** Within the reasoning-AI group, strategy alignment of course-of-action choices decays across phase B when guidance is delivered once and is sustained when guidance is maintained by the AI. Blind compliance (option B, `16` §3) is higher under AI-maintained guidance. Guidance mode is randomised within that group, so the contrast is not confounded with integration level.

**§6 addition.** Each cycle also contains a four-option course-of-action choice with confidence, before the allocation (`16`). Allocation, its scoring and doubt–action coherence are unchanged.

**§4.1 addition.** Blanked freezes carry five SA items each (2 × L1, 2 × L2, 1 × L3), each with confidence (`15` §4.4).

---

## Revision 17 Sep 2026 (d) — supersedes earlier amendments where they conflict

### Consequence for the design's claim

With one AI group, Paper 1 compares **AI support vs. none**. It can no longer separate *integration* from *machine retrieval*, which was the v3.0 primary contrast (`substitutive` vs. `assistive`). This is a deliberate narrowing and must be stated as a limitation (`09` §11).

### Hypotheses, restated for two groups

Throughout, "AI" means the pull-only AI group, and phase A is the primary window.

**H1.** Judgement accuracy is equal or higher in the AI group. *(Precondition, unchanged in role.)*

**H2 (primary).** Confidence–accuracy calibration is worse in the AI group than in the no-AI group.

**H2a (mechanism, new).** Within the AI group, calibration worsens with the share of queries that retrieve integrated `meaning`/`projection` answers (delegated comprehension/projection) and improves with the share of fact-checking queries.

**H3.** Detection of the embedded contradiction is lower among AI participants who queried the affected flank (they receive a settled synthesis) than among no-AI participants who accessed both reports. Tested conditional on access.

**H4, H5.** As before, with AI vs. no AI.

**H6 (mechanism).** Expectation-marking cycles repair calibration more in the no-AI group than in the AI group.

**H7 (exploratory).** Prologue calibration predicts main-block calibration more strongly in the no-AI group.

**H8 (Paper 2).** In phase B, strategy alignment of course-of-action choices decays less in cell 3 than in cell 2, and the difference grows with the number of phase-B queries. Blind compliance (option B) is higher in cell 3.

---

## Revision 17 Sep 2026 (e) — supersedes revision (d) where they conflict

The three-group hypotheses of v3.0 (H1–H6) apply again with `directed` = Radio, `assistive` = LLM, `substitutive` = LLM reasoning, **read under pull-only access**: integration reaches participants only through their own questions. Revision (d)'s "Consequence for the design's claim" is withdrawn — the integration contrast is back.

**H2a (kept from (d)).** Within the LLM groups, calibration worsens with the share of queries answered by integrated `meaning`/`projection` content.

**H3 (pull-only reading).** Among participants who queried the affected flank at cycle 18, contradiction detection is lower in LLM reasoning (settled synthesis) than in LLM (both reports returned separately) and Radio.

**H8 (Paper 2).** Within LLM reasoning, phase-B alignment decays less in the intent-line cell than in the once cell, increasingly with the number of phase-B queries.

---

## Revision 17 Sep 2026 (f) — supersedes revisions (d) and (e) where they conflict

**Consequence.** Paper 1 compares **LLM reasoning with no AI**. Without an LLM-facts group, an effect cannot be attributed to *integration* as distinct from *having an AI to ask*. State this in `09` §11 and in the paper.

Hypotheses as in revision (d), with "AI" = LLM reasoning:
- **H1** accuracy equal or higher with LLM reasoning (precondition).
- **H2 (primary)** calibration worse with LLM reasoning than with Radio, phase A.
- **H2a** within LLM reasoning, calibration worsens with the share of queries answered with `meaning` / `projection` content.
- **H3** among participants who reached both cycle-18 reports (Radio) or queried the affected flank (LLM reasoning), detection is lower with LLM reasoning.
- **H4–H7** as (d), LLM reasoning vs. Radio.
- **H8 (Paper 2)** in phase B, alignment decays less in cell 3 than in cell 2, increasingly with query volume.
