# 07 — Telemetry and logging

**Version 3.1 · 17 September 2026** (v3.0 · 13 September 2026). Expands `02_Architecture_v2.md` §8 into a complete, buildable enumeration and adds the drawer, traffic-request and tier-discovery records the layout and routing decisions require.

> **Changelog**
> - **17 Sep 2026 (d)** — two groups (no AI 70, AI 130); AI group pull-only with group-specific training; AI group split 65/65 at the hinge, the via-AI half receiving query answers framed against the commanded strategy; branch choice adopted with four authored options plus *Ei mikään näistä*, no free text; per-choice alignment feedback removed.
> - **3.1 · 17 Sep 2026** — SPAM, recall-confidence, decision and retrieval-package records.

---

## 1. Principle

**Capture raw events with precise timing and identity. Derive nothing at runtime.**

Dwell, latency, reformulation intervals, revisit counts and reliance measures are all computed in analysis from enter/leave and onset/action pairs. Storing a derived value makes an analysis bug permanent and unfixable.

Every record carries `seq`, `tVirtual` and `tWallOffsetMs` (`04` §10). `seq` is gapless; a gap is a detected data-loss event.

**There is no volume argument for capturing less.** A twenty-cycle session produces roughly 6,000–10,000 records without the pointer track and about 45,000 with it at 10 Hz. At ~200 bytes per record that is 2 MB, or 9 MB with the track. The cost of a missing field discovered at analysis is a measure that does not exist; the cost of an unused field is nothing.

---

## 2. Record kinds

The complete enumeration. Adding a kind is a `formatVersion` bump.

### 2.1 Session and lifecycle

| Kind | Detail |
|---|---|
| `session_started` | The header (`04` §10) |
| `preflight_result` | Benchmark scores, viewport, refusal reason if any |
| `briefing_advanced` | Screen id, dwell |
| `cycle_start` | Cycle index, phase, virtual clock label |
| `cycle_end` | Cycle index, total real duration |
| `hinge_pause_start` / `hinge_pause_end` | Real duration, whether dismissed early |
| `state_transition` | From state, to state, trigger |
| `fault` / `fault_resolved` | Fault class, elapsed wall-clock gap |
| `window_blur` / `window_focus` | Relevant to exclusion rules |
| `idle_start` / `idle_end` | Threshold 5 s of no pointer or keyboard input |
| `frame_stats` | Per cycle: median frame time, long-task count. Identifies degraded machines |
| `session_completed` | |
| `session_resumed` | Resume count, interval since interruption, cycle replayed |

### 2.2 Stimulus onsets — the latency anchors

**Latency is meaningless without a defined zero.** These records exist to provide it.

| Kind | Detail |
|---|---|
| `bubble_available` | Atom id, map position, tier, source id |
| `envelope_revealed` | Cycle index, envelope id |
| `channel_signal_emitted` | Cycle index, the full signal payload including the traffic summary |
| `duty_officer_message_delivered` | Message id, whether it is the strategic guidance |
| `probe_presented` | Probe id, type, mode, option set |
| `retrieval_returned` | Query id, returned atom ids **in rank order** |
| `unit_reply_delivered` | Request id, addressee, atom ids returned, authored latency applied |
| `traffic_returned` | Request id, selector, entry ids in order |

### 2.3 Pointer and element interaction

```ts
interface ClickDetail {
  targetKind: "bubble" | "unit" | "drone" | "envelope" | "sector"
            | "map_background" | "drawer_control" | "drawer_tab" | "probe_option"
            | "result_item" | "channel_signal" | "rail_item" | "slider"
            | "status_strip_item" | "other";
  targetId: string | null;
  mapCoord?: { lat: number; lon: number };   // WGS84
  viewportRef: number;                        // seq of the last viewport_changed
  pointerType: "mouse" | "pen" | "touch";
  button: number;
}
```

| Kind | Detail |
|---|---|
| `click` | `ClickDetail` |
| `element_enter` / `element_leave` | Target identity. Together these give dwell and revisit counts |
| `layer_toggled` | Layer id, new state |
| `viewport_changed` | Centre, zoom, bounding box. Throttled to 4 Hz while panning, plus one settle record |
| `text_scrolled` | Element id, **maximum scroll fraction reached** — the only evidence a long report was read to the end |
| `pointer_track` | Optional, default off, configurable rate (10 Hz). Enable for an attention-allocation proxy without eye tracking |

### 2.4 Drawers — the reliance measures

The layout decision (`06` §1) makes these the cleanest reliance measures in the design. They did not exist in the previous telemetry spec.

| Kind | Detail |
|---|---|
| `drawer_opened` | Drawer (`haku` \| `tekoaly` \| `radio`), cycle index, **latency from `cycle_start`**, opening route (button, keyboard) |
| `drawer_closed` | Drawer, dwell, closing route (button, map click, Escape, replaced by another drawer) |
| `drawer_tab_changed` | Drawer, from tab, to tab |
| `drawer_state_at_cycle_boundary` | Which drawer, if any, was open when the cycle advanced |

Derived in analysis, never at runtime: time to first drawer open per cycle; drawer-open fraction of working period; **cycles in which no drawer was opened at all**.

### 2.5 Query capture — what was asked

The requirement is that query content and composition behaviour be recoverable in full.

| Kind | Detail |
|---|---|
| `query_focus` | Input receives focus |
| `query_first_keystroke` | Time to first character; the gap from `query_focus` is a composition-onset measure |
| `query_edit` | Emitted on backspace runs or clearing, **with a count, not per keystroke** — enough to detect reformulation without keystroke-level content |
| `query_submitted` | **The verbatim text**, character count, composition duration, query id, and the reformulation chain index within the cycle |
| `query_cleared` | Abandoned without submission, **with the text as typed**. An abandoned query is a strong signal and is usually discarded by instrumented systems |
| `retrieval_miss` | Query id and text, distinct from `retrieval_returned` |
| `result_item_expanded` / `result_item_collapsed` | Which returned atoms were actually opened, in what order |

**In `directed`, the same records apply to the radio panel**, with an additional `addressee` field recording which named formation was chosen. **Unit choice is a measure in its own right.**

| Kind | Detail |
|---|---|
| `radio_request_submitted` | Addressee, verbatim text, composition duration |
| `traffic_requested` | Selector (`byUnit` \| `byGroup` \| `byTimeWindow`), the full selector value |

`traffic_requested` carries the selector because **whose traffic someone chooses to read is a measure** (`02` §3.4).

**Query text is participant-authored free text and is personal data.** It is stored locally, pseudonymised with the session, uploaded to EU hosting under a processing agreement, and named explicitly in the data-protection documentation.

### 2.6 Probe and decision interaction

| Kind | Detail |
|---|---|
| `probe_option_hovered` | Pre-selection consideration |
| `probe_answer_changed` | From and to, **every change before submission** |
| `confidence_slider_moved` | Value and timestamp, throttled to 10 Hz while dragging, plus a final settle record. **Hesitation and reversal on a confidence scale are informative and invisible if only the final value is stored** |
| `probe_submitted` | Probe id, final response. The full input history is recoverable from preceding records |
| `expectation_marked` | Marked geometry and confidence |
| `containment_judgement_submitted` | Three-way judgement, confidence, and the breach point or corrected polygon |
| `containment_judgement_revised` | **A distinct kind. Never the same record mutated** |
| `failure_location_marked` | Marked point or polygon |
| `corrected_projection_drawn` | Polygon, vertex count, drawing duration |
| `allocation_changed` | Asset, previous sector and task, new sector and task |
| `allocation_submitted` | The full assignment plus the free-text rationale |

### 2.7 Discovery events — derived at analysis, anchored here

No new record kind. Tier-4 discovery for the three load-bearing items is computed from `traffic_returned`, `unit_reply_delivered` and `result_item_expanded` against the authored atom ids. The instrument must therefore log **atom ids on every delivery**, which §2.2 requires. Nothing is inferred from text.

---

## 3. What must never be logged

Anything that would let the runtime score. No record contains a correctness value, a flag, a truth annotation, or a comparison against an invariant. **Scoring happens entirely in the analysis pipeline.** A runtime that scores can bias a subsequent probe, and a log that contains the answer key cannot be shared.

Raw keystroke content of a query in progress. Only `query_submitted` and `query_cleared` carry text; `query_edit` carries a count.

Any personal identifier. The participant code is pseudonymous and the mapping lives outside the log, under separate access control.

---

## 4. Derived measures — computed in analysis only

Listed here so the raw records above can be checked for sufficiency. If a measure below cannot be computed from §2, a record is missing.

| Measure | Computed from |
|---|---|
| Judgement latency | `containment_judgement_submitted.t` − `envelope_revealed.t` |
| Time to first information-seeking act in a cycle | First `drawer_opened` \| `radio_request_submitted` \| `query_submitted` − `cycle_start` |
| Dwell per element | Paired `element_enter` / `element_leave` |
| Report read-through | `text_scrolled.maxFraction` per atom |
| Reformulation chain length | `query_submitted` records sharing a cycle, by chain index |
| Abandonment rate | `query_cleared` ÷ (`query_cleared` + `query_submitted`) |
| Confidence reversal count | Direction changes within a `confidence_slider_moved` run |
| Drawer reliance | Drawer-open fraction of the working period, per cycle |
| Channel attention (`substitutive`) | `element_enter` on `channel_signal` targets, dwell, and whether any signal was opened |
| Source-selection tracking | `radio_request_submitted.addressee` against authored `SourceClass.reliability` |
| Tier-4 discovery | §2.7 |
| Doubt–action coherence | `containment_judgement_submitted` + `allocation_submitted` + the authored viability table |
| Revision rate | `containment_judgement_revised` ÷ `containment_judgement_submitted` |
| Fatigue trajectory | Per-cycle latencies and information-seeking counts against cycle index |

---

## 5. Volume and retention

Roughly 2 MB per session without the pointer track, 9 MB with it. A hundred participants is under 1 GB.

Retention, access control and the DPIA are specified in `09` §8. The log contains free text the participant wrote and is therefore personal data in its entirety, not only in the query fields.

---

## Amendment 2026-09-17

| Kind | Detail |
|---|---|
| `spam_prompt_shown` | Probe id, onset (virtual and wall offset) |
| `spam_ready` | Latency from onset; or `spam_ready_timeout` |
| `spam_answered` | Response, latency from ready; or `spam_answer_timeout` |
| `recall_confidence_submitted` | Probe id, value (plus slider movement records as §2.6) |
| `decision_*` | As `16` §8 |
| `retrieval_returned` (extended) | Ranked package ids, package types, scores (fixed precision) — `14` §5 |
| `phase_entered` | `warmup` \| `tutorial` \| `phase_a` \| `hinge` \| `phase_b` |

The log header additionally records `guidanceMode` and `echelon`.

**LLM-query coding (Paper 3).** Query text is already captured verbatim (§2.5). Coding for SA level, function, grounding and framing is done in analysis, blind to condition, using the coding manual (`11` §4.2).

---

## Revision 17 Sep 2026 (d) — supersedes earlier amendments where they conflict

| Kind | Detail |
|---|---|
| `polygon_tool_opened` / `polygon_tool_abandoned` | Probe id |
| `corrected_projection_drawn` | Polygon, vertex count, drawing duration (raw onset/offset only) |
| `branch_list_presented` | Statement ids in order |
| `branch_option_hovered` | Statement id |
| `branch_selected` | Statement id or `none_of_these` |
| `branch_list_abandoned` | Probe id |
| `retrieval_returned` (extended) | + `intentLineShown: boolean` |

Removed: `alignment_feedback_shown`, `decision_final_submitted`. Log header records `cell` instead of `guidanceMode`.
