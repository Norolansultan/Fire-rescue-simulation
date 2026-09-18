import { useEffect, useRef } from "preact/hooks";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, MapMouseEvent, GeoJSONSource } from "maplibre-gl";
import type { SessionSnapshot } from "../../../session/orchestrator.js";
import type { LatLon, Polygon } from "../../../engine/primitives.js";

// Hue roles from app/render/visual-encoding.ts, given real colour values here
// (that module deliberately stops at naming the roles — colour tokens are a
// design decision, not a determinism/correctness one).
const HUE = {
  own_formation: "#4fb3ff", // cyan-blue
  reported_perimeter: "#e2711d", // deep orange
  projection_envelope: "#d6336c", // magenta-red
  participant_correction: "#8bc34a", // yellow-green
  value_at_risk: "#c9c9c9",
};

function toGeoJSONPolygon(polygon: Polygon) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: polygon.map((ring) => ring.map((p) => [p.lon, p.lat])) },
  };
}

function toGeoJSONPoint(p: LatLon) {
  return { type: "Feature" as const, properties: {}, geometry: { type: "Point" as const, coordinates: [p.lon, p.lat] } };
}

const EMPTY_FC = { type: "FeatureCollection" as const, features: [] as ReturnType<typeof toGeoJSONPolygon>[] };

export interface MapViewProps {
  readonly snapshot: SessionSnapshot;
  readonly extent: { readonly south: number; readonly north: number; readonly west: number; readonly east: number };
  readonly pickingBreachPoint: boolean;
  readonly onMapClick: (point: LatLon) => void;
}

export function MapView({ snapshot, extent, pickingBreachPoint, onMapClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const pickingRef = useRef(pickingBreachPoint);
  pickingRef.current = pickingBreachPoint;

  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      // Public demo style — visual preview only, see app/render/ui/README.md.
      style: "https://demotiles.maplibre.org/style.json",
      bounds: [
        [extent.west, extent.south],
        [extent.east, extent.north],
      ],
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("click", (e: MapMouseEvent) => {
      if (pickingRef.current) onMapClickRef.current({ lat: e.lngLat.lat, lon: e.lngLat.lng });
    });

    map.on("load", () => {
      map.addSource("perimeter", { type: "geojson", data: EMPTY_FC });
      map.addSource("envelope", { type: "geojson", data: EMPTY_FC });
      map.addSource("correction", { type: "geojson", data: EMPTY_FC });
      map.addSource("units", { type: "geojson", data: EMPTY_FC });
      map.addSource("breach-point", { type: "geojson", data: EMPTY_FC });

      map.addLayer({ id: "perimeter-fill", type: "fill", source: "perimeter", paint: { "fill-color": HUE.reported_perimeter, "fill-opacity": 0.18 } });
      map.addLayer({ id: "perimeter-line", type: "line", source: "perimeter", paint: { "line-color": HUE.reported_perimeter, "line-width": 2 } });

      map.addLayer({ id: "envelope-fill", type: "fill", source: "envelope", paint: { "fill-color": HUE.projection_envelope, "fill-opacity": 0.12 } });
      map.addLayer({ id: "envelope-line", type: "line", source: "envelope", paint: { "line-color": HUE.projection_envelope, "line-width": 2 } });

      map.addLayer({ id: "correction-fill", type: "fill", source: "correction", paint: { "fill-color": HUE.participant_correction, "fill-opacity": 0.15 } });
      map.addLayer({ id: "correction-line", type: "line", source: "correction", paint: { "line-color": HUE.participant_correction, "line-width": 3, "line-dasharray": [2, 1] } });

      map.addLayer({ id: "units-circle", type: "circle", source: "units", paint: { "circle-color": HUE.own_formation, "circle-radius": 6, "circle-stroke-color": "#fff", "circle-stroke-width": 1 } });
      map.addLayer({ id: "breach-point-circle", type: "circle", source: "breach-point", paint: { "circle-color": "#ffcc00", "circle-radius": 7, "circle-stroke-color": "#000", "circle-stroke-width": 1 } });

      updateLayers(map, snapshotRef.current);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !map.getSource("perimeter")) return;
    updateLayers(map, snapshot);
  }, [snapshot]);

  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {pickingBreachPoint && (
        <div style={{ position: "absolute", top: 8, left: 8, background: "#000a", padding: "6px 12px", borderRadius: 6, fontSize: 13 }}>
          Napauta karttaa siinä kohdassa, missä ennuste pettää.
        </div>
      )}
    </div>
  );
}

function updateLayers(map: MapLibreMap, snapshot: SessionSnapshot) {
  const perimeter = snapshot.renderTree.cycleInfo?.perimeter;
  (map.getSource("perimeter") as GeoJSONSource)?.setData(
    perimeter ? { type: "FeatureCollection", features: [toGeoJSONPolygon(perimeter)] } : EMPTY_FC,
  );

  const envelope = snapshot.currentEnvelope;
  (map.getSource("envelope") as GeoJSONSource)?.setData(
    envelope ? { type: "FeatureCollection", features: [toGeoJSONPolygon(envelope.polygon)] } : EMPTY_FC,
  );

  const corrected = snapshot.correctedPolygon;
  (map.getSource("correction") as GeoJSONSource)?.setData(
    corrected ? { type: "FeatureCollection", features: [toGeoJSONPolygon(corrected)] } : EMPTY_FC,
  );

  const units = snapshot.renderTree.cycleInfo?.unitPositions;
  (map.getSource("units") as GeoJSONSource)?.setData(
    units ? { type: "FeatureCollection", features: Object.values(units).map(toGeoJSONPoint) } : EMPTY_FC,
  );

  const breachPoint = snapshot.breachPoint;
  (map.getSource("breach-point") as GeoJSONSource)?.setData(
    breachPoint ? { type: "FeatureCollection", features: [toGeoJSONPoint(breachPoint)] } : EMPTY_FC,
  );
}
