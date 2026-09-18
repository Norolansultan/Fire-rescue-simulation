import { useState } from "preact/hooks";
import { useSession } from "../useSession.js";
import { StatusStrip } from "./StatusStrip.js";
import { MapView } from "./MapView.js";
import { ReportRail } from "./ReportRail.js";
import { JudgementPanel } from "./JudgementPanel.js";
import { HakuDrawer, AiDrawer, RadioDrawer } from "./Drawers.js";
import { CAPABILITY_MATRIX } from "../../../routing/capability-matrix.js";
import { LANDMARKS } from "../../../scenario/demo-scenario.js";
import type { ScenarioContract } from "../../../scenario/types.js";
import type { LatLon, Polygon } from "../../../engine/primitives.js";

const EXTENT = boundingBox(Object.values(LANDMARKS), 1500);

function boundingBox(points: readonly LatLon[], padM: number) {
  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const padLat = padM / 111_320;
  const padLon = padM / (111_320 * Math.cos((points[0]!.lat * Math.PI) / 180));
  return {
    south: Math.min(...lats) - padLat,
    north: Math.max(...lats) + padLat,
    west: Math.min(...lons) - padLon,
    east: Math.max(...lons) + padLon,
  };
}

/** A fixed-size octagon around a click point — the "draw" tool's simplified stand-in, see JudgementPanel's follow_up_draw hint. */
function octagonAround(center: LatLon, radiusM: number): Polygon {
  const points = 8;
  const ring: LatLon[] = [];
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const dNorth = Math.cos(angle) * radiusM;
    const dEast = Math.sin(angle) * radiusM;
    const dLat = dNorth / 111_320;
    const dLon = dEast / (111_320 * Math.cos((center.lat * Math.PI) / 180));
    ring.push({ lat: center.lat + dLat, lon: center.lon + dLon });
  }
  ring.push(ring[0]!);
  return [ring];
}

type DrawerId = "haku" | "ai" | "radio" | null;

export function SessionView({ scenario, condition }: { readonly scenario: ScenarioContract; readonly condition: "directed" | "substitutive" }) {
  const { snapshot, orchestrator } = useSession(scenario, condition);
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [picking, setPicking] = useState<"breach" | "draw" | null>(null);

  if (!snapshot || !orchestrator) {
    return <div style={{ padding: 24 }}>Ladataan istuntoa…</div>;
  }

  const capabilities = CAPABILITY_MATRIX[condition];

  function handleMapClick(point: LatLon) {
    if (picking === "breach") {
      void orchestrator!.markBreachPoint(point);
    } else if (picking === "draw") {
      void orchestrator!.submitCorrection(octagonAround(point, 300));
    }
    setPicking(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <StatusStrip snapshot={snapshot} />
      <div style={{ display: "flex", flex: 1, minHeight: 0, position: "relative" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <MapView snapshot={snapshot} extent={EXTENT} pickingBreachPoint={picking !== null} onMapClick={handleMapClick} />
          <div style={{ display: "flex", gap: 8, padding: "8px 12px", background: "#1b1e22", borderTop: "1px solid #33383e", flexShrink: 0 }}>
            <button style={toolButton} onClick={() => setDrawer("haku")}>Haku</button>
            {capabilities.aiDrawerPresent && (
              <button style={toolButton} onClick={() => setDrawer("ai")}>Avaa tekoäly</button>
            )}
            <button style={toolButton} onClick={() => setDrawer("radio")}>Radio</button>
          </div>
          <JudgementPanel
            snapshot={snapshot}
            orchestrator={orchestrator}
            onRequestBreachPick={() => setPicking("breach")}
            onRequestDrawPick={() => setPicking("draw")}
          />
        </div>
        <ReportRail snapshot={snapshot} />
        {drawer === "haku" && <HakuDrawer orchestrator={orchestrator} onClose={() => setDrawer(null)} />}
        {drawer === "ai" && <AiDrawer orchestrator={orchestrator} onClose={() => setDrawer(null)} />}
        {drawer === "radio" && <RadioDrawer orchestrator={orchestrator} onClose={() => setDrawer(null)} />}
      </div>
    </div>
  );
}

const toolButton = {
  padding: "6px 14px", borderRadius: 6, border: "1px solid #3a3f44", background: "#2a2f34",
  color: "#e8eaed", cursor: "pointer", fontSize: 13,
};
