import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

// Dev/preview build only — SPEC/05 §8 requires the real instrument's asset
// bundle (tiles, fonts, scenario content) to be resolved offline before a
// session starts (invariant I3: "no network during a run"). This config
// has no such bundle to point at yet (tools/bundle/ is not built), so the
// dev server is a visual preview, not the compliant instrument — see
// app/render/ui/README.md.
export default defineConfig({
  root: "app/render/ui",
  plugins: [preact()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    outDir: "../../../dist/ui",
    emptyOutDir: true,
  },
  // maplibre-gl spawns its GeoJSON-tiling work in a Web Worker via a
  // `new URL(...)`-relative import; Vite's dependency pre-bundling
  // (esbuild) breaks that URL, so the worker script 404s silently and
  // every geometry layer (fire perimeter, envelope, units, ...) stores
  // its data but never renders a single pixel of it. Excluding the
  // package from pre-bundling keeps it in its own natural ESM form, where
  // the worker URL resolves correctly.
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
});
