/**
 * The scenario contract constructor — SPEC/04_Data_Model.md §2:
 *
 * "A scenario cannot be constructed unless it declares what it probes and
 * what counts as correct. Construction throws on every violation listed
 * below; there is no partially-valid scenario."
 *
 * This is the single choke point: every one of the fifteen checks below is
 * a semantic/cardinality invariant TypeScript's structural typing cannot
 * express on its own (exact array lengths, "exactly one", cross-field
 * requirements like "load-bearing implies three routes"). It accepts an
 * already TS-shaped candidate — narrower schema validation of untyped JSON
 * from the asset bundle is a separate, later concern (`tools/bundle/`) and
 * is not one of the fifteen named cases here.
 */

import type { ScenarioContract } from "./types.js";

export type ContractViolationReason =
  | "empty-id"
  | "empty-constructs"
  | "zero-invariants"
  | "invalid-invariant"
  | "contradiction-count"
  | "omission-count"
  | "invalid-validity-claim"
  | "missing-probe-schedule"
  | "missing-extent"
  | "wrong-cycle-count"
  | "wrong-envelope-count"
  | "wrong-channel-set-count"
  | "insufficient-branches"
  | "t1-missing-delivery-time"
  | "load-bearing-insufficient-routes";

export class ScenarioConstructionError extends Error {
  constructor(
    readonly reason: ContractViolationReason,
    message: string,
  ) {
    super(message);
    this.name = "ScenarioConstructionError";
  }
}

function fail(reason: ContractViolationReason, message: string): never {
  throw new ScenarioConstructionError(reason, message);
}

function isValidityClaimComplete(validity: ScenarioContract["validity"] | null | undefined): boolean {
  if (!validity) return false;
  return (
    validity.authoredBy.trim().length > 0 &&
    validity.represents.length > 0 &&
    validity.doesNotRepresent.length > 0 &&
    validity.reviewedBy.length > 0 &&
    validity.sourceBasis.length > 0 &&
    validity.knownDivergences.length > 0
  );
}

function isFiniteExtent(extent: ScenarioContract["extent"] | null | undefined): boolean {
  if (!extent) return false;
  return (
    Number.isFinite(extent.south) &&
    Number.isFinite(extent.north) &&
    Number.isFinite(extent.west) &&
    Number.isFinite(extent.east) &&
    typeof extent.crs === "number"
  );
}

/**
 * Validates and returns `input` as a {@link ScenarioContract}, or throws a
 * {@link ScenarioConstructionError} on the first violation found. Checks
 * run in the order SPEC/04 §2 lists them, so error messages are
 * predictable; nothing here mutates `input`.
 */
export function createScenarioContract(input: ScenarioContract): ScenarioContract {
  if (!input.id || input.id.trim().length === 0) {
    fail("empty-id", "ScenarioContract.id must not be empty");
  }

  if (!input.constructs || input.constructs.length === 0) {
    fail("empty-constructs", "ScenarioContract.constructs must not be empty — the scenario must declare what it probes");
  }

  if (!input.invariants || input.invariants.length === 0) {
    fail("zero-invariants", "ScenarioContract.invariants must not be empty — there is no answer key");
  }
  for (const invariant of input.invariants) {
    const expectedIsNonFiniteNumber = typeof invariant.expected === "number" && !Number.isFinite(invariant.expected);
    if (expectedIsNonFiniteNumber || invariant.tolerance < 0) {
      fail(
        "invalid-invariant",
        `Invariant "${invariant.name}" has a non-finite expected value or negative tolerance (tolerance=${invariant.tolerance})`,
      );
    }
  }

  if (!input.contradiction) {
    fail("contradiction-count", "ScenarioContract requires exactly one contradiction marker; found none");
  }

  if (!input.omission) {
    fail("omission-count", "ScenarioContract requires exactly one omission marker; found none");
  }

  if (!isValidityClaimComplete(input.validity)) {
    fail("invalid-validity-claim", "ScenarioContract.validity is missing or incomplete — every field must be populated");
  }

  if (!input.probeSchedule || !Array.isArray(input.probeSchedule.probes)) {
    fail("missing-probe-schedule", "ScenarioContract.probeSchedule is missing");
  }

  if (!isFiniteExtent(input.extent)) {
    fail("missing-extent", "ScenarioContract.extent is missing or incomplete");
  }

  if (!Array.isArray(input.cycles) || input.cycles.length !== 20) {
    fail("wrong-cycle-count", `ScenarioContract.cycles must have length 20, got ${input.cycles?.length ?? 0}`);
  }

  if (!Array.isArray(input.envelopes) || input.envelopes.length !== 20) {
    fail("wrong-envelope-count", `ScenarioContract.envelopes must have length 20, got ${input.envelopes?.length ?? 0}`);
  }

  if (!Array.isArray(input.channelSets) || input.channelSets.length !== 20) {
    fail("wrong-channel-set-count", `ScenarioContract.channelSets must have length 20, got ${input.channelSets?.length ?? 0}`);
  }

  if (!Array.isArray(input.branches) || input.branches.length < 5) {
    fail("insufficient-branches", `ScenarioContract.branches must have at least 5 entries, got ${input.branches?.length ?? 0}`);
  }

  for (const atom of input.atoms ?? []) {
    if (atom.tier === "T1_pushed" && atom.provenance.deliveredAt === null) {
      fail("t1-missing-delivery-time", `Atom "${atom.id}" is tier T1_pushed but has no delivery time (provenance.deliveredAt is null)`);
    }
    if (atom.loadBearing) {
      const routeCount = [atom.routes.directed, atom.routes.assistive, atom.routes.substitutive].filter((r) => r !== null).length;
      if (routeCount < 3) {
        fail(
          "load-bearing-insufficient-routes",
          `Load-bearing atom "${atom.id}" has ${routeCount} route(s), needs all three (directed, assistive, substitutive)`,
        );
      }
    }
  }

  return input;
}
