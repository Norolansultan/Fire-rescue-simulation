# 14 — Retrieval and response engine (query AI and reasoning AI)

**Version 0.2 · 17 September 2026 · Status: governing for the AI group's engine.** Answers forks F2 and F3 in `11` §7 as far as Kalle has decided them. Where this document conflicts with `02` or `05`, those remain governing until they are amended to match.

> **Changelog**
> - **17 Sep 2026 (f)** — LLM (facts) group removed. Two groups: Radio (70) and LLM reasoning (130, pull-only); LLM reasoning split 65 / 65 at the hinge (guidance once vs. intent line in AI answers).
> - **17 Sep 2026 (e)** — three Paper 1 groups restored — Radio, LLM, LLM reasoning; both LLM groups pull-only; only the LLM-reasoning group is split at the hinge by how it receives the guidance. Group sizes open (default 70 / 65 / 65).
> - **17 Sep 2026 (d)** — two groups (no AI 70, AI 130); AI group pull-only with group-specific training; AI group split 65/65 at the hinge, the via-AI half receiving query answers framed against the commanded strategy; branch choice adopted with four authored options plus *Ei mikään näistä*, no free text; per-choice alignment feedback removed.
> - 0.1 · 17 Sep 2026 — created. Decisions: a reasoning-AI group is required in Paper 1; for now it is built on the same retrieval mechanism as the query group; retrieval of information packages by key word and meaning is required; a live language model is deferred.

---

## 1. Decisions this document implements

1. **Three groups in Paper 1:** no AI · query AI · reasoning AI.
   Working mapping to v3.0 condition ids: `directed` · `assistive` · `substitutive`. *(F3 — confirm the ids are kept or renamed.)*
2. **Reasoning AI is built the same way as query AI for now.** Both are request-driven: the participant asks, the engine returns content. They differ only in **what kind of content** is returned.
3. **No live language model at runtime in this version.** Invariants I1 (determinism) and I6 (retrieval closure) remain in force. An LLM is used **at authoring time** to compile the content the engine serves.
4. The engine must be replaceable later by a live, grounded LLM without changing the UI or the logging (§8).

---

## 2. The idea in one paragraph

Compile first, retrieve later. An LLM, used offline by the author, reads the immutable authored corpus and compiles it into a structured, interlinked set of **information packages** — Karpathy's LLM-wiki pattern: raw sources stay immutable, the compiled layer is the wiki, and a schema file governs it, with *ingest*, *query* and *lint* as the operations. Every package is reviewed by a human, frozen, content-hashed and shipped in the asset bundle. At runtime the browser retrieves packages with a **hybrid search** — exact key words, precomputed vector similarity, and graph links between packages, filtered hard by time and condition — in the local-first, WASM-in-the-browser style Reuven Cohen's RuVector work takes (hybrid sparse + dense retrieval, filtered HNSW search, ONNX embeddings running in the browser). Nothing is generated during a session; everything the participant can receive was written, checked and fixed in advance.

---

## 3. Content layers

| Layer | Directory | Written by | Mutable? | Served to |
|---|---|---|---|---|
| **Raw** — information atoms (`04` §3) | `content/raw/` | Author + domain reviewer | Immutable per scenario version | Query AI (verbatim), no-AI group via radio/browse |
| **Wiki** — information packages | `content/wiki/` | LLM draft → human review | Frozen per scenario version | Query AI (fact packages) and reasoning AI (reasoning packages) |
| **Schema** | `content/SCHEMA.md` | Author | Versioned | The compiling LLM and the linter |
| **Index** | `bundle/index/` | Build script | Generated | Runtime engine |

### 3.1 Package types

| Type | What it contains | Served in |
|---|---|---|
| `fact` | One entity at one time window (a unit, a sector, a water point, a road, the weather): the relevant atoms grouped, **verbatim**, with source and time for each | Query AI |
| `situation` (SA L1) | What is where, now — integrated across sources, with named sources | Reasoning AI |
| `meaning` (SA L2) | What the current state implies — which sector is exposed, which unit cannot reposition, why | Reasoning AI |
| `projection` (SA L3) | What is likely next within the validity horizon, with stated assumptions and certainty | Reasoning AI |

**Query AI returns facts; reasoning AI returns integrated interpretations.** That is the integration boundary the study is about, and it is the only difference between the two engines. Same index, same ranking, same latency distribution, same UI.

### 3.2 Package record

```ts
interface InfoPackage {
  readonly id: string;                        // "pkg.sector.north.c12.projection"
  readonly type: "fact" | "situation" | "meaning" | "projection";
  readonly entityIds: readonly string[];      // units, sectors, places it concerns
  readonly validFromCycle: CycleIndex;        // not retrievable before this cycle
  readonly validUntilCycle: CycleIndex | null;
  readonly availableIn: readonly ConditionId[];
  readonly bodyFi: string;                    // Finnish, reviewed
  readonly certainty: Certainty;              // incl. "unknown"
  readonly citedAtomIds: readonly string[];   // every claim traces to raw atoms
  readonly links: readonly string[];          // other package ids (graph edges)
  readonly retrievalKeys: readonly string[];  // Finnish, incl. inflected forms
  readonly embedding: Int8Array;              // precomputed, quantised
  readonly authoredOmissions: readonly string[]; // atom ids deliberately left out (e.g. load-bearing T4 items)
  readonly reviewedBy: string;                // human reviewer id
  readonly contentHash: string;
}
```

`TruthAnnotation` never appears in a package (invariant I4).

---

## 4. Authoring pipeline (offline, LLM allowed)

1. **Ingest.** The LLM reads `raw/` and `SCHEMA.md` and drafts packages per entity × cycle window and per question type × cycle.
2. **Cite.** Every sentence in a package cites at least one atom. A sentence without a citation fails lint.
3. **Lint.** Automated checks: orphan packages; broken links; claims with no citation; packages retrievable before their source atoms exist (**time leakage**); packages mentioning any atom from a later cycle; contradiction detection.
4. **Protect the designed failures.** Lint must *not* repair what the study depends on:
   - reasoning packages at cycle 18 integrate the two conflicting reports **without flagging the conflict** (`03` §5);
   - the three load-bearing T4 items are listed in `authoredOmissions` and are absent from reasoning packages at their cycles (`02` §3.2);
   - no package describes the cycle-12 omission before it surfaces.
   These are whitelisted lint exceptions, each with a reason.
5. **Review.** The author reviews every package; the domain reviewer reviews Finnish register and plausibility (`11` §2.3).
6. **Freeze.** Packages are content-hashed into the scenario version. Any change after freezing is a scenario version bump (`00` §6).

**Volume estimate:** roughly 150–250 fact packages and 300–500 reasoning packages (20 cycles × 5–8 topics × 3 SA levels). With LLM drafting, review is the dominant cost; budget it alongside the corpus (`03` §10).

---

## 5. Runtime retrieval (browser, no network, deterministic)

```
query text
  → normalise (case-fold, keep Finnish diacritics)
  → HARD FILTER  cycle window ≤ current cycle · condition · tier rules
  → SPARSE       BM25 over retrievalKeys (authored inflected forms; no stemmer — I7)
  → DENSE        cosine over precomputed package embeddings; query embedded locally
  → FUSE         reciprocal-rank fusion of sparse + dense
  → GRAPH        optional one-hop expansion along package links, scored down
  → RANK         fixed-point scores, ties broken by package id
  → return top k package ids  (or an authored "no information" reply)
```

**Query embedding.** A small multilingual sentence-embedding model (e.g. an E5- or MiniLM-class model with Finnish coverage) run in the browser through ONNX in WASM, weights shipped in the asset bundle (I3). Candidate libraries include ONNX Runtime Web, Transformers.js, or a RuVector WASM package. **Every candidate's licence and every model's weight licence must pass I7 before adoption.** This is a check, not an assumption.

**Determinism (I1).** Floating-point inference can differ across CPUs. Three safeguards:
- run inference single-threaded on the WASM CPU backend only;
- quantise similarity scores to fixed precision before ranking, and break ties by id;
- **log the returned package ids for every query** (`07` §2.5), and make replay read results from the log rather than recomputing them. A replay mismatch is reported, not silently corrected.

**Fallback.** If the embedding model fails to load in pre-flight, the session is refused rather than run on sparse retrieval only, because a partial engine would be a different condition.

**Latency.** Retrieval latency is drawn from the same seeded distribution in both AI groups and matched to `directed` reply latency (`02` §1.1).

**No match.** A retrieval miss returns an authored reply ("Tästä ei ole tietoa järjestelmässä — voit kysyä yksiköltä.") and is logged as `retrieval_miss`.

---

## 6. What each group sees

| | No AI (`directed`) | Query AI (`assistive`) | Reasoning AI (`substitutive`) |
|---|---|---|---|
| Radio / browse | yes | yes | yes |
| Free-text query box | no | yes | yes |
| Engine returns | — | `fact` packages (verbatim atoms) | `situation` / `meaning` / `projection` packages |
| Cited sources visible | — | yes | yes, expandable to raw atoms |
| Same index and ranking | — | yes | yes |

The type of question matters for Paper 3: a reasoning-AI query that retrieves a `projection` package is a candidate "delegated projection" event; a query that retrieves `fact` packages or opens cited atoms is a candidate "verification" event. Both are logged with package type.

---

## 7. Conflict to resolve with `02` §1.2

v3.0 requires the integrating condition to be **pushed, not offered**, because an unused capability produces a null that means nothing. Building reasoning AI as request-driven reverses that for now.

Consequences to handle:
- **Engagement floor:** log reasoning-package retrievals per cycle and pre-register a minimum-use threshold (`11` §3.5).
- **Option kept open:** a per-cycle pushed reasoning package can be added later without changing the engine — it is the same package type delivered on a schedule.

---

## 8. Path to a live LLM later

The UI calls one interface:

```ts
interface Responder {
  respond(query: string, ctx: { cycle: CycleIndex; condition: ConditionId }):
    Promise<{ packageIds: readonly string[]; bodyFi: readonly string[]; source: "closed" | "live" }>;
}
```

- `ClosedResponder` — this document.
- `LiveResponder` — later: a grounded LLM restricted to the same frozen wiki, with the full generated text logged.

Adopting `LiveResponder` **breaks I1 and I6** and needs an invariant amendment: replay from logged outputs, generated text treated as data, and a validity argument for why uncontrolled wording is acceptable. It also endangers the designed omission at cycle 18, because a live model may flag the conflict. Do not adopt it for Paper 1 data collection without that review.

---

## 9. Tests

| Test | Asserts |
|---|---|
| `test/engine/closure.spec` | Runtime returns only frozen package or atom text; no string construction |
| `test/engine/time-leak.spec` | No package is retrievable before `validFromCycle`; no package cites a later-cycle atom |
| `test/engine/condition.spec` | Query AI never receives reasoning packages, and vice versa |
| `test/engine/omission.spec` | Load-bearing T4 items absent from reasoning packages at their cycles; cycle-18 packages carry no conflict flag |
| `test/engine/determinism.spec` | Same query, same cycle, same bundle ⇒ same ranked ids across the browser support matrix |
| `test/engine/recall.spec` | Pilot-1 Finnish query corpus meets the declared recall floor for both package types |
| `test/engine/latency.spec` | Query-AI and reasoning-AI latency distributions match each other and `directed` |
| `test/licence/models.spec` | Embedding model weights and runtime libraries pass I7 |

---

## 10. Open items created by this document

- Final condition ids (F3).
- Choice of embedding model and runtime library, after licence check.
- Recall floor and fusion weights (from pilot 1).
- Whether reasoning packages are also pushed per cycle (§7).
- Topic list per cycle for reasoning packages (with the domain reviewer; overlaps the channel vocabulary, `11` §1.3).

---

## Revision 17 Sep 2026 (d) — supersedes earlier amendments where they conflict

### One AI group, pull-only

§1 items 1–2 and §6 are replaced: there is **one AI group**. It receives integrated answers (`situation`, `meaning`, `projection` packages, with cited facts expandable) **only on request**. `fact` packages remain the expandable source layer inside each answer. Nothing is pushed (§7 is closed: no push).

### Intent-framed variant (Paper 2, cell 3)

Every package retrievable in phase B carries an authored `intentLineFi`, served **only** to cell 3:

```ts
interface InfoPackageAdditions {
  readonly intentLineFi?: string;     // phase B only; relevance to the commanded strategy
  readonly intentRelation?: "supports" | "conflicts" | "not_relevant";
}
```

Rules: the line states relevance to the current priority; it never names a unit, sector or action to take; it never refers to the participant's own choices; it is identical in wording across participants.

### Rule from review P3 — adopted

Every `situation`, `meaning` and `projection` package is written from **the same model state as that cycle's envelope, including its error**, never from truth. Lint rejects any package that describes a breach mechanism before it surfaces, or whose projection text is inconsistent with the envelope polygon. The load-bearing T4 items and the cycle-18 conflict flag stay absent as specified in §4.

### Package wording (review P2)

**Decided: fixed template.** Every integrated answer has the same four parts, in this order: **Tilanne** (state, one sentence) · **Varmuus** (certainty: varma / todennäköinen / epävarma / ei tiedossa) · **Lähteet** (named sources with report times) · **Merkitys** (implication, one sentence). Cell 3 adds the intent line as a fifth, final line. Lint enforces the parts, their order and a maximum length per part.

### Tests added

- `test/engine/intent-line.spec` — `intentLineFi` is returned only for cell-3 participants and only in phase B.
- `test/engine/no-push.spec` — the engine emits nothing without a query.
- `test/engine/envelope-consistency.spec` — projection packages agree with the cycle's envelope.

---

## Revision 17 Sep 2026 (e) — supersedes revision (d) where they conflict

- **Two engines on one index again.** LLM (`assistive`) returns `fact` packages; LLM reasoning (`substitutive`) returns template answers built on `situation` / `meaning` / `projection` packages, with cited facts expandable. Same ranking, same latency distribution. Both pull-only.
- `intentLineFi` is served only to LLM-reasoning participants in the intent-line cell, in phase B.
- `test/engine/condition.spec` is reinstated: LLM never receives integrated answers, LLM reasoning never receives bare fact lists as its top-level answer.

---

## Revision 17 Sep 2026 (f) — supersedes revisions (d) and (e) where they conflict

- **One engine in use:** LLM reasoning returns template answers (Tilanne · Varmuus · Lähteet · Merkitys), with the cited facts expandable underneath. `fact` packages remain as that expandable layer and are never a top-level answer.
- `intentLineFi` is served only to cell 3, phase B.
- `test/engine/condition.spec` asserts only that `directed` has no engine access.
