import { useState } from "preact/hooks";
import { buildDemoScenario } from "../../scenario/demo-scenario.js";
import { SessionView } from "./components/SessionView.js";
import type { ConditionId } from "../../scenario/types.js";

type PreviewCondition = Extract<ConditionId, "directed" | "substitutive">;

let cachedScenario: ReturnType<typeof buildDemoScenario> | null = null;
function getDemoScenario() {
  if (!cachedScenario) cachedScenario = buildDemoScenario();
  return cachedScenario;
}

export function App() {
  const [condition, setCondition] = useState<PreviewCondition | null>(null);

  if (!condition) {
    return (
      <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24 }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontWeight: 600 }}>Maastopalo — työkulun esikatselu</h1>
          <p style={{ opacity: 0.7, maxWidth: 480 }}>
            Synteettinen esimerkkiskenaario (ei aitoa, ei tarkistettua sisältöä). Valitse ehto aloittaaksesi.
          </p>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <button style={buttonStyle} onClick={() => setCondition("directed")}>
            Radio (directed)
          </button>
          <button style={buttonStyle} onClick={() => setCondition("substitutive")}>
            LLM reasoning (substitutive)
          </button>
        </div>
      </div>
    );
  }

  return <SessionView scenario={getDemoScenario()} condition={condition} />;
}

const buttonStyle = {
  padding: "14px 28px",
  fontSize: 16,
  borderRadius: 8,
  border: "1px solid #3a3f44",
  background: "#2a2f34",
  color: "#e8eaed",
  cursor: "pointer",
};
