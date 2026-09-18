# The UI — visual preview, not the compliant instrument

This is the "render/" module from `SPEC/05_System_Architecture.md` §6
("map, status strip, report rail, drawers, probe surface"), built to make
the workflow visible and clickable per an explicit request — it is a
**preview build**, and differs from the real instrument in ways that
matter before any real session runs:

- **Basemap.** MapLibre needs vector or raster tiles for a real
  cartographic background. The real instrument resolves these from an
  offline, content-hashed asset bundle (`SPEC/05` §8, `tools/bundle/`),
  which is not built — it is the only module permitted outbound network
  access, and building it means fetching real, licensed MML data, a
  separate task. This preview uses a flat, tile-free background instead
  (`OFFLINE_STYLE` in `components/MapView.tsx`) — no basemap imagery, but
  also no network request of any kind, so I3 ("no network during a run")
  holds for this build even without the real tile bundle. (An earlier
  version of this preview pointed MapLibre at a public demo tile server
  instead; that made the map silently fail closed — a blank canvas, no
  error shown — in any offline or sandboxed environment, which is worse
  than having no basemap at all.)
- **Scenario content.** Drives off `app/scenario/demo-scenario.ts`,
  synthetic placeholder content — see `content/demo/README.md`.
- **Retrieval / AI drawer.** Haku, `Avaa tekoäly`, and Radio all resolve
  to `app/retrieval/closure.ts`'s closed, deterministic token-overlap
  baseline (via `SessionOrchestrator.searchAtoms`/`askUnit`) — never
  hand-written canned text, never generated prose. The hybrid sparse+dense
  engine `SPEC/14` §5 specifies needs an embedding-model choice `SPEC/11`
  §7.1 still leaves open; this baseline satisfies I6 regardless of
  ranking quality and stands in until that choice is made.
- **Scope.** Covers the primary loop end to end (bubbles arrive, envelope
  reveal, three-way judgement, confidence, follow-up, verification,
  allocation, cycle advance) for one condition at a time. Preflight,
  briefing, the warm-up prologue, SPAM probes, the decision task panel,
  and the questionnaire are not built — this is a workflow preview, not a
  feature-complete build.

None of this affects the modules under test (`app/engine/`,
`app/scenario/`, `app/telemetry/`, `app/routing/`, `app/retrieval/`,
`app/boundary/`, `app/render/render-tree.ts`,
`app/render/visual-encoding.ts`) — those are the same code, real and
tested, that this UI happens to be a window onto.
