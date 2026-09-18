import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import type { RenderableAtom } from "../../../boundary/render-boundary.js";
import type { SessionOrchestrator } from "../../../session/orchestrator.js";

const UNIT_IDS = ["EK11", "EK12", "EK14", "KY21", "VPK"] as const;

function ResultList({ results }: { readonly results: readonly RenderableAtom[] }) {
  if (results.length === 0) return <p style={{ opacity: 0.5, fontSize: 12.5 }}>Ei osumia.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
      {results.map((atom) => (
        <div key={atom.id} style={{ padding: 8, borderRadius: 6, background: "#1b1e22", border: "1px solid #33383e", fontSize: 12.5 }}>
          <div style={{ opacity: 0.6, marginBottom: 2 }}>{atom.provenance.sourceId} · {atom.record.kind}</div>
          <div>{"text" in atom.record ? atom.record.text : "content" in atom.record ? atom.record.content : atom.id}</div>
        </div>
      ))}
    </div>
  );
}

function DrawerShell({ title, onClose, children }: { readonly title: string; readonly onClose: () => void; readonly children: ComponentChildren }) {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 300, bottom: 0, background: "#0008", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 40, zIndex: 10 }}>
      <div style={{ width: 420, background: "#20242a", border: "1px solid #33383e", borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <strong>{title}</strong>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#e8eaed", cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: 8, borderRadius: 6, border: "1px solid #3a3f44", background: "#1b1e22", color: "#e8eaed", marginBottom: 10, boxSizing: "border-box" as const };
const buttonStyle = { padding: "6px 12px", borderRadius: 6, border: "1px solid #3a3f44", background: "#2a2f34", color: "#e8eaed", cursor: "pointer", fontSize: 13 };

export function HakuDrawer({ orchestrator, onClose }: { readonly orchestrator: SessionOrchestrator; readonly onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly RenderableAtom[]>([]);
  return (
    <DrawerShell title="Haku" onClose={onClose}>
      <input style={inputStyle} placeholder="Hakusana…" value={query} onInput={(e) => setQuery((e.target as HTMLInputElement).value)} />
      <button style={{ ...buttonStyle, marginBottom: 10 }} onClick={() => setResults(orchestrator.searchAtoms(query))}>Hae</button>
      <ResultList results={results} />
    </DrawerShell>
  );
}

/**
 * "AI" drawer — substitutive condition only. Deliberately not generative
 * (I6): it runs the same closed retrieval as Haku, framed as an
 * assistant, and returns only atoms already in the corpus, never
 * synthesised prose. The embedding-based hybrid ranking SPEC/14 §5
 * specifies is not built (SPEC/11 §7.1, open); this baseline stands in
 * for it so the drawer is clickable end to end.
 */
export function AiDrawer({ orchestrator, onClose }: { readonly orchestrator: SessionOrchestrator; readonly onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<readonly RenderableAtom[]>([]);
  const [asked, setAsked] = useState(false);
  return (
    <DrawerShell title="Avaa tekoäly" onClose={onClose}>
      <p style={{ fontSize: 11.5, opacity: 0.6, marginTop: 0 }}>
        Palauttaa vain arkiston olemassa olevia merkintöjä — ei tuota uutta tekstiä.
      </p>
      <input style={inputStyle} placeholder="Kysy jotain…" value={query} onInput={(e) => setQuery((e.target as HTMLInputElement).value)} />
      <button style={{ ...buttonStyle, marginBottom: 10 }} onClick={() => { setResults(orchestrator.searchAtoms(query)); setAsked(true); }}>Kysy</button>
      {asked && <ResultList results={results} />}
    </DrawerShell>
  );
}

export function RadioDrawer({ orchestrator, onClose }: { readonly orchestrator: SessionOrchestrator; readonly onClose: () => void }) {
  const [unit, setUnit] = useState<(typeof UNIT_IDS)[number] | null>(null);
  const [results, setResults] = useState<readonly RenderableAtom[]>([]);
  return (
    <DrawerShell title="Radio" onClose={onClose}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {UNIT_IDS.map((u) => (
          <button key={u} style={{ ...buttonStyle, background: unit === u ? "#3a3f44" : buttonStyle.background }} onClick={() => { setUnit(u); setResults(orchestrator.askUnit(u)); }}>
            {u}
          </button>
        ))}
      </div>
      {unit && <ResultList results={results} />}
    </DrawerShell>
  );
}
