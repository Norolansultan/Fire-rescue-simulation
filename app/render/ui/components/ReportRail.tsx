import type { RenderableAtom } from "../../../boundary/render-boundary.js";
import type { Certainty, RecordPayload } from "../../../scenario/types.js";
import type { SessionSnapshot } from "../../../session/orchestrator.js";

function certaintyLabel(certainty: Certainty): string {
  switch (certainty.kind) {
    case "confirmed":
      return "vahvistettu";
    case "probable":
      return `todennäköinen (${certainty.basis})`;
    case "uncertain":
      return `epävarma (${certainty.basis})`;
    case "unknown":
      return "ei tiedossa";
  }
}

/** A short one-line summary per record kind, for the incoming-bubble rail. Display-only — no field named here is truth. */
function summarise(record: RecordPayload): string {
  switch (record.kind) {
    case "task_record":
      return `${record.taskType}: ${record.callerAccount}`;
    case "situation_log":
      return record.text;
    case "unit_status":
      return `${record.unitId}: ${record.status}`;
    case "traffic_log":
      return record.content ?? `(vain ääni, ${record.durationSeconds} s)`;
    case "lateral_traffic":
      return `${record.speakerUnitId} -> ${record.addresseeUnitId}: ${record.content}`;
    case "aerial_observation":
      return `${record.platform} ${record.platformId}: ${record.text}`;
    case "reference":
      return `${record.surface} / ${record.featureId}`;
    case "weather":
      return `tuuli ${record.windMeanMs.toFixed(1)} m/s, ${record.temperatureC.toFixed(0)} °C`;
    case "radio_traffic":
      return record.transcriptFi ?? `(${record.talkGroup}, ei litterointia)`;
  }
}

function BubbleCard({ atom }: { readonly atom: RenderableAtom }) {
  return (
    <div
      style={{
        padding: "8px 10px", borderRadius: 6, background: "#262b31", border: "1px solid #33383e",
        fontSize: 12.5, lineHeight: 1.4,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", opacity: 0.6, marginBottom: 4 }}>
        <span>{atom.provenance.sourceId}</span>
        <span>{certaintyLabel(atom.provenance.certainty)}</span>
      </div>
      <div>{summarise(atom.record)}</div>
      {atom.degradationVisible.length > 0 && (
        <div style={{ marginTop: 4, opacity: 0.5, fontSize: 11 }}>{atom.degradationVisible.join(", ")}</div>
      )}
    </div>
  );
}

export function ReportRail({ snapshot }: { readonly snapshot: SessionSnapshot }) {
  return (
    <div
      style={{
        width: 300, flexShrink: 0, borderLeft: "1px solid #33383e", background: "#1b1e22",
        display: "flex", flexDirection: "column", minHeight: 0,
      }}
    >
      <div style={{ padding: "10px 12px", fontSize: 12, fontWeight: 600, opacity: 0.7, borderBottom: "1px solid #33383e" }}>
        SAAPUVAT ({snapshot.renderTree.bubbles.length})
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        {snapshot.renderTree.bubbles.length === 0 && <div style={{ opacity: 0.4, fontSize: 12.5 }}>Ei uusia raportteja tällä jaksolla.</div>}
        {snapshot.renderTree.bubbles.map((atom) => (
          <BubbleCard key={atom.id} atom={atom} />
        ))}
      </div>
    </div>
  );
}
