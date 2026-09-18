# 08 — Probes, freezes and instruments

**Version 3.1 · 17 September 2026** (v3.0 · 13 September 2026). Supersedes `05_Probe_and_Freeze_Design.md` including amendment B1. All eight- and nine-cycle figures are replaced by the twenty-cycle schedule.

> **Changelog**
> - **17 Sep 2026 (d)** — two groups (no AI 70, AI 130); AI group pull-only with group-specific training; AI group split 65/65 at the hinge, the via-AI half receiving query answers framed against the commanded strategy; branch choice adopted with four authored options plus *Ei mikään näistä*, no free text; per-choice alignment feedback removed.
> - **17 Sep 2026 (c)** — only the reasoning-AI group is split by guidance mode; prologue warm-up; 10 freezes × 5 items, 6 SPAM, 9 unprobed (see `15` v1.1).
> - **3.1 · 17 Sep 2026** — Freeze count, recall confidence, SPAM probe type and schedule replaced by `15`.

---

## 1. What the probes must support

Four things, and every design choice below traces to one of them.

**First-order accuracy**, so that confidence has a denominator. Without it, calibration is undefined.

**Second-order confidence**, paired item by item with the first-order response.

**Situation-awareness levels** in Endsley's sense — perception (L1), comprehension (L2), projection (L3) — separately, because the claim is that the machine degrades the third while leaving the first two intact.

**A generative act**, performed late, whose presence or absence within participant is the mechanism test for H6.

---

## 2. Relationship to SAGAT

This design uses SAGAT's **method** — a halt, a blanked display, memory-based queries resolved against an authored answer key — for one probe type only, and departs from it everywhere else.

The departures are deliberate. SAGAT blanks everything; this design blanks only for recall, because a containment judgement about a displayed envelope requires the envelope to be displayed. SAGAT samples randomly; this design schedules deterministically, because the scenario's authored structure means a random freeze can land inside the contradiction window and destroy it. SAGAT scores SA; this design scores SA **and** the confidence attached to it, which is the actual construct.

The design also borrows SPAM's online-probe logic for the judgement items, which is why they are not blanked.

**Freezes are intrusive and this is contested rather than settled.** The defence here is narrower than the usual one: halted time is budgeted and declared; blanked halts are limited to six across the session; the headline measure is calibration, a *within-participant* relationship between confidence and accuracy, which is far less sensitive to a uniform intrusion than an absolute performance score would be; and intrusion is constant across conditions, so it cannot produce the predicted between-condition dissociation.

---

## 3. Probe taxonomy

| Type | Name | Mode | Count | Measures |
|---|---|---|---|---|
| **R** | Recall | **blanked** | 6 freezes × 3 items = 18 | L1/L2 accuracy: first-order denominator, manipulation check |
| **J** | Judgement | visible | 20, every cycle | Containment judgement, confidence, failure localisation or correction |
| **E** | Expectation | visible | 10, alternating cycles | The generative manipulation (H6) |
| **F** | Falsification | visible | 3 | Named observable, diagnosticity |
| **U** | Uncertainty | visible | 2 + coverage item | Contradiction detection, envelope coverage confidence |

### 3.1 Type R — recall items

> **[SUPERSEDED 2026-09-17]** Freeze count, cycles and items per freeze are now in `15` §4 (10 freezes incl. 2 in the prologue; five items each: 2 × L1, 2 × L2, 1 × L3). Each item carries a confidence rating. L3 items are new to Type R.

Three items per freeze, at cycles 2, 5, 9, 13, 16, 19. Picture blanked completely.

One L1 item (perception): where is a named formation; what is the current wind direction; what was the last reported perimeter edge on a named flank. One L2 item (comprehension): which sector is most exposed; which formation is least able to reposition. One item alternating between L1 and L2 across freezes, so the schedule is balanced across the session.

Scored against the invariant list with declared tolerances — ±30° for wind direction, a declared distance for positions, exact match for categorical.

**Recall items are the manipulation check.** If `substitutive` shows equal or better L1 and L2 recall and worse calibration, the claim is localised to the projection level. If L1 recall is also worse, the channel is simply degrading attention, which is a different and less interesting finding — and one the design must be able to detect.

### 3.2 Type J — the containment judgement

**Every cycle. Three parts in fixed order.**

**Part one — a three-way judgement of the envelope.**

| Response | Meaning | Follow-up |
|---|---|---|
| `holds` | The fire will stay inside the envelope | None |
| `partly_wrong` | Broadly right, but it breaks somewhere | Mark the breach location (a point) |
| `fundamentally_wrong` | The projection does not describe what will happen | **Draw your own projection** (an area) |

**Part two — a confidence rating**, 0–100, on the judgement just made.

**Part three — the follow-up**, whose form depends on part one.

**The binary needed for signal-detection analysis — `holds` versus not-`holds` — is derived, not collected.** This is the single most important sentence in this document. A binary button collects less and cannot be recovered; the three-way response can always be collapsed and cannot be reconstructed from a binary.

#### Why the correction is the most valuable single datum in the cycle

A participant who says "this is wrong" and then draws what they think will happen has produced an externalised mental model, at a known moment, scoreable against the actual outcome, and directly comparable to the machine's projection.

It yields the one sentence a general officer, a fire chief or a regulator understands immediately: **was the human's correction closer to the actual outcome than the machine's projection was, when the human chose to override it?** Binary, computable, and the most interpretable number the study produces.

### 3.3 Type E — expectation marking

On ten of the twenty cycles, per a schedule declared in the manifest and counterbalanced across participants (odd-cycle order A, even-cycle order B), the participant marks where they expect the fire to reach and states a confidence **before the envelope is revealed**.

Placed **late** in the cycle, after the working period. The delay between encountering the information and performing the generative act is the active ingredient, not the act itself.

This is the within-participant manipulation for H6: cycles with expectation marking versus cycles without, and the size of the repair by condition.

### 3.4 Type F — falsification items

Three across the session, at cycles 7, 14 and 19. "What would you expect to see if this projection were wrong?"

Coded on two dimensions: was an observable named at all, and is the named observable **diagnostic** of the authored failure mode for that cycle. The second is the interesting one — naming something unfalsifiable is a different state from naming nothing.

### 3.5 Type U — uncertainty probe and coverage confidence

**The open item, cycle 18, at the contradiction window.** "Is there anything in the current picture you are unsure about or would want to verify?" Free text.

**Deliberately non-leading.** It must not mention conflict, inconsistency, or reports disagreeing, or it becomes a prompt rather than a measure. Coded blind into four categories: names the contradiction specifically; names uncertainty in the right area without identifying it; names unrelated uncertainty; names nothing.

**The forced-choice backup, cycle 20.** "Which of these pairs of reports, if any, were inconsistent with each other?" with the authored pair among distractors. Scored binary. It exists because the open probe has a floor effect risk, and because a participant may have noticed without articulating.

**Coverage confidence, cycle 20.** "How confident are you that the fire's actual development stayed inside the projections you were shown?" Scored against whether it did.

**Picture confidence** is captured immediately before and after the cycle-18 window, so a confidence drop at detection is measurable.

---

## 4. Freeze behaviour

Both modes halt the virtual clock and disable the channel. They differ only in what is rendered (`05` §4).

`PROBING_VISIBLE` — map and envelope remain rendered. Used for J, E, F, U.
`PROBING_BLANKED` — map, rail, drawers and status strip removed. Used for R only.

In-flight events are buffered, never dropped, and flushed on `RESUMING` with their original virtual timestamps.

---

## 5. Schedule and time budget

> **[SUPERSEDED 2026-09-17]** Replaced by `15` §2, §4 and §6.

### 5.1 Per-cycle budget

| Element | Budget | On which cycles |
|---|---|---|
| Working period, clock running | 90 s | All 20 |
| Expectation marking (Type E) | 25 s | 10 |
| Projection reveal | 5 s | All 20 |
| Containment judgement (Type J), `holds` | 40 s | ~10 |
| Containment judgement, rejection with correction | 60 s | ~10 |
| Verification window | 30 s | All 20 |
| Recall freeze (Type R, 3 items) | 45 s | 6 |
| Falsification item (Type F) | 20 s | 3 |
| Uncertainty probe (Type U) | 45 s | 2 |
| Allocation and rationale | 30 s | All 20 |

The correction step applies only on rejection cycles, which by design is about half of them. A polygon drawing takes fifteen to twenty seconds; the Type J budget extends from 40 s to 60 s on rejection cycles only.

### 5.2 Session total

| Segment | Duration |
|---|---|
| Pre-flight, consent confirmation, briefing | 12 min |
| Cycles 1–10 | ~35 min |
| **Hinge pause** | 5 min, dismissible early |
| Cycles 11–20 | ~35 min |
| Post-session questionnaire | 15 min |
| **Total** | **~102 min**, task time ~70 min |

**This is a long session and it is deliberate.** Sustained attention under accumulating fatigue is part of the phenomenon (`01` §2). Dropout is an analysed outcome, not merely a loss.

### 5.3 Schedule summary

```
Cycle           1  2  3  4  5  6  7  8  9 10 | 11 12 13 14 15 16 17 18 19 20
Judgement (J)   ●  ●  ●  ●  ●  ●  ●  ●  ●  ● |  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●
Expectation (E) ●     ●     ●     ●     ●    |     ●     ●     ●     ●     ●
Recall (R)         ●     ●        ●          |        ●        ●        ●
Falsify (F)                       ●          |           ●                 ●
Uncertain (U)                                |                    ●        ●
```

The expectation row shown is order A. Order B shifts it to the complementary cycles. Assignment derives from participant code and is recorded in the log header.

---

## 6. Scoring

**Every probe resolves against an entry in the scenario's invariant list, with its tolerance declared there rather than in analysis code.** Scoring happens entirely in the analysis pipeline, never in the runtime.

| Type | Scoring |
|---|---|
| R, L1 categorical | Exact match |
| R, L1 numeric | Within declared tolerance (e.g. ±30° for wind direction) |
| R, L1 spatial | Within declared distance tolerance |
| R, L2 | Exact match against the authored correct option |
| J, derived binary | `holds` vs not-`holds` against polygon containment of the actual perimeter, with declared tolerance |
| J, failure localisation | Distance from marked geometry to the nearest actual breach |
| E, expectation | Overlap between marked geometry and actual perimeter; and whether the actual perimeter falls inside the marked area |
| F | Coded: observable named (yes/no); observable diagnostic of the authored failure mode (yes/no) |
| U, open | Coded blind into the four categories in §3.5 |
| U, forced choice | Binary |
| Coverage confidence | Confidence value against the binary containment outcome |

### 6.1 The rejection cases

The three-way judgement makes false rejection scoreable, which a binary cannot.

| Case | Scored as |
|---|---|
| `partly_wrong`, breach occurred | Distance from marked point to nearest actual breach |
| `partly_wrong`, no breach occurred | **False rejection.** Recorded as such; the marked point has no referent |
| `fundamentally_wrong`, categorical breach occurred | **Correct rejection.** Plus correction quality: overlap between the drawn area and the actual perimeter, and whether the actual perimeter falls inside the drawn area |
| `fundamentally_wrong`, envelope held | **False rejection with a substituted projection.** Score correction quality anyway — its distance from the actual outcome is the cost of the rejection |
| `holds`, breach occurred | **Miss.** Graded by whether the breach was quantitative or categorical |
| Any rejection | **Relative accuracy:** was the correction closer to the actual outcome than the envelope was? Binary |

### 6.2 Doubt–action coherence

After a rejection, the participant allocates resources. The allocation is checked against two references: the machine's envelope, and the participant's own correction. Three patterns are distinguishable.

Allocation consistent with the correction — **the doubt changed the decision.**
Allocation consistent with the envelope despite the stated rejection — **the doubt was expressed and not acted upon.**
Allocation consistent with neither.

The second pattern is the most interesting failure in the whole design: a commander who says the projection is wrong and then acts as though it were right. It is available from no other measure, requires no extra probe, and is computed entirely from records already captured plus the authored viability table.

**Establish its base rate in pilot before interpreting it.**

---

## 7. Optional — requesting a revised projection

On rejection, the participant may request a revised projection from the system. If adopted, it costs twenty additional authored envelopes and a UI action with its own probe handling, and it yields a measure of whether a participant who doubts the machine asks it again or works around it.

**Decision deferred to pilot.** If adopted, the allocation viability table must be able to score allocations against a *participant-drawn* projection, which means viability is evaluated against the branch set rather than against the envelope. Confirm before M5 (`10`).

---

## 8. Item bank and validation

### 8.1 What to author

| Item | Count |
|---|---|
| Type R items | 30 authored for 18 slots |
| Type J containment items | 30 authored for 20 slots |
| Type E prompts | 10, identical wording, different cycles |
| Type F items | 5 authored for 3 slots |
| Type U items | 3 contradiction candidates + 1 forced-choice set + 1 coverage item |
| Revision envelopes | 20, only if §7 is adopted |

The over-authoring is not waste. It is what lets pilot 2 tune difficulty into the gate bands by **selection** rather than by re-authoring.

### 8.2 Finnish wording rules

Probe wording is reviewed as a set by the domain reviewer, for register as well as accuracy. No leading terms. Numeric items state their unit. Categorical options are mutually exclusive and exhaustive, with an explicit *ei tiedossa* where "don't know" is meaningful. The uncertainty probe is checked specifically against the leading-question failure.

### 8.3 Validation gates

Before data collection:

Every probe resolves against an existing invariant. No probe can be answered from the probe text alone. No two probes in a session ask the same thing in different words. The recall freezes do not land inside the contradiction window or the omission window. The forced-choice backup's distractors are plausible and were checked against pilot participants' open responses. The expectation-marking counterbalance is balanced across conditions.

### 8.4 Known criticisms and this design's answers

**Probes may teach the task.** Twenty cycles of the same judgement format will produce practice effects. Cycle index is a covariate in every model, and practice cannot load onto condition because condition is between subjects and the schedule is identical.

**Freezes may alter performance.** Answered in §2.

**The open uncertainty probe may have a floor effect.** Answered by the forced-choice backup and by authoring three contradiction candidates of graded subtlety.

**The three-way judgement may be harder than a binary and depress accuracy.** Checked directly in pilot against gate 1. If accuracy falls below 60%, the item difficulty is tuned by selection, not the response format simplified — collapsing to a binary would lose false-rejection scoring, which is where this design's distinctive measures live.

---

## Amendment 2026-09-17

**Type S — SPAM (new).** Specified in `15` §5. Six probes: one in the prologue (W3), five in the main cycles (3, 7, 11, 15, 20).

**Item bank additions (§8.1).** Type R: raise from 30 to **70** authored items for 50 slots (≈28 L1, 28 L2, 14 L3; incl. prologue and 4 phase-B intent items). Type S: 10 for 6. Decision items: 30 for 25 (`16` §5).

**Validation additions (§8.3).** No blanked freeze and no SPAM probe in cycles 12 or 18. No blanked freeze and SPAM probe in the same cycle. Prologue items never refer to events after W5.

---

## Revision 17 Sep 2026 (d) — supersedes earlier amendments where they conflict

### Branch choice after a fundamental rejection (handoff adopted)

`HANDOFF_Projection_Judgement_Loop.md` §4–§9 is adopted into Type J:

1. The three options appear **in fixed order** (`holds`, `partly_wrong`, `fundamentally_wrong`), never randomised.
2. `fundamentally_wrong` → **draw first** (3–12 vertices, undo, restart) → **then choose** one of **four authored branch statements** or **"Ei mikään näistä"**, always fifth and last. **No free-text explanation.**
3. The branch list is shown only after `fundamentally_wrong` (pilot may extend it to `partly_wrong`; `11` §7.2 H2).
4. The confidence slider **starts unset** and requires an explicit interaction.
5. Degenerate input (a scribble, a whole-map polygon, a point in a lake) is **accepted and logged** — closes `11` §3.8.
6. Submission is irreversible; only revision creates a new record. The interface says so before the first judgement.

New measures (§6): drawn-vs-chosen agreement; doubt–action coherence via the chosen branch against the allocation viability table; correct use of *Ei mikään näistä* at the omission cycle.

### Level 3 freeze items (review P7) — rule

L3 items in freezes ask about **consequences the envelope does not draw** (a formation needing relief, a road or water route becoming unusable, a value at risk being reached), never about the fire's position at the envelope's horizon, and never beyond that horizon.
