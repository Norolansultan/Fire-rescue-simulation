# 16 — Course-of-action decision task (Paper 2)

**Version 1.2 · 17 September 2026 · Status: governing for the topics below.** Implements fork F7 (`11` §7): the 2 × 2 fixed-choice decision is **combined with** the v3.0 allocation task, not substituted for it. Adds to `01` §6, `03` §2.2, `04` §7, `06` §4.5 and `07` §2.6, which carry amendment markers.

> **Changelog**
> - **1.4 · 17 Sep 2026** — Paper 2 cells are 65 / 65 within LLM reasoning (`02` revision (f)).
> - 1.3 · 17 Sep 2026 — Paper 2 contrast is within the LLM-reasoning group (`02` revision (e)).
> - 1.2 · 17 Sep 2026 — per-choice alignment feedback removed; intent is maintained through query answers (`14` revision (d)). Initial and final choice collapse into one response.
> - 1.1 · 17 Sep 2026 — alignment feedback applies only to the reasoning-AI via-AI cell; warm-up is a prologue.
> - 1.0 · 17 Sep 2026 — created.

---

## 1. Purpose

Paper 2 asks how a single strategic guidance, delivered at the hinge, **survives through phase B** and how the way it is delivered affects decisions. The allocation task (v3.0) measures what participants *do* with resources; the course-of-action choice measures **which intent they are acting on**, with scoring that separates following the strategy from reading the situation well.

---

## 2. Placement in the cycle

```
… → judgement, confidence, correction (Type J)
  → verification window
  → [recall freeze, if scheduled]
  → COURSE-OF-ACTION CHOICE + confidence            ← new
  → allocation and free-text rationale (v3.0)
  → cycle_end
```

Every cycle, including prologue cycles W1–W5 (`15` §3). Clock halted, picture visible.

---

## 3. The four options

Each cycle presents four courses of action, fixed in advance, defined relative to **the strategy in force** (the initial intent, established in the prologue, for the prologue and phase A; the hinge guidance in phase B).

| | Situationally sound | Situationally unsound |
|---|---|---|
| **Aligned with strategy** | **A** — the best answer | **B** — follows intent, ignores the situation |
| **Against strategy** | **C** — locally sensible, conflicts with intent | **D** — wrong on both counts |

**In phase B, options C and D are written to match the pre-hinge strategy wherever possible,** so choosing them indicates that the earlier guidance is still steering the participant.

**Option C is not legitimate disobedience.** In most cycles A is clearly best. Where following the strategy is locally costly, the correct answer is fixed in advance by the expert panel (§5).

---

## 4. Response and feedback

1. **Initial choice** (A/B/C/D, order randomised by seed) and **confidence 0–100**.
2. **Reasoning-AI participants in the via-AI cell, phase B only:** the AI shows an authored alignment statement for the chosen option ("in line with the current priority" / "conflicts with the current priority: …"). No statement about situational soundness is given.
3. **Final choice** and **final confidence.** Participants may keep or change their choice.
4. Allocation follows and is recorded as in v3.0.

All other participants make one choice per cycle; for them, initial = final.

Alignment statements are pre-authored per option per cycle, served through the closed engine (`14`), and never flag the cycle-18 contradiction.

---

## 5. Authoring and validation

- **Item bank:** 30 decision items for 25 slots (20 main + 5 prologue), so pilot 2 can select by difficulty.
- **Expert classification:** 3–5 experienced incident commanders classify each option blind into the four cells (Delphi round). Items are kept only where the panel agrees; that classification is the answer key.
- **Parallel form:** options within an item have similar length and detail; no strategy keyword appears only in aligned options.
- **Allocation link:** each option is mapped to the set of allocations in the viability table (`04` §7) that implement it. This enables **choice–allocation coherence** (§6).
- **Finnish register:** reviewed with the rest of the string table (`11` §2.4).

---

## 6. Measures

| Measure | Definition |
|---|---|
| Strategy alignment | Share of A + B |
| Situational soundness | Share of A + C |
| Blind compliance | Share of B |
| Intent loss | Share of C + D in phase B |
| Old-strategy persistence | Share of phase-B choices matching the pre-hinge strategy |
| Intent survival | Alignment as a function of cycles since the hinge |
| Decision calibration | Confidence vs. choosing A |
| Feedback effect (via-AI cell) | Initial → final transitions (B→A, C→A, A→B, …) |
| Choice–allocation coherence | Allocation consistent with the chosen option, with another option, or with none |
| Understood vs. applied | Joint with phase-B intent recall items (`15` §4.4): high intent recall + C/D = understood but not applied |

**Primary Paper 2 test:** alignment in phase B within the reasoning-AI group, guidance-once vs. guidance-via-AI, with cycles-since-hinge and its interaction. Prologue and phase-A alignment enter as baseline covariates.

---

## 7. Data model additions (to be merged into `04`)

```ts
type Alignment = "aligned" | "against";
type Soundness = "sound" | "unsound";

interface DecisionOption {
  readonly id: string;
  readonly labelFi: string;
  readonly alignment: Alignment;
  readonly soundness: Soundness;
  readonly matchesPriorStrategy: boolean;          // phase B only
  readonly consistentAllocationKeys: readonly string[];
  readonly alignmentFeedbackFi: string;            // shown only in the reasoning-AI via-AI cell, phase B
}

interface DecisionItem {
  readonly id: string;
  readonly cycle: CycleIndex | WarmupIndex;
  readonly strategyInForce: "initial" | "hinge";
  readonly promptFi: string;
  readonly options: readonly [DecisionOption, DecisionOption, DecisionOption, DecisionOption];
}

interface DecisionResponse {
  readonly itemId: string;
  readonly presentedOrder: readonly string[];
  readonly initialOptionId: string;
  readonly initialConfidence: number;              // 0–100
  readonly feedbackShown: boolean;
  readonly finalOptionId: string;
  readonly finalConfidence: number;
}

type GuidanceMode = "once" | "via_ai";             // SessionConfig.guidanceMode; "via_ai" only in the reasoning-AI group
```

## 8. Telemetry additions (to be merged into `07`)

| Kind | Detail |
|---|---|
| `decision_presented` | Item id, presented option order |
| `decision_option_hovered` | Option id |
| `decision_initial_submitted` | Option id, confidence, latency from presentation |
| `alignment_feedback_shown` | Option id, feedback id, onset |
| `decision_final_submitted` | Option id, confidence, latency from feedback onset (or from initial submission) |

## 9. Tests (to be merged into `10` M8)

- `test/decision/items.spec` — every main and prologue cycle has exactly one item with one option per cell.
- `test/decision/feedback.spec` — alignment feedback is shown only to reasoning-AI participants in the via-AI cell, and only in phase B.
- `test/decision/order.spec` — option order derives from the seed and is logged.
- `test/decision/coherence.spec` — every option maps to at least one allocation key in the viability table.

---

## Revision 17 Sep 2026 (d) — supersedes earlier amendments where they conflict

- **§4 steps 2–3 are withdrawn.** Every participant makes one choice with confidence per cycle. The via-AI manipulation lives in the query answers (`02`, `14` revision (d)), not in feedback on choices. This resolves review P5: the machine never comments on the participant's decisions.
- `DecisionOption.alignmentFeedbackFi`, `DecisionResponse.feedbackShown`, `finalOptionId`, `finalConfidence` and the `alignment_feedback_shown` / `decision_final_submitted` records are **removed**. `DecisionResponse` keeps `initialOptionId` (rename to `optionId`) and `initialConfidence` (rename to `confidence`).
- The "feedback effect" measure (§6) is replaced by **intent-query exposure**: number of phase-B answers carrying an intent line before each choice.
- `test/decision/feedback.spec` is replaced by `test/decision/no-feedback.spec`.
- **Decided:** no fifth "none of these" option. The task keeps exactly four options, so every answer is scored on both dimensions.
