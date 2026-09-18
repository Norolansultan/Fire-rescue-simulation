# 15 — Session structure and probe schedule

**Version 1.1 · 17 September 2026 · Status: governing for the topics below.** Implements forks F5, F6 and F8 (`11` §7). Where this document conflicts with `01` §7, `03` §2.2 and §4.3, `05` §4, `08` §3–§5 or `09` §3 and §8, **this document wins**; those sections carry `[SUPERSEDED 2026-09-17]` markers.

> **Changelog**
> - **1.4 · 17 Sep 2026** — two groups: Radio (70) and LLM reasoning (130, split 65 / 65).
> - 1.3 · 17 Sep 2026 — three groups (Radio, LLM, LLM reasoning); only LLM reasoning is split at the hinge.
> - 1.2 · 17 Sep 2026 — group structure 70 / 65 / 65; tutorial is group-specific training; branch step adds time.
> - 1.1 · 17 Sep 2026 — probe totals changed to 10 freezes / 6 SPAM / 9 unprobed; five SA items per freeze (2 × L1, 2 × L2, 1 × L3); warm-up is a prologue to the main incident, identical for everyone, with 2 freezes and 1 SPAM; only the reasoning-AI group is split by guidance mode.
> - 1.0 · 17 Sep 2026 — created. Decisions: pre-session metacognition battery dropped and replaced by five in-simulation warm-up cycles; 14 blanked freezes, 6 SPAM probes and 5 unprobed cycles across the 25 cycles; participants are mostly at incident-command level.

---

## 1. Decisions implemented

| Fork | Decision (Kalle, 17 Sep 2026) |
|---|---|
| F5 | The 30-minute metacognition battery is **dropped**. Baseline metacognition comes from **five warm-up cycles** inside the simulation |
| F6 | Across all 25 cycles: **10 blanked freezes (SAGAT-style), 6 SPAM probes, 9 cycles with neither** (revised 1.1) |
| F8 | The 200 participants are **mostly** at incident-command level. Echelon is recorded and used as a stratification variable and covariate |

"Neither" refers to SA probes only. **Every cycle still contains the containment judgement (Type J) with confidence, the course-of-action choice (`16`) and the allocation.**

---

## 2. Session structure

| Segment | Content | Duration |
|---|---|---|
| Pre-session (separate day) | Consent, demographics incl. echelon, **AI literacy (10 min)** | ~15 min |
| Pre-flight, attestation, briefing | As `09` §3–§4 | 12 min |
| **Prologue (warm-up), W1–W5** | Five cycles of the same incident, **identical for everyone, no AI** (§3) | ~19 min |
| Group-specific training | LLM reasoning: what the AI answers, how to ask, two practice queries. No-AI group: matched-length radio and browsing training | 5 min |
| **Main cycles 1–10** (phase A) | Condition active; identical content for all | ~41 min |
| **Hinge pause** | 5 min, dismissible; single strategic guidance delivered on exit | 5 min |
| **Main cycles 11–20** (phase B) | Guidance mode varies (`02` §7.2 as amended) | ~40 min |
| Post-session questionnaire | As `09` §6.1 | 15 min |
| **Total on the day** | | **~145 min** (incl. branch choice on rejections) |

The session remains one continuous sitting with the hinge as the scheduled break. A short optional pause (≤ 2 min) is added between the tutorial and cycle 1.

---

## 3. Prologue (warm-up block)

**Purpose:** interface familiarisation, and an **in-task baseline** of first-order accuracy and confidence, replacing the offline battery as the individual-difference covariate.

**Content: a prologue to the main incident.** W1–W5 cover the first hours of the same fire, before cycle 1: first reports, initial attack, the first projections. The prologue sets up the situation the main cycles continue, so no separate warm-up incident is authored.

**Identical for everyone.** All participants use the `directed` capability set in W1–W5, receive the same content and the same probes. Condition-specific tools are enabled only at the tutorial.

**Authoring constraints on the prologue:**
- nothing in it may reveal or pre-empt the cycle-12 omission, the cycle-18 contradiction or the load-bearing T4 items;
- its flags follow the alternation rule (`03` §4.2) and are not counted in the main 50% base rate;
- initial strategic intent is established here, so phase-A decision items have a strategy to align with.

**Measures per prologue cycle:** Type J with confidence; the course-of-action choice with confidence (`16`); allocation. SA probes per §4.

**Competence gate.** Checks mechanics only (a judgement submitted, a point marked, a polygon drawn, a confidence value set), never accuracy.

**No feedback** on correctness, as everywhere else (`01` §4.5).

---

## 4. Probe allocation across the 25 cycles

### 4.1 Totals

| Block | Blanked freeze (R) | SPAM (S) | Neither | Cycles |
|---|---|---|---|---|
| Prologue W1–W5 | 2 | 1 | 2 | 5 |
| Main 1–20 | 8 | 5 | 7 | 20 |
| **Total** | **10** | **6** | **9** | **25** |

### 4.2 Schedule

```
Prologue        W1 W2 W3 W4 W5
Recall (R)          ●     ●
SPAM (S)               ●
Neither          ●           ●

Main cycle      1  2  3  4  5  6  7  8  9 10 | 11 12 13 14 15 16 17 18 19 20
Judgement (J)   ●  ●  ●  ●  ●  ●  ●  ●  ●  ● |  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●
Decision (D)    ●  ●  ●  ●  ●  ●  ●  ●  ●  ● |  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●
Recall (R)         ●        ●  ●        ●    |        ●  ●     ●        ●
SPAM (S)              ●           ●          |  ●           ●              ●
Neither         ●        ●           ●     ● |     ●              ●  ●
Expectation (E) as `08` §5.3 (order A/B)
Falsify (F)                       ●          |           ●              ●
Uncertain (U)                                |                       ●     ●
```

**Rules behind the placement:**
- **Cycle 1 has no SA probe**, so participants rebuild the picture after the tutorial before the first freeze.
- **Cycles 12 and 18 have no SA probe**, protecting the omission and contradiction windows (`08` §8.3).
- Freezes are balanced across phases: **4 in phase A (2, 5, 6, 9), 4 in phase B (13, 14, 16, 19)**. Five of the eight are v3.0 recall cycles.
- SPAM falls only in cycles without a blanked freeze.
- **Cycle 11 carries a SPAM probe**, so uptake of the guidance right after the hinge is measured without blanking the screen.

### 4.3 Scheduling is deterministic

The v3.0 rationale stands: a random freeze could land inside the contradiction or omission window. All participants get the same schedule; cycle index enters every model. With nine unprobed cycles, most cycles do not contain a freeze, which keeps freezes hard to anticipate.

### 4.4 Items per freeze

**Five SA items in every freeze: two Level 1, two Level 2, one Level 3.** Each item is followed by a confidence rating (0–100, same scale as Type J).

| Level | Items | Examples |
|---|---|---|
| L1 perception | 2 | Where is a named formation; current wind direction; last reported edge on a named flank |
| L2 comprehension | 2 | Which sector is most exposed; which formation is least able to reposition |
| L3 projection | 1 | Where will the fire front be on a named flank at the next boundary; which road will be cut first |

- **L3 items** follow the consequence rule in `08` revision (d).
- **Phase B:** one of the two L1 items is an **intent item** ("What is the current priority?"), so intent uptake is measured in every post-hinge freeze.
- **L3 items are answered from memory with the envelope hidden.** They are scored against the authored actual perimeter, not against the envelope, and never ask the participant to recall the envelope itself.
- Estimated freeze length: ~80–100 s, within the 2-minute ceiling.

| | Freezes | Items | Answer–confidence pairs |
|---|---|---|---|
| Prologue | 2 | 5 each | 10 |
| Phase A | 4 | 5 each | 20 |
| Phase B | 4 | 5 each (1 intent) | 20 |
| **Total R** | **10** | | **50** (20 L1, 20 L2, 10 L3) |

Together with 25 Type J judgements, that is **75 paired first-order and confidence responses per participant**, plus 25 decision–confidence pairs.

---

## 5. SPAM probes (Type S)

**New probe type.** Online, non-blanking, and **the clock keeps running**.

| Property | Specification |
|---|---|
| Timing | At an authored offset inside the working period, never within 15 s of a bubble arrival |
| Ready prompt | "Voitko vastata kysymykseen?" with a *Valmis* button. Time to *Valmis* is the workload index |
| Question | Shown after *Valmis*; the map, rail and all tools **remain available** |
| Response | Closed format; followed by confidence 0–100 |
| Timeout | 20 s to *Valmis*, 30 s to answer; timeouts are logged, not errors |
| Content | L1/L2 situation items; the cycle-11 item concerns current intent |
| Scoring | Accuracy and time to answer; time to *Valmis* separately |
| Item bank | 10 authored for 6 slots |

**Interpretation.** SAGAT-style recall measures what is held in memory; SPAM measures how quickly it can be found with the tools at hand. The contrast between the two, by group, is the in-head vs. with-tools comparison.

**Known cost.** SPAM is intrusive in a large share of studies and confounded with workload (Endsley's review). Kept to six probes, placed identically for all groups, and its latency is always analysed together with workload.

---

## 6. Time budget changes relative to `08` §5.1

| Element | v3.0 | Now |
|---|---|---|
| Recall freeze (R) | 45 s × 6 (3 items) | ~90 s × 8 main + 2 prologue (5 items with confidence) |
| SPAM (S) | — | ~30 s × 5, inside the working period (clock running) |
| Course-of-action choice (D) | — | 20 s × 20; +20 s on phase-B cycles with AI alignment feedback |
| Prologue | — | 5 cycles, ~3.7 min each |
| Pre-session battery | 45 min | 15 min (AI literacy + demographics) |

---

## 7. Metacognition without the battery

- **Per-participant baseline:** calibration (Brier components, over/underconfidence) from the 5 prologue J responses and 10 prologue recall responses.
- **Primary metacognitive outcomes:** calibration and bias across the main cycles, per `09` §7.1.
- **Metacognitive efficiency:** estimated **hierarchically** (group-level parameters) from all paired responses; per-participant values are treated as shrunken estimates, not standalone scores.
- **Paper 3 criterion:** in-task metacognition from the main cycles, with the temporal holdout (cycles 1–10 develop, 11–20 evaluate) unchanged.
- **Declared limitation:** without an offline battery, domain-general metacognitive ability is not measured; H7 is reformulated (`01`, amendment).

---

## 8. Participants (F8)

- Target: **200 recruited**, mostly at *pelastusjoukkue* command level.
- Record echelon (command / supervisory / crew) and years in command roles; **stratify randomisation on echelon** in addition to the `09` §2 variables.
- Echelon enters every model as a covariate; a sensitivity analysis excludes non-command participants.
- The briefing role is unchanged (the participant acts as incident commander at *pelastusjoukkue* level).

**Attrition warning.** `09` §6.2 plans for 25–35% attrition. If 200 is the recruitment figure, roughly 130–150 remain for analysis: about 45–50 Radio and 85–95 LLM-reasoning participants, about 42–48 per Paper 2 cell (`02` revision (f)). *Open: is 200 recruited or completed? (§9)*

---

## 9. Open items created or left by this document

| Item | Status |
|---|---|
| Split of probes between prologue and main | **Decided 1.1:** prologue 2/1/2, main 8/5/7 |
| Prologue vs separate warm-up incident | **Decided 1.1:** prologue |
| Items per freeze | **Decided 1.1:** 5 (2 × L1, 2 × L2, 1 × L3) |
| Which L1 item becomes the intent item in phase B | Default: the second L1 item |
| Whether 200 is the recruited or completed sample | Open; treated as recruited |
| Group structure | **Decided (f):** Radio 70; LLM reasoning 130, split 65 / 65 at the hinge |
