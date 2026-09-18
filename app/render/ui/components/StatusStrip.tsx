import type { SessionSnapshot } from "../../../session/orchestrator.js";

const UNIT_IDS = ["EK11", "EK12", "EK14", "KY21", "VPK"] as const;

export function StatusStrip({ snapshot }: { readonly snapshot: SessionSnapshot }) {
  const unreadCount = snapshot.renderTree.bubbles.length;
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 20, padding: "8px 16px",
        background: "#20242a", borderBottom: "1px solid #33383e", fontSize: 13, fontFamily: "monospace",
        flexShrink: 0,
      }}
    >
      <span>klo {snapshot.clockLabel}</span>
      <span style={{ opacity: 0.6 }}>·</span>
      <span>
        jakso {snapshot.currentCycle}/20 (vaihe {snapshot.phase})
      </span>
      <span style={{ opacity: 0.6 }}>·</span>
      <span style={{ display: "flex", gap: 10 }}>
        {UNIT_IDS.map((u) => (
          <span key={u} title={`${u}: kohteessa`}>
            {u} <Dot />
          </span>
        ))}
      </span>
      <span style={{ opacity: 0.6 }}>·</span>
      <span>{unreadCount} uutta</span>
      <span style={{ marginLeft: "auto", opacity: 0.5 }}>
        ehto: {snapshot.conditionLabel} · lokitietueita: {snapshot.logRecordCount}
      </span>
    </div>
  );
}

function Dot() {
  return <span style={{ color: "#5ec26a" }}>●</span>;
}
