/**
 * Retrieval closure — invariant I6 (SPEC/00_README.md §3): "The query
 * subsystem can only return authored corpus content. It is structurally
 * incapable of generating text. There is no language model in the
 * instrument." SPEC/05 §7: "The retrieval function's return type is
 * `readonly InfoAtom[]`, drawn from the loaded corpus. There is no code
 * path that constructs a novel string from atom content."
 *
 * `RetrievalFunction`'s return type is the static half of the guard — it
 * cannot return `string`, only `readonly InfoAtom[]`, so a caller
 * literally cannot receive generated prose from it. `assertClosedOverCorpus`
 * is the runtime half: every returned atom must be the *same object
 * reference* as one already in the corpus array, never a copy or a
 * synthesised object that merely looks like one.
 *
 * `retrieveClosed` is a closed, deterministic *baseline* — sparse
 * token-overlap ranking over `retrievalKeys`, ties broken by atom id
 * (I1). It is not the hybrid sparse+dense engine SPEC/14 §5 specifies
 * (BM25 fused with embedding similarity); that needs an embedding model
 * choice SPEC/11 §7.1 lists as still open. What's here is real and
 * closed, and satisfies I6 regardless of what ranking algorithm
 * eventually replaces it — closure is a property of the *type*, not the
 * ranking quality.
 */

import { compareStrings } from "../engine/deterministic-object.js";
import type { InfoAtom } from "../scenario/types.js";

export type RetrievalFunction = (query: string, corpus: readonly InfoAtom[]) => readonly InfoAtom[];

export class RetrievalClosureViolationError extends Error {
  constructor(readonly offendingAtomId: string) {
    super(`Retrieval result contains an atom not present by reference in the corpus (id "${offendingAtomId}") — closure violated (I6)`);
    this.name = "RetrievalClosureViolationError";
  }
}

/** Throws if any result is not the same object reference as one already in `corpus`. */
export function assertClosedOverCorpus(results: readonly InfoAtom[], corpus: readonly InfoAtom[]): void {
  const corpusByReference = new Set(corpus);
  for (const atom of results) {
    if (!corpusByReference.has(atom)) {
      throw new RetrievalClosureViolationError(atom.id);
    }
  }
}

function normaliseToken(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
}

function tokenise(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normaliseToken)
    .filter((t) => t.length > 0);
}

function overlapScore(queryTokens: ReadonlySet<string>, retrievalKeys: readonly string[]): number {
  const keyTokens = new Set(retrievalKeys.flatMap(tokenise));
  let score = 0;
  for (const t of keyTokens) if (queryTokens.has(t)) score += 1;
  return score;
}

/**
 * Ranks `corpus` by token overlap between `query` and each atom's
 * `retrievalKeys`. Returns references into `corpus`, unmodified — never
 * a clone, never a synthesised object. Deterministic: ties broken by
 * atom id (I1, "iteration order is sorted, never insertion order").
 */
export const retrieveClosed: RetrievalFunction = (query, corpus) => {
  const queryTokens = new Set(tokenise(query));
  return corpus
    .map((atom) => ({ atom, score: overlapScore(queryTokens, atom.retrievalKeys) }))
    .filter((s) => s.score > 0)
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : compareStrings(a.atom.id, b.atom.id)))
    .map((s) => s.atom);
};
