# SPEC — Verification of machine-generated projections in wildfire incident command

**Programme:** Doctoral study, Kalle Koivunen, LUT University
**Spec version:** 3.0 · 13 September 2026
**Status:** Governing. This directory replaces every prior design document.

> **Changelog**
> - **17 Sep 2026 (h)** — `18` adopted; index row for `19`.
> - **17 Sep 2026 (g)** — index row for `18` (scenario world-state draft).
> - **17 Sep 2026 (f)** — LLM (facts) group removed. Two groups: Radio (70) and LLM reasoning (130, pull-only); LLM reasoning split 65 / 65 at the hinge (guidance once vs. intent line in AI answers).
> - **17 Sep 2026 (e)** — three Paper 1 groups restored — Radio, LLM, LLM reasoning; both LLM groups pull-only; only the LLM-reasoning group is split at the hinge by how it receives the guidance. Group sizes open (default 70 / 65 / 65).
> - **17 Sep 2026 (d)** — two groups (no AI 70, AI 130); AI group pull-only with group-specific training; AI group split 65/65 at the hinge, the via-AI half receiving query answers framed against the commanded strategy; branch choice adopted with four authored options plus *Ei mikään näistä*, no free text; per-choice alignment feedback removed.
> - **17 Sep 2026 (c)** — study-shape table updated for `15` v1.1 and the single split AI group.
> - **17 Sep 2026 (b)** — study shape updated (§2), precedence rule 5 added (§1), index rows for `15` and `16`. Invariants unchanged.
> - **17 Sep 2026 (a)** — index rows added for `13` (non-governing) and `14` (proposed).

---

## 0. How to read this if you are the builder

You are building a single-page web application that runs one scripted wildfire incident, in Finnish, for one participant at a time, unsupervised, on that participant's own computer. It presents a map, delivers scripted information, asks scripted questions at scripted moments, and records everything the participant did with microsecond-honest timing. It does not simulate fire, does not call a language model, and does not score anything.

Read in this order:

| # | File | What it settles |
|---|---|---|
| **00** | `00_README.md` | Precedence, vocabulary, the seven invariants, what is not yet decided |
| **01** | `01_Experiment_Design.md` | Why the thing exists; hypotheses; what must be measurable |
| **02** | `02_Conditions_and_Information_Routing.md` | The three arms; the capability matrix; the four information tiers |
| **03** | `03_Scenario_Master.md` | The twenty cycles, the fire science, the flag sequence, the map extent |
| **04** | `04_Data_Model.md` | **Every type. Start here if you are writing code.** |
| **05** | `05_System_Architecture.md` | Modules, determinism, freeze machine, asset bundle, replay |
| **06** | `06_UI_and_Interaction.md` | The layout, the time model, typography, information-design rules |
| **07** | `07_Telemetry_and_Logging.md` | Every record the instrument emits |
| **08** | `08_Probes_and_Instruments.md` | The probe taxonomy, the three-way judgement, scoring definitions |
| **09** | `09_Methods_and_Analysis.md` | Protocol, exclusions, analysis plan, power, ethics |
| **10** | `10_Build_Plan_and_Acceptance.md` | Milestones and the tests that must pass |
| **11** | `11_Open_Design_Register.md` | **What is still missing. Read before estimating.** |
| **12** | `12_Map_Symbology_and_Projection.md` | How the projection is drawn, why it is not graded, what goes on units |
| 13 | `13_Plan_Reconciliation_2026-09-17.md` | *Working document, not governing.* Conflicts between v3.0 and the 16–17 Sep plan decisions; forks registered in `11` §7 |
| 14 | `14_Retrieval_and_Response_Engine.md` | *Proposed.* Closed retrieval engine for query AI and reasoning AI; LLM-compiled information packages |
| **15** | `15_Session_Structure_and_Probe_Schedule.md` | **Governing.** Prologue, 10 freezes × 5 items / 6 SPAM / 9 unprobed, session timing, participants |
| **16** | `16_Decision_Task.md` | **Governing.** Four-option course-of-action choice combined with allocation (Paper 2) |
| 17 | `17_Pre_Build_Review_2026-09-17.md` | *Review, not governing.* Design problems P1–P8, L3 inventory, handoff comparison |
| 18 | `18_Scenario_World_State.md` | *Adopted; pending domain review.* Setting, 2030 source inventory, intent and hinge texts, geography, weather series, fire behaviour, unit and drone timelines, faults |
| 19 | `19_Query_Database_Content.md` | *Proposed.* What the searchable database holds, how team communication enters it, what is never recorded, per-cycle inventory, routes for load-bearing items |

If a statement in 01–10 conflicts with a statement in `11_Open_Design_Register.md`, the register wins: it marks the thing as undecided, and an undecided thing must not be guessed.

---

## 1. Precedence

1. `00_README.md` §3 (invariants) overrides everything.
2. `04_Data_Model.md` overrides prose descriptions of data anywhere else. Where a document describes a field in words and the data model types it, the type is authoritative.
3. `11_Open_Design_Register.md` overrides any document that appears to settle an item the register lists as open.
4. Otherwise, lower file number wins on questions of *what the study is*; higher file number wins on questions of *how it is built*.
5. **Amendments dated 17 September 2026.** Where a section in `01`–`10` carries a `[SUPERSEDED 2026-09-17]` marker, the document it points to (`14`, `15` or `16`, or the file's own dated amendment) wins over the marked text, regardless of file number.

**All previous documents are archived.** `01_Experiment_Design_v2.md`, `02_Architecture_v2.md`, `03_Scenario_Authoring_v2.md`, `04_Methods_v2.md`, `05_Probe_and_Freeze_Design.md`, `07_Scenario_Concepts.md`, `08_Incident_Scenario_20_Cycles.md`, `09_Realism_Review_and_Hidden_Information.md`, `10_Records_and_Querying_Design.md`, `11_Condition_Specification.md`, `12_Consistency_Audit_and_Open_Design.md`, `13_Settled_Shape_and_Layout.md`, `Paper1_Test_Specification.md` and all v1 files are historical record only. **Do not build from them.** They contain superseded cycle counts (eight, nine), a superseded condition name (`human`), a superseded two-scenario structure, and a superseded four-region layout.

---

## 2. The shape of the study, in one page

| Property | Value | Locked by |
|---|---|---|
| Scenarios | **One** | 01 §2 |
| Cycles | **Twenty** | 03 §2 |
| Sittings | **One continuous session**, with a single five-minute pause between cycles 10 and 11 | 09 §3 |
| Prologue (warm-up) | **Five cycles W1–W5** of the same incident before cycle 1, identical for everyone, no AI; then a 3-min interface tutorial | 15 §3 |
| Virtual time per cycle | **Twenty minutes.** Twenty cycles = 6 h 40 min of incident | 03 §2.1 |
| Real time per cycle | ~3.5 min average | 08 §5 |
| Task time | ~100 min incl. prologue; whole session **~140 min** including briefing and questionnaire | 15 §2 |
| Conditions | **Radio (70) · LLM reasoning (130)**, between subjects; LLM reasoning is pull-only and split **65 / 65** at the hinge (guidance once vs. intent line in AI answers) | 02 revision (f) |
| Participants | **200 firefighters**, mostly incident-command level | 15 §8 |
| Containment judgements per participant | **Twenty** (+5 in the prologue) | 08 §3.2 |
| Expectation-marking cycles | Ten (alternating), counterbalanced | 08 §3.3 |
| Blanked SA freezes | **Ten** (2 prologue + 8 main), **five items each** (2 × L1, 2 × L2, 1 × L3), confidence per item | 15 §4 |
| SPAM probes | **Six** (1 prologue + main cycles 3, 7, 11, 15, 20) | 15 §5 |
| Cycles with no SA probe | **Nine** (W1, W5, and main cycles 1, 4, 8, 10, 12, 17, 18) | 15 §4.2 |
| Course-of-action choice | Every cycle, four options (aligned/against × sound/unsound), plus allocation | 16 |
| Embedded contradiction | Exactly one, at cycle 18 | 03 §5 |
| Embedded omission | Exactly one, at cycle 12 | 03 §5 |
| Strategic-guidance hinge | Between cycles 10 and 11 | 03 §4 |
| Administration | Remote, unsupervised, participant's own computer, hosted web app | 05 §2 |
| Proxy validation | **Temporal holdout** — develop on cycles 1–10, evaluate on cycles 11–20 | 09 §7.3 |
| Licence target | MIT, clean-room, no AGPL/SSPL/source-available anywhere in the tree | 05 §9 |

---

## 3. The seven hard invariants

Violating any one of these invalidates collected data. Each has a named automated test in `10_Build_Plan_and_Acceptance.md`.

**I1 — Determinism.** Same scenario id, same version, same seed, same input sequence ⇒ byte-identical log, on any machine, at any time. No `Date.now()`, `performance.now()`, `Math.random()`, `crypto.getRandomValues()`, or UUID v4 anywhere reachable from the run loop. Iteration order is sorted, never insertion order.

**I2 — No wall-clock in logic.** Virtual time is the only time any decision, schedule or transition reads. Wall-clock appears in the log solely as the annotation field `tWallOffsetMs`.

**I3 — No network during a run.** Once the session begins, zero outbound requests until the run ends. All tiles, fonts, terrain, forest data, weather series and scenario content resolve into a content-hashed asset bundle beforehand. Telemetry uploads occur only after the run, or from a queue on a separate origin-isolated worker that is inert while `RUNNING`.

**I4 — Truth never reaches the render layer.** `TruthAnnotation` is stripped at a type boundary before any payload crosses into rendering. This is the bug class that would silently invalidate the study and remain invisible until analysis.

**I5 — Crash-safe, gapless logging.** Every record is durably persisted before the UI acknowledges the action that produced it. `seq` is gapless; a gap is a detected data-loss event and is reported, never silently tolerated.

**I6 — Retrieval closure.** The query subsystem can only return authored corpus content. It is structurally incapable of generating text. There is no language model in the instrument. The `substitutive` channel emits pre-authored structured signals, not generated prose.

**I7 — Licence purity.** MIT, BSD, ISC, Apache-2.0, CC0 for code; SIL OFL 1.1 for fonts; CC BY 4.0 for data. CI fails the build on anything else. **Voikko is specifically excluded** — it is GPL and would contaminate the MIT grant. Anything not originated by the author lives in `vendor/` with its licence header intact and an entry in `THIRD_PARTY_NOTICES.md`.

---

## 4. Vocabulary

Terms used with a fixed meaning throughout. Where a Finnish term is the participant-facing string, it is given.

| Term | Meaning |
|---|---|
| **Cycle** | One iteration of the fixed sequence in 03 §2.2. Twenty per session. Advances virtual time by twenty minutes. |
| **Bubble** | A pushed observation record that appears on the map and in the report rail. Tier 1. |
| **Atom** | Any single authored information record, of any tier. The corpus is 290–400 atoms. |
| **Tier** | T1 pushed / T2 system-queryable / T3 ask-a-person / T4 unit-to-unit lateral traffic. See 02 §3. |
| **Envelope** | The machine's projection of where the fire will be at the next cycle boundary, drawn as a polygon with a stated validity horizon (*ennuste voimassa klo HH:MM saakka*). |
| **Flag** | The authored truth about an envelope: `holds`, `breach_quantitative`, `breach_categorical`. Never rendered. |
| **Channel** | The `substitutive` condition's pushed integrated signal stream. Closed vocabulary, not prose. |
| **Signal** | One `ChannelSignal`: category, urgency 0–3, certainty, attribution, quiet flag. |
| **Probe** | A scripted question. Types R, J, E, F, U. See 08. |
| **Freeze** | A halt of the virtual clock for a probe. Two modes: `PROBING_VISIBLE`, `PROBING_BLANKED`. |
| **Hinge** | The point between cycles 10 and 11 where the duty officer delivers strategic guidance. Divides phase A from phase B. |
| **Branch** | An authored counterfactual development that does not occur. Used to score allocation robustness and safety. Never rendered. |
| **Contradiction** | The single authored pair of mutually inconsistent reports plus the lateral traffic that reconciles them. Cycle 18. |
| **Omission** | The single authored development that falls outside every envelope *categorically* — a possibility never represented. Cycle 12. |
| **Load-bearing fact** | An atom whose discovery would change a decision. Subject to the three-route reachability rule, 02 §4. |
| **Haku** | The search drawer. Present in all conditions; contents differ by condition. |
| **Avaa tekoäly** | The AI drawer. Present in `assistive` and `substitutive` only. |

---

## 5. Non-goals

Stated so nobody builds them.

No fire model. Fire behaviour is hand-authored from FWI reasoning (03 §3) and stored as geometry. The instrument replays; it does not compute spread.

No language model, in any condition. See I6.

No live multi-user operation. One participant, one session, no server-side game state.

No participant agency over the world. Allocations are recorded and scored; the incident develops as authored regardless. This is deliberate and load-bearing — see 06 §4.

No adaptive difficulty, no trial-by-trial feedback, no runtime scoring. A runtime that scores can bias a subsequent probe.

No mobile or tablet support. Desktop or laptop with a minimum viewport of 1280 × 800.

No Russian-side map coverage. The extent is bounded to keep ~10 km of buffer from the Finnish–Russian border (03 §1.2).

---

## 6. Change control

The scenario corpus and the code are versioned independently and both are content-hashed.

Any change to authored content bumps `ScenarioContract.version` (semver). Any change that alters what a participant could see or when they could see it is a **major** bump and invalidates comparison with data collected under a previous major. Data collected across a major boundary is analysed separately or discarded; there is no merging.

Any change to these spec files is recorded in a changelog block at the top of the file, with date and the reason. A change that touches §3 of this file requires the whole set to be re-read for consequences — the invariants are what every other document assumes.
