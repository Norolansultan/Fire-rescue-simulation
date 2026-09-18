# The UI — visual preview, not the compliant instrument

This is the "render/" module from `SPEC/05_System_Architecture.md` §6
("map, status strip, report rail, drawers, probe surface"), built to make
the workflow visible and clickable per an explicit request — it is a
**preview build**, and differs from the real instrument in ways that
matter before any real session runs:

- **Basemap.** MapLibre needs vector or raster tiles. The real instrument
  resolves these from an offline, content-hashed asset bundle
  (`SPEC/05` §8, `tools/bundle/`), which is not built — it is the only
  module permitted outbound network access, and building it means
  fetching real, licensed MML data, a separate task. This preview points
  MapLibre at a public demo style over the network instead, purely so the
  map renders something. **This alone means invariant I3 ("no network
  during a run") does not hold in this build.**
- **Scenario content.** Drives off `app/scenario/demo-scenario.ts`,
  synthetic placeholder content — see `content/demo/README.md`.
- **Retrieval / AI drawer.** The `Avaa tekoäly` drawer returns canned,
  hand-written responses, not a real retrieval engine — the embedding
  model choice is still open (`SPEC/11` §7.1) and wasn't asked to be
  resolved here.
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
