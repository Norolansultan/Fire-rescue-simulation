import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import type { SessionOrchestrator, SessionSnapshot } from "../../../session/orchestrator.js";
import type { ContainmentJudgement } from "../../../scenario/types.js";

const JUDGEMENT_LABEL: Record<ContainmentJudgement, string> = {
  holds: "Ennuste pitää paikkansa",
  partly_wrong: "Ennuste on osittain väärä",
  fundamentally_wrong: "Ennuste on perustavanlaatuisesti väärä",
};

/**
 * The primary judgement loop's control surface (M8-9 of the milestone
 * plan). Owns only UI state (the confidence slider's in-flight value);
 * everything that persists lives in the orchestrator. Follows the step
 * order from `HANDOFF_Projection_Judgement_Loop.md`: working -> reveal ->
 * judge -> confidence -> follow-up -> verification -> allocation.
 */
export function JudgementPanel({
  snapshot,
  orchestrator,
  onRequestBreachPick,
  onRequestDrawPick,
}: {
  readonly snapshot: SessionSnapshot;
  readonly orchestrator: SessionOrchestrator;
  readonly onRequestBreachPick: () => void;
  readonly onRequestDrawPick: () => void;
}) {
  const [confidenceDraft, setConfidenceDraft] = useState(50);
  const [rationale, setRationale] = useState("");

  switch (snapshot.step) {
    case "working":
      return (
        <Panel>
          <p style={hint}>Jakson työskentelyjakso. Tutustu saapuneisiin raportteihin, sitten näytä koneen ennuste.</p>
          <PrimaryButton onClick={() => void orchestrator.revealEnvelope()}>Näytä ennuste</PrimaryButton>
        </Panel>
      );

    case "judging":
      return (
        <Panel>
          <p style={hint}>Pitääkö näytetty leviämisennuste paikkansa?</p>
          <div style={{ display: "flex", gap: 8 }}>
            {(["holds", "partly_wrong", "fundamentally_wrong"] as const).map((j) => (
              <PrimaryButton key={j} onClick={() => void orchestrator.submitJudgement(j)}>
                {JUDGEMENT_LABEL[j]}
              </PrimaryButton>
            ))}
          </div>
        </Panel>
      );

    case "confidence":
      return (
        <Panel>
          <p style={hint}>Arvioi varmuutesi ({JUDGEMENT_LABEL[snapshot.judgement!]}).</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              type="range" min={0} max={100} value={confidenceDraft}
              onInput={(e) => setConfidenceDraft(Number((e.target as HTMLInputElement).value))}
              style={{ flex: 1 }}
            />
            <span style={{ width: 32, textAlign: "right" }}>{confidenceDraft}</span>
            <PrimaryButton onClick={() => void orchestrator.submitConfidence(confidenceDraft)}>Vahvista</PrimaryButton>
          </div>
        </Panel>
      );

    case "follow_up_breach_point":
      return (
        <Panel>
          <p style={hint}>Napauta kartalta kohta, jossa ennuste pettää.</p>
          <PrimaryButton onClick={onRequestBreachPick}>Merkitse kartalle</PrimaryButton>
        </Panel>
      );

    case "follow_up_draw":
      return (
        <Panel>
          <p style={hint}>
            Napauta kartalta korjatun alueen keskikohta. (Yksinkertaistettu piirtotyökalu: napautus luo kiinteän
            kokoisen korjatun alueen kyseisen pisteen ympärille.)
          </p>
          <PrimaryButton onClick={onRequestDrawPick}>Piirrä kartalle</PrimaryButton>
        </Panel>
      );

    case "follow_up_branch":
      return (
        <Panel>
          <p style={hint}>Mikä seuraavista kuvaa tilannetta parhaiten?</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {snapshot.branchList.map((b) => (
              <SecondaryButton key={b.branchId} onClick={() => void orchestrator.selectBranch(b.branchId)}>
                {b.statementFi}
              </SecondaryButton>
            ))}
            <SecondaryButton onClick={() => void orchestrator.selectBranch("none_of_these")}>Ei mikään näistä</SecondaryButton>
          </div>
        </Panel>
      );

    case "verification":
      return (
        <Panel>
          <p style={hint}>
            Arviosi: {JUDGEMENT_LABEL[snapshot.judgement!]}, varmuus {snapshot.confidence}.{" "}
            {snapshot.selectedBranchId ? `Valittu selitys: ${snapshot.selectedBranchId}.` : ""}
          </p>
          <PrimaryButton onClick={() => orchestrator.proceedToAllocation()}>Jatka kohdentamiseen</PrimaryButton>
        </Panel>
      );

    case "allocation":
      return (
        <Panel>
          <p style={hint}>Kohdenna resurssit tarvittaessa ja perustele lyhyesti. (Esikatselussa: yksinkertaistettu, ei yksikkökohtaista kohdennusta.)</p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={rationale} onInput={(e) => setRationale((e.target as HTMLInputElement).value)}
              placeholder="Perustelu…" style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #3a3f44", background: "#1b1e22", color: "#e8eaed" }}
            />
            <PrimaryButton onClick={() => void orchestrator.submitAllocation([], rationale)}>Vahvista jakso</PrimaryButton>
          </div>
        </Panel>
      );

    case "hinge_pause":
      return (
        <Panel>
          <p style={hint}>Puoliväli — 10/20 jaksoa suoritettu. Lyhyt tauko.</p>
          <PrimaryButton onClick={() => void orchestrator.dismissHinge()}>Jatka</PrimaryButton>
        </Panel>
      );

    case "complete":
      return (
        <Panel>
          <p style={hint}>Istunto valmis — kaikki 20 jaksoa suoritettu.</p>
        </Panel>
      );
  }
}

function Panel({ children }: { readonly children: ComponentChildren }) {
  return (
    <div style={{ padding: "12px 16px", borderTop: "1px solid #33383e", background: "#20242a", flexShrink: 0 }}>
      {children}
    </div>
  );
}

const hint = { margin: "0 0 8px 0", fontSize: 13, opacity: 0.8 };

function PrimaryButton({ children, onClick }: { readonly children: ComponentChildren; readonly onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #3a3f44", background: "#2a2f34", color: "#e8eaed", cursor: "pointer", fontSize: 13 }}>
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { readonly children: ComponentChildren; readonly onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #33383e", background: "#1b1e22", color: "#e8eaed", cursor: "pointer", fontSize: 13, textAlign: "left" }}>
      {children}
    </button>
  );
}
