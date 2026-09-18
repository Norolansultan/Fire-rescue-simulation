# 02 — Conditions and information routing

**Version 3.1 · 17 September 2026** (v3.0 · 13 September 2026). Consolidates `11_Condition_Specification.md` and `09_Realism_Review_and_Hidden_Information.md` Part 3. Supersedes both.

> **Changelog**
> - **17 Sep 2026 (g)** — §3.3 restated for the two groups in use; channel route unused; see `19`.
> - **17 Sep 2026 (f)** — LLM (facts) group removed. Two groups: Radio (70) and LLM reasoning (130, pull-only); LLM reasoning split 65 / 65 at the hinge (guidance once vs. intent line in AI answers).
> - **17 Sep 2026 (e)** — three Paper 1 groups restored — Radio, LLM, LLM reasoning; both LLM groups pull-only; only the LLM-reasoning group is split at the hinge by how it receives the guidance. Group sizes open (default 70 / 65 / 65).
> - **17 Sep 2026 (d)** — two groups (no AI 70, AI 130); AI group pull-only with group-specific training; AI group split 65/65 at the hinge, the via-AI half receiving query answers framed against the commanded strategy; branch choice adopted with four authored options plus *Ei mikään näistä*, no free text; per-choice alignment feedback removed.
> - **17 Sep 2026 (c)** — only the reasoning-AI group is split by guidance mode; prologue warm-up; 10 freezes × 5 items, 6 SPAM, 9 unprobed (see `15` v1.1).
> - **3.1 · 17 Sep 2026** — Group labels (F3), request-driven reasoning AI (F2) and guidance-mode split (F4). See `14`, `15`, `16`.

This document is the manipulation. If the builder gets one document exactly right, it is this one.

---

## 1. The three conditions

| id | Finnish label | What it is |
|---|---|---|
| `directed` | *(not shown to participant)* | The participant obtains field information by selecting a named formation or the duty officer and sending a typed request, radio-style. Integration is theirs. |
| `assistive` | | Adds machine retrieval: a free-text query returns source-attributed corpus facts **verbatim**. Integration is still theirs. |
| `substitutive` | | Adds machine integration: a channel **pushes** a reconciled situational picture each cycle, unasked. |

**Primary contrast: `substitutive` versus `assistive`.** That is the integration boundary and where the hypothesis lives. `directed` is the baseline and the test of source-selection behaviour.

### 1.1 Why the condition is named `directed` and not `human`

Sessions are unsupervised and remote, so there is no live confederate. The responder is automated: authored replies, delivered after an authored latency per source class.

The condition therefore does not support a claim about human-versus-machine mediation. It supports a claim about **directed versus pooled retrieval** — you must decide whom to ask. This is recorded in `ValidityClaim.knownDivergences` and stated in the limitations. Source-selection behaviour remains a measure and is arguably cleaner than it would be with a confederate, because no person can vary.

**Latency matching is a hard requirement.** Authored `directed` reply latency must match the distribution of `assistive` retrieval latency, or tempo is confounded with condition. CI asserts the two distributions over the authored corpus.

### 1.2 Three rules that make the manipulation work

**The substitutive channel is pushed, not offered.**

> **[SUPERSEDED 2026-09-17]** For now the reasoning-AI condition is request-driven, served by the closed engine in `14`. The pushed channel remains a possible later addition (`14` §7). An integration the participant must request remains assistive, and an available-but-unused capability yields a null that means nothing.

**The channel is a designed signal system, not a summariser.** Closed vocabulary of six to eight situation categories; urgency graded 0–3 and orthogonal to category; certainty as an explicit value including `unknown`; named source attribution; and a fixed-cadence explicit all-clear so that silence means channel failure rather than absence of events. Prose is excluded deliberately — prose smuggles in an explanation design, which is a separate large variable and not this study's question.

**Provenance is held constant.** `assistive` labels every returned fact with originating unit or sensor and observation time, so the contrast with `directed` varies channel rather than provenance visibility.

---

## 2. The capability matrix

What each condition can do, across every surface. Build this table; it is the specification.

| Surface | `directed` | `assistive` | `substitutive` |
|---|---|---|---|
| Map, unit and asset markers, bubbles | identical | identical | identical |
| Projection envelope with validity horizon | identical | identical | identical |
| Status strip and report rail | identical | identical | identical |
| Radio panel — ask a named formation | yes | yes | yes |
| Radio panel — ask the duty officer | yes | yes | yes |
| Unit status and its age | yes | yes | yes |
| Reference data (stand, road, water, maintenance) | browse by map object | browse **and** free-text query | browse **and** free-text query |
| Situation log | scroll, filter by unit or time window | **free-text search across it** | free-text search |
| Traffic log | request by named unit only | **query by unit, group, time window or content** | query, **and summarised into the channel** |
| Cross-source free-text query | no | yes | yes |
| `Avaa tekoäly` drawer present | **no** | yes | yes |
| Pushed integrated channel signals | no | no | **yes** |

**Read the matrix as a ladder.** `directed` has access to everything but must navigate it himself, one source and one unit at a time. `assistive` adds machine retrieval across sources — the same facts, found faster, returned verbatim with provenance. `substitutive` adds machine integration — the facts combined, reconciled and pushed without being asked for.

The step from *cross-source free-text query* to *pushed integrated channel* is the assistive-to-substitutive boundary.

**Deliberately identical across all three:** the map, the bubble stream and its timing, the envelope and its accuracy, the probe schedule, the duty officer's behaviour, the ability to ask any named formation anything, and the underlying information space. **Nothing is knowable in one condition and unknowable in another.**

---

## 3. The four information tiers

Every atom in the corpus carries a tier. The tier determines how it can reach the participant.

| Tier | What it is | Route | Count | Share |
|---|---|---|---|---|
| **T1 — pushed** | Map state, unit positions, incoming reports as bubbles | Automatic, at authored times within the working period | 90–120 | ~30% |
| **T2 — system-queryable** | Stand data, FWI values, road and water registers, maintenance history, weather series, situation log entries | Browse (all conditions) or free-text query (`assistive`, `substitutive`) | 80–110 | ~25% |
| **T3 — ask a person** | Ground observations only a formation leader or the duty officer can give. Never logged anywhere | Directed request to a named source | 70–100 | ~25% |
| **T4 — unit-to-unit lateral traffic** | What formations said **to each other**, never reported upward | Only by requesting that traffic, or by a unit mentioning it when asked | 50–70 | ~20% |
| | | | **290–400** | |

### 3.1 Tier 4 is the point

Crews coordinate laterally all the time. A unit warns its neighbour; two units agree a boundary between them; someone mentions their water is running low to the crew beside them rather than to command. None of that is concealment — it is people telling the person who needs to know. But it means the commander's picture is missing things the organisation collectively knows.

**Information that exists in the system, is never pushed, and requires the participant to think to ask for it.**

What lives in T4 across the incident: a crew warns the neighbouring crew about embers landing in their sector, two cycles before anyone reports spotting upward; two units informally agree to shift the boundary between their sectors, so the map's sector assignment no longer matches who is actually where; a unit mentions its water will last twenty minutes; the drone operator warns a ground crew the battery is nearly done, before the drone goes offline; **a crew reports upward that the line is holding and tells the crew beside them that they are not sure**; a unit mentions standing dead trees making its planned approach unsafe; the neighbouring region's formation tells its own commander something that reaches this participant only on request.

That fifth item is the strongest contradiction available, because nobody is wrong or lying. Two records, both true to their own audience, and the discrepancy visible only to someone who looks at both.

### 3.2 The three load-bearing T4 items

Each has a downstream consequence a participant who found it could have anticipated. Each is a named measure.

| id | Item | Appears | Consequence |
|---|---|---|---|
| `t4.ember_warning` | Crew warns neighbour about embers landing | Cycle 6, referring to cycle 4 | Spotting reported upward at cycle 8 |
| `t4.private_doubt` | Crew reports the line holding, tells neighbour it is unsure | Cycle 11 | Line fails at cycle 13 |
| `t4.water_state` | Unit tells neighbour its water will last twenty minutes | Cycle 4 | Water shuttle route cut at cycle 13 |

### 3.3 What each condition does with tier 4

In `directed`, the participant can request traffic from a named formation and read it raw.

In `assistive`, the participant can query the traffic log and receive matching entries verbatim.

In `substitutive`, the channel has access to the traffic and **summarises it into the situational picture, dropping the significant item.** The summary is accurate and useful and it loses the one line that mattered.

The machine did not fail, lie, or hallucinate. It compressed, correctly, and the compression removed the thing that would have changed the decision.

### 3.4 Design rules for tier 4

Traffic is timestamped and attributed to **both speaker and addressee**, so its lateral nature is visible.

Volume must be large enough that reading all of it is infeasible within a cycle, so selection matters. **Whose traffic someone chooses to read is a measure**, and every traffic request is logged with its selector.

It is never pushed, in any condition.

The `substitutive` channel's traffic summary is **pre-authored per cycle** like every other channel output, so what it drops is controlled rather than incidental. The drop must not be flagged.

---

## 4. The reachability rule

**Every load-bearing fact must be reachable in every condition, by that condition's own means.**

This is stronger than "reachable by at least one query". That weaker rule has a fatal consequence: the contradiction and the T4 traffic live in records, and if `directed` cannot search records then detection in `directed` collapses for reasons of access rather than cognition — which destroys H3's prediction that detection is similar in `directed` and `assistive`.

So **for every load-bearing fact, three routes must exist**, one per condition. The atom record carries them (`04` §3, `InfoAtom.routes`). CI validates that all three are present and resolvable. A load-bearing fact with fewer than three routes is a scenario defect, not a subtlety.

### 4.1 Worked example — cycle 18

The aerial observer reports the northern flank accelerating. The ground formation on that flank reports the line holding.

**`directed`:** both reports arrive as bubbles. To resolve it the participant must decide whom to ask and type a request — the aerial observer, EK14, or EK14's neighbour. Asking the neighbour reveals that EK14 can see only its own sector. Asking neither leaves the inconsistency carried forward unnoticed.

**`assistive`:** the same two bubbles. A query for the northern flank returns both entries verbatim with sources and times, adjacent. Seeing them side by side makes the tension visible without holding both in mind. A further query into the traffic log returns the lateral exchange that explains it. The comparison is *easier* here than in `directed`, and that is expected — the assistive tool is genuinely assistive.

**`substitutive`:** the same two bubbles, and then a single settled channel signal incorporating both, marking no conflict. The raw entries remain queryable. The traffic log is still available. Nothing is hidden. There is simply no visible seam, and attention moves on.

Equal access, unequal likelihood of looking. That is the design working.

---

## 5. Information rate — the workload confound

`substitutive` receives strictly more pushed content, which raises the question of whether the condition differs in workload rather than in integration.

Three reasons it should not. The channel emits compact structured signals from a closed vocabulary, not prose — reading a signal set is seconds. It *replaces* work rather than adding it: a participant who reads a reconciled picture need not reconcile the sources. The all-clear cadence means the channel is frequently saying nothing has changed.

**One measurement obligation, not optional:** perceived workload is collected in the post-session questionnaire and reported per condition. If `substitutive` shows higher workload, the interpretation of any calibration difference changes. This is checked, not assumed.

---

## 6. One cycle, three ways

Cycle 18 as each group experiences it. This belongs verbatim in the methods chapter.

**`directed`.** Two bubbles appear: the aerial observation of acceleration on the northern flank, and EK14's report that the line is holding. The participant reads both. To resolve it they must decide whom to ask and type a request. If they ask EK14's neighbour, they learn EK14 can see only its own sector. If they ask neither, the reports sit unreconciled.

**`assistive`.** The same two bubbles. A free-text query for the northern flank returns both entries verbatim, with sources and times, adjacent. A further query into the traffic log returns the lateral exchange that explains it.

**`substitutive`.** The same two bubbles, then the channel's signal set: northern flank, urgency 2, certainty *probable*, attribution naming both sources, with a single coherent statement of the flank's state. The conflict has been resolved into a picture. The raw entries are still queryable. There is no visible seam.

---

## 7. The duty officer, and the Paper 2 hinge

### 7.1 The duty officer

Identical in all three conditions: the same messages at the same times, by the same route. Context and the source of strategic guidance, not a manipulated variable in Paper 1. The participant may address the duty officer in any condition, and those exchanges are logged with the same telemetry as formation requests.

### 7.2 Guidance mode is nested, not crossed

> **[SUPERSEDED 2026-09-17]** Replaced by the split design in the amendment below. The six-cell prohibition still holds: the design has four cells, not six.

The guidance at the hinge was once specified as either delivered once by radio or continuously maintained through the channel. Crossed with three conditions that is six cells at fifteen participants each. Not viable.

**Resolution: nest guidance mode inside condition.**

| Condition | How strategic guidance arrives in phase B |
|---|---|
| `directed` | Once, as a duty-officer message. Not repeated. Retrievable by scrolling back in the situation log |
| `assistive` | Once, as a message. Retrievable by query |
| `substitutive` | Once as a message, **and thereafter continuously maintained by the channel**, which restates current intent and flags whether each decision aligns with it |

Paper 2's contrast is then `substitutive` against `directed` in phase B: intent delivered once versus intent continuously maintained and alignment-checked.

**The cost, stated plainly.** Guidance mode is now confounded with integration level. A difference in intent survival between those conditions cannot be attributed to the guidance mechanism alone. Paper 2's claim is about the *whole package* — a channel that both integrates and maintains intent — not about continuous guidance in isolation. This goes in the limitations.

**The alternative,** if the isolated claim matters more: run Paper 2 as a separate study with its own participants and two conditions. Cleaner, and costs a second recruitment. Do not commit until the participant pool is known (`11` §1.1).

**The six-cell design is off the table** and must not appear in any document, pre-registration or analysis script.

---

## Amendment 2026-09-17

**Group labels (F3, provisional).** No AI = `directed`; query AI = `assistive`; reasoning AI = `substitutive`. `assistive` returns fact packages (verbatim atoms); `substitutive` returns situation, meaning and projection packages (`14` §3.1).

**Guidance design (F4).** There is one strategic guidance, delivered at the hinge.

**Decided 17 Sep 2026 (c): only one AI group is split — the reasoning-AI group.**

| Cell | Paper 1 group | Guidance in phase B | Planned n (of 200) |
|---|---|---|---|
| 1 | No AI | Once, duty-officer message | ~67 |
| 2 | Query AI | Once, as cell 1 | ~67 |
| 3 | Reasoning AI | Once, as cell 1 | ~33 |
| 4 | Reasoning AI | Maintained by AI: restates intent and gives alignment feedback on each choice (`16` §4) | ~33 |

Phase A is identical for every participant, so it remains Paper 1's clean window. Paper 1 models include guidance mode as a covariate for phase B. **Paper 2's primary contrast is cell 4 vs. cell 3** — same AI, same content, guidance delivered once vs. maintained by the AI. A secondary contrast compares cell 4 with all once-guidance participants (cells 1–3), with condition as a covariate.

*Allocation option, not decided:* recruiting the reasoning-AI group larger than the other two (e.g. 60 / 60 / 80 → 40 per guidance cell) raises Paper 2 power at a small cost to Paper 1.

Allocation is stratified on echelon and the `09` §2 variables, with guidance mode randomised within the reasoning-AI group.

---

## Revision 17 Sep 2026 (d) — supersedes earlier amendments where they conflict

### Groups

| Cell | Paper 1 group | Phase A | Phase B guidance | n |
|---|---|---|---|---|
| 1 | **No AI** (`directed`) | Radio, browsing | Duty-officer message once | **70** |
| 2 | **AI** | AI query drawer + radio, browsing | Duty-officer message once | **65** |
| 3 | **AI** | AI query drawer + radio, browsing | Duty-officer message once **+ AI answers framed against the commanded strategy** | **65** |

This replaces the three-group and four-cell tables above. There is **one AI condition**; the query-AI / reasoning-AI distinction is withdrawn. Condition id for the AI group: **open** (`substitutive` kept as a placeholder; `11` §7.1).

### The AI group is pull-only

The AI never pushes. Participants obtain its integrated answers **only by asking** (`14`). What they ask, when, and how it relates to their calibration is the core of Paper 1. This deliberately reverses v3.0 §1.2 ("pushed, not offered"): the study now measures metacognition **through** information seeking rather than under unrequested integration.

To prevent a null through non-use, AI participants receive **group-specific training** at the start (`15` §2 tutorial): what the AI can answer, how to phrase a question, two practice queries. The no-AI group gets a matched-length training on radio and browsing. Use is logged and an engagement floor is pre-registered.

### Maintained guidance (cell 3)

When a cell-3 participant asks the AI about anything in the database during phase B, the answer is the same package cell 2 receives **plus an authored line relating it to the commanded strategy** ("Tämä koskee nykyistä painopistettä: …" / "Ei vaikuta nykyiseen painopisteeseen."). Nothing is pushed, and there is **no feedback on the participant's choices**. Guidance is maintained only as far as the participant asks.

Consequences:
- The strength of the manipulation depends on query volume. Query count in phase B is a mediator and must be reported per cell.
- The intent lines advise on relevance, never on tasking: no unit, sector or allocation is recommended (`12` §6.3 holds).

### Contrasts

- **Paper 1 primary:** cell 1 vs. cells 2 + 3, **phase A** (identical treatment within the AI group).
- **Paper 1 secondary:** cell 1 vs. cell 2 across all cycles (both receive guidance once).
- **Paper 2 primary:** cell 3 vs. cell 2, phase B.
- **Paper 2 secondary:** cell 3 vs. cells 1 + 2.

Randomisation: 70 / 130 stratified on echelon and the `09` §2 variables; the AI group is split 65 / 65 at assignment (concealed until the hinge).

---

## Revision 17 Sep 2026 (e) — supersedes revision (d) where they conflict

### Groups

| Cell | Paper 1 group | Id | What the AI returns | Phase B guidance | n (default) |
|---|---|---|---|---|---|
| 1 | **Radio** | `directed` | — (radio, browsing) | Duty-officer message once | 70 |
| 2 | **LLM** | `assistive` | Facts: verbatim source records on request | Once | 65 |
| 3 | **LLM reasoning** | `substitutive` | Integrated answers in the fixed template on request | Once | ~32 |
| 4 | **LLM reasoning** | `substitutive` | As cell 3 | Once **+ intent line in every AI answer** | ~33 |

- The LLM-reasoning group is **one group** in Paper 1 (cells 3 + 4); it is divided only at the hinge.
- Both LLM groups are **pull-only**, with group-specific training at the start. Revision (d)'s pull-only rule and intent-line mechanism stand; its single-AI-group table is withdrawn.
- Condition ids are the v3.0 ids (closes F3).

### Contrasts

- **Paper 1 primary:** LLM reasoning vs. LLM, phase A — the v3.0 integration contrast, now under pull-only access. Radio vs. the LLM groups is secondary.
- **Paper 1 phase B:** cells 1, 2 and 3 all receive guidance once and remain comparable; cell 4 is modelled separately.
- **Paper 2 primary:** cell 4 vs. cell 3, phase B.
- **Paper 2 secondary:** cell 4 vs. cells 1–3 (condition as covariate; confounded with AI type).

### Group sizes — open

Paper 2 uses only the LLM-reasoning group, so its size sets Paper 2's power:

| Allocation (Radio / LLM / LLM reasoning) | Paper 2 cells | Paper 1 primary (LLM vs. reasoning) |
|---|---|---|
| 70 / 65 / 65 (default) | ~32 / 33 | 65 vs. 65 |
| 60 / 60 / 80 | 40 / 40 | 60 vs. 80 |
| 50 / 50 / 100 | 50 / 50 | 50 vs. 100 |

---

## Revision 17 Sep 2026 (f) — supersedes revisions (d) and (e) where they conflict

### Groups (final)

| Cell | Paper 1 group | Id | What the AI returns | Phase B guidance | n |
|---|---|---|---|---|---|
| 1 | **Radio** | `directed` | — (radio, browsing) | Duty-officer message once | 70 |
| 2 | **LLM reasoning** | `substitutive` | Integrated answers in the fixed template, on request | Once | 65 |
| 3 | **LLM reasoning** | `substitutive` | As cell 2 | Once **+ intent line in every AI answer** | 65 |

`assistive` (LLM returning facts) is **not used** in this study. It stays defined in the code as an unused condition so a later study can reinstate it without an engine change.

### Contrasts

- **Paper 1 primary:** LLM reasoning (cells 2 + 3) vs. Radio, phase A.
- **Paper 1 secondary:** cell 2 vs. cell 1, all cycles (both receive guidance once).
- **Paper 2 primary:** cell 3 vs. cell 2, phase B.
- **Paper 2 secondary:** cell 3 vs. cells 1 + 2.

Randomisation: 70 / 130, stratified on echelon and the `09` §2 variables; LLM reasoning split 65 / 65 at assignment, concealed until the hinge.

---

## Revision 17 Sep 2026 (g) — tier 4 with a pull-only AI

§3.3 is restated for the groups in use:

- **Radio (`directed`):** browse the traffic surface by group, unit and time, or ask a named unit.
- **LLM reasoning (`substitutive`):** ask the AI. A **broad** question returns an integrated answer that omits the load-bearing line; a **narrow** question naming the unit, time or topic returns an answer whose sources contain it. Or ask a named unit.
- Lateral knowledge said on **direct-mode radio, by phone or face to face is not in the database** in either group and is reachable only by asking (`19` §4).

The channel summary in §3.3–§3.4 is not used in this study. Which channel each load-bearing item travels on is fixed in `19` §6.
