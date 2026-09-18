# 19 — Query database content: what is recorded, what is said, what is missing

**Version 0.1 · 17 September 2026 · Status: proposed; content pending domain review.** Specifies what the searchable database contains for the scenario in `18`, how communication inside and between teams ends up in it (or does not), and how each group reaches it. Complements `02` §3–§4 (tiers, reachability), `04` §3–§5 (atom schema), `03` §7 (record types and degradation) and `14` (the LLM-reasoning engine).

> **Changelog**
> - 0.1 · 17 Sep 2026 — created.

---

## 1. The designer's stance

Written from the position of a senior rescue officer designing an incident data system for about 2030.

1. **The database holds what the organisation wrote down, recorded or measured — not what it knows.** Most of what crews know is said face to face, on direct radio, or on the phone, and never enters a system.
2. **Recording is uneven by channel.** Authority talk groups can be recorded and machine-transcribed; direct-mode radio and phone calls leave nothing, or only a line in someone's log.
3. **Everything in the database has a source, a time it was observed and a time it was recorded.** These often differ, and the difference is information.
4. **Transcripts are imperfect.** Finnish speech recognition on noisy radio mishears place names, numbers and negations. The database stores what the machine heard.
5. **Silence is data only for someone who looks for it.** A gap in the log during the crown run is not an absence of events.
6. **The map shows the latest value; the database keeps the history.** Hovering gives the current state. Asking gives how it got there.
7. **The LLM-reasoning AI can only integrate what is in the database.** It cannot know what was said on direct radio or at the command point. It also drops the one recorded line that matters when answering broad questions (`14` §4).

---

## 2. Communication channels during the incident

| Channel | Who uses it | Recorded? | Transcribed? | In the database as | Tier |
|---|---|---|---|---|---|
| **JOHTO** talk group [nimi] | PTJ, P3, sector leaders | Yes | Yes (automatic) | Full transcript entries | T2 |
| **TOIMINTA-1** talk group | Units in L1 and L2 | Yes | Yes | Full transcript entries | T2 / T4 (lateral lines) |
| **TOIMINTA-2** talk group | Units in L3 and L4 | Yes | Yes | Full transcript entries | T2 / T4 |
| **ILMA** talk group | Drone team, helicopter, spotting aircraft via emergency centre | Yes | Yes | Full transcript entries | T2 |
| **YHTEISTOIMINTA** talk group | PTJ, police, grid operator liaison | Yes | Yes | Full transcript entries | T2 |
| **Direct-mode radio (DMO)** | Neighbouring crews at close range | **No** | No | **Nothing** | T3 / T4, ask only |
| **Mobile phone** | Crew leaders, civilians, P3 | No | No | A situation-log line only if someone typed one | T3, ask only |
| **Face to face** | At the command point, on the line | No | No | Nothing | T3, ask only |
| **Emergency-centre calls** | Public, harvester operator, cabin owners | Yes | Summarised by the operator | Task-record entries | T2 |
| **Field command system (KEJO-type) entries** | Whoever has a free hand | — | Typed | Situation-log entries | T1 / T2 |
| **Vehicle data (AVL, status, tank level where fitted)** | Vehicles | Automatic | — | Telemetry records | T1 / T2 |
| **Sensor feeds** | Drones, satellites, weather station | Automatic | — | Observation records | T1 / T2 |

Talk-group names are placeholders; the domain reviewer sets the real plan.

**Radio discipline in the scenario:** units report upward on JOHTO in short, formal messages; the operational groups carry most traffic; neighbours use DMO for quick coordination once they can see each other. That split is what makes lateral knowledge invisible.

---

## 3. Contents of the database

Each family lists its fields (in addition to the `Provenance` fields in `04` §3.2), an example in draft Finnish, and the target volume across W1–W5 and cycles 1–20.

### 3.1 Map hover layer and its history

**What the participant can already hover over** (current value only):

| Map object | Hover card shows |
|---|---|
| Unit symbol | Id, type, crew size, status code and its time, AVL time, tank level (EK11, KY21 only) |
| Perimeter segment | Source (drone, crew, satellite), observed time, method |
| Hotspot | Sensor, detection time, confidence |
| Drone footprint | Platform, altitude, battery %, last frame time |
| Water point | Type, capacity, access, last inspection date |
| Road | Class, surface (**not** load limit) |
| Value at risk | Type, number of buildings, occupancy *tuntematon* |
| Envelope | Validity horizon, certainty |
| Weather station | Latest reading and time |

**What the database adds:** every previous value with its time — status changes, earlier perimeters, battery history, AVL tracks, earlier envelopes. Hovering never shows history; asking or browsing does.

Volume: generated from the world state (`18`); ~40 history series.

### 3.2 Emergency-centre task record (T2)

Fields: task id, call time, caller type, caller's location, operator summary, initial assignment, later additions.

> `11:32 Soittaja: metsäkoneenkuljettaja. Kipinöistä syttynyt palo hakkuualueella, n. 0,5 ha, leviää koilliseen. Sijainti soittajan mukaan [koordinaatti]. Ei henkilövaaraa tiedossa.`

Later entries: cabin owners calling about smoke (cycles 8–9); a caller reporting a smell of smoke near the bog at 16:52 (cycle 11, **omission cue**); a farmer offering a slurry tanker (13).

Volume: 12–16.

### 3.3 Situation log (KEJO-type) (T1 when new, T2 afterwards)

Fields: entry time, author, free text, optional map link, edited flag (not always set — degradation #10).

> `13:24 PTJ Johtovastuu otettu EK11:ltä. Palo n. 11–15 ha, kärki koilliseen. EK14, KY21 tulossa.`
> `15:02 EK12 vetäydyttiin kuusikon reunalta, latvapalo. Ei loukkaantuneita.`
> `16:18 EK11 lohko 2 hallinnassa.` (never *sammutettu*)
> `19:06 EK15 itäpäässä savua uran takana, ei meidän lohko.` (**reconciling cue**, recorded 6 min after it was said)

Deliberate thinning: **no entries 14:52–16:05** (crown run) and **17:30–17:50** (water shuttle cut).

Volume: 70–90.

### 3.4 Unit status and telemetry (T1 / T2)

Fields: unit, status code, set time, set by, AVL position and time, tank level (fitted units), crew heat-stress index (EK11 pilot only).

Built-in problems: EK12 status stale from 13:40 (#5); EK12 AVL drift at cycle 7 (F2); dismounted crews have no position.

Volume: generated; ~200 status and telemetry points, shown as history.

### 3.5 Recorded radio traffic — transcripts (T2, lateral lines T4)

Fields: talk group, start time, duration, speaker, addressee(s), transcript, **transcription confidence** (low / medium / high), audio available flag.

Examples:

> `JOHTO 14:21 EK11→PTJ "Pyydän lisää vettä, W1 vesi vähissä, siirrytään..." [luottamus: keskitaso]`
> `TOIMINTA-1 14:24 EK12→EK11 "kipinöitä tulee meidän puolelle harjun yli, pitäkää silmällä" [luottamus: keskitaso]` → **`t4.ember_warning`**
> `ILMA 15:38 DR-operaattori→HELI1 "DR1 ja DR3 alas, ilmatila vapaa R1:n pohjoispuolella"`
> `TOIMINTA-2 16:44 KY21→oma miehistö "varmistetaan suon reuna vielä, VPK:n mukaan ei ihan varma" [luottamus: matala]` → **`t4.private_doubt`** (relayed)

**Transcription errors, authored:** place names misheard; numbers confused (*kuusi/kaksi*); a dropped negation once (not in a load-bearing line). **Rule: load-bearing lines are transcribed at medium confidence or better**, so they are findable by both groups.

Volume: 140–170 entries, of which ~40 are lateral (T4) and ~50 are noise (routine checks, repeated call-signs, radio tests).

### 3.6 Traffic metadata only (T2)

For calls on recorded groups where speech was unintelligible, and for phone calls someone noted.

> `TOIMINTA-1 15:04 EK12→EK11 kesto 4 min 10 s — ei tekstiä (tallenne heikko)`
> `16:58 PTJ puhelu P3:lle, kesto 3 min (ei merkintää sisällöstä)`

Volume: 25–35. These are the strongest invitations to ask (`03` §7.2 #14).

### 3.7 Aerial and sensor observations (T1 / T2)

| Source | Fields | Built-in limits |
|---|---|---|
| Drones DR1–DR3 | Frame time, platform, altitude, perimeter polygon, hotspot list, operator note | Grounded 15:40–16:20 north of R1; F1 link drop; F4 thermal saturation; steam after rain (F6) |
| Spotting aircraft | Report time, relay time, text | Relay delay 5–20 min; cycle 6 report entered 20 min late |
| Satellite hotspots | Pass time, delivery time, position, confidence, pixel size | 20–60 min latency; F5 |
| SAR image (cycle 16) | Acquisition time, delivery time, burned-area outline | Arrives hours after acquisition |

Volume: 50–70.

### 3.8 Reference registers (T2)

| Register | What it holds | What it gets wrong |
|---|---|---|
| Forest stand data | Species, age, thinning history, crown base | SPR shown as thinned (M3) |
| Peat and ditch network | Peat depth class, ditch lines | — |
| **Forest-use declarations and ditch maintenance** | 2024 ditch maintenance in BOG-S, with spoil banks | Nothing wrong; **not on any map layer** (omission cue) |
| Road register | Class, **load limits** | Bridge limit 16 t absent from the map layer (cycle 16) |
| Water-point register | Type, capacity, last inspection | W1 last inspected in May; now low |
| Building register | Buildings by type at V1, V2 | No occupancy |
| Power-line data | 110 kV line, operator contact | — |
| Heritage register | Salpa Line structures | — |

Volume: 30–40 records.

### 3.9 Weather products (T2)

FMI forecasts (hourly means, gust forecast), forest-fire warning, the portable station series, and a regional radar note at cycle 10. The gust forecast issued at 12:40 (W4) predicts local gusts to 13 m/s in the afternoon — **available, never pushed** (Kalajoki lesson). DC and BUI appear in the fire-danger product; after the shower they stay high (M1 cue).

Volume: 20–25.

### 3.10 Duty officer and regional information (T1 / T2)

Initial intent (W5), the hinge guidance (16:40), P3 questions (cycle 7), regional incident list (from cycle 11: three fires; locations only), the release request (14), helicopter recall (17).

Volume: 20 messages + 5 regional entries.

### 3.11 Civilian contacts (T2 via task record; otherwise ask)

Harvester operator digging a line (W2), cabin owners (8–9), farmers' tankers (13), village residents (17). Only calls through the emergency centre are recorded.

### 3.12 Logistics (T2)

Requests and stock: hose, wetting agent, fuel, food, relief crews. Shortage entries at cycle 15 (Sweden 2018 lesson).

Volume: 10–15.

### 3.13 Time on task (T2)

Derived from status changes: EK11 on task since 12:00; VPK since 11:55. EK11 heat-stress index from the pilot sensors from cycle 15.

### 3.14 Machine projection history (T2)

Every earlier envelope with its validity horizon, and the observed perimeter at that horizon. **Same in both groups.** A participant who compares them can learn the machine's error pattern; this is realistic and is not a manipulated variable.

---

## 4. What is never in the database

What a senior officer knows is said but never recorded. **Only asking a person reveals it, in both groups.**

| Knowledge | Who has it | How it was said | Cycle |
|---|---|---|---|
| Informal boundary shift between EK11 and EK14 | Both leaders | DMO | 2 |
| **`t4.water_state`**: VPK's water will last about 20 minutes | VPK, KY21 | DMO | 4 |
| Access road R2 soft after the culvert | VPK | Face to face | 1 |
| Standing dead trees in SPR make the planned approach unsafe | EK12 | Face to face with its crew | 5 |
| Drone operator warned EK14 that DR2 battery was nearly done | Drone operator, EK14 | Face to face at CP | 7 → 8 |
| North flank unobserved since the drones went down | Drone operator | Not said at all unless asked | 9 |
| Ground warm underfoot and peat smell in BOG-S | VPK | Face to face | 10–11 |
| **VPK leader's doubt about the bog line** (original) | VPK, KY21 | Face to face | 11 |
| Depth of burn in peat | KY21, VPK | Not reported | 15 |
| Occupancy of two houses in V2 | Police | Police system, not shared | 17 |
| **EK14 sees only its own line** (reconciling detail) | EK14, EK15 | DMO | 18 |
| Crew exhaustion beyond the numbers | EK11 leader | Not reported | 19 |
| Berry pickers in the forest | Nobody sure | — | 1–3 |
| What P3 knows about the other fires | P3 | Phone with the region | 11–17 |

---

## 5. Per-cycle inventory

**In DB** = new records in the database. **Radio** = recorded transcripts. **Ask only** = never recorded. **Noise** = low-value entries that make searching a skill.

| Cycle | In DB | Radio (recorded) | Ask only | Noise |
|---|---|---|---|---|
| W1 | Task record from harvester operator; warning product | EK11 en route on JOHTO | — | Routine alert acknowledgements |
| W2 | First perimeter (DR1); log: EK11 on scene | EK11 size-up | Harvester line location | Radio check |
| W3 | Log: spot fire N of R1 | VPK reports spot | — | Repeated call-signs |
| W4 | **FMI gust forecast**; DR1 battery swap | EK12 ETA | — | Fuel note |
| W5 | **Initial intent**; perimeter 11 ha | P3 intent read-back | — | — |
| 1 | Handover log; conflicting size estimates | EK11→PTJ handover brief | R2 soft ground (VPK) | Radio test |
| 2 | DR3 mapping loop starts | Sector assignments | **Boundary shift (DMO)** | — |
| 3 | Ridge fire perimeter; thunderstorm note | "savua harjulla" | Lichen-heath on ridge (EK11) | Duplicate hotspot |
| 4 | F1 link-drop gap; W1 register (inspected May) | **`t4.ember_warning`** on TOIMINTA-1; EK11 asks for water | **`t4.water_state` (DMO)** | Status noise |
| 5 | Stand data (wrongly thinned) | EK12 "kuusikon reunalla" | Standing dead trees (EK12) | — |
| 6 | Log gap starts 14:52; F4 saturated frame; spotting aircraft report (entered late); grid-operator call | EK12 withdrawal (metadata only, 4 min) | Near-miss details | — |
| 7 | EK12 AVL drift (F2); escalation request | P3 question on JOHTO | Drone battery warning (face to face) | Duplicate AVL points |
| 8 | Helicopter arrival; drones grounded; late satellite hotspots (F5) | ILMA grounding call | — | Aviation chatter |
| 9 | North flank perimeter 40 min stale; cabin calls | EK14 partly unintelligible (F3) | North flank unobserved (drone operator) | — |
| 10 | Log: "hallinnassa" ×3; shower on radar; DC/BUI still high; steam in DR3 frames | "lohko hallinnassa" reports | Warm ground, peat smell (VPK) | Food request |
| Hinge | **Hinge guidance**; regional list (three fires) | P3 guidance read-back | What P3 knows | — |
| 11 | 16:52 task record: smoke smell near bog | **`t4.private_doubt` relayed** on TOIMINTA-2 (low confidence) | Original doubt (VPK) | Relief roster |
| 12 | **Ditch-maintenance record** (always present); new fire outside envelopes | KY21 "suolla avotulta" | — | — |
| 13 | Log gap 17:30–17:50; R2 cut | Water shuttle call; farmers' offer | — | Tanker ETA noise |
| 14 | **Release request** for KY21, DR3 | P3 relays region | P3 on other fires | Other incident's traffic on shared group |
| 15 | Logistics shortages; EK11 heat-stress rising | "vesi ei imeydy" | Burn depth (KY21) | — |
| 16 | **Bridge load limit** (register only); SAR image; OUT1/OUT2, UGV1 arrive | OUT1 asks for route | — | Unfamiliar call-signs |
| 17 | Evacuation advisory; public warning; helicopter recalled | POL on YHTEISTOIMINTA | Occupancy of two houses (POL) | — |
| 18 | **Spotting aircraft: N flank accelerating**; EK14 log "linja pitää"; 19:06 EK15 log (late) | Both reports on JOHTO | **EK14 sees only its line (DMO)** | — |
| 19 | Time on task; UGV1 stuck | Rotation plan | Crew exhaustion (EK11) | — |
| 20 | Handover summary | Handover brief | Outgoing crews' briefings to incoming (DMO) | — |

---

## 6. Load-bearing items and their routes

Reachability rule (`02` §4) applied to the two groups in use.

| Item | Where it lives | Radio group route | LLM-reasoning route | Broad LLM question returns it? |
|---|---|---|---|---|
| `t4.ember_warning` | TOIMINTA-1 transcript, cycle 4 | Browse traffic (group + time) or ask EK11 | Narrow question ("mitä EK12 sanoi EK11:lle kipinöistä?") or ask EK11 | **No** — dropped from integrated answers |
| `t4.water_state` | DMO, not recorded | Ask VPK or KY21 | Ask VPK or KY21 | Not in database |
| `t4.private_doubt` | Face to face; relayed on TOIMINTA-2 (low confidence) | Browse traffic or ask KY21/VPK | Narrow question ("VPK suo varma?") or ask | **No** |
| Contradiction premise and counter-evidence | Spotting-aircraft report; EK14 log | Both pushed | Both pushed | Integrated answer presents them as settled |
| Contradiction reconciling detail | DMO; late log entry 19:06 | Ask EK14/EK15, or browse log after 19:06 | Ask, or narrow question after 19:06 | No |
| Omission cues | Ditch-maintenance record; 16:52 smoke-smell call; DC/BUI | Browse registers and task record | Narrow question | Cues appear only as sources, not as a conclusion |
| Bridge load limit | Road register | Browse | Narrow question | Yes, if asked about the route |

**How the LLM-reasoning answer drops an item** (`14` §4): an integrated answer to a broad question ("mikä on lohko 3:n tilanne?") is written from the same model state as the envelope and lists sources, but omits the load-bearing line. A narrow question naming the unit, time or topic returns an answer whose *Lähteet* part contains that line. The rule is authored and tested (`test/engine/omission.spec`).

`04` §3.1 `Routes` for this study: the `directed` route is `browse`, `request_traffic` or `ask_unit`; the `substitutive` route is `free_text` or `ask_unit`. The `channel` route is unused.

---

## 7. How each group uses the database

| | Radio | LLM reasoning |
|---|---|---|
| Hover cards | Yes | Yes |
| Browse surfaces (*Haku*): log, traffic, status, registers, weather, task record, projection history | Yes, manual filtering by group, unit and time | Yes, same surfaces |
| Ask a unit or P3 | Yes (authored replies) | Yes (authored replies) |
| Free-text question to the AI | No | Yes — template answer (Tilanne · Varmuus · Lähteet · Merkitys), sources expandable to records |
| Sees what was never recorded | Only by asking | Only by asking; the AI cannot know it |
| Intent line in answers (phase B) | — | Intent-line half only |

---

## 8. Volumes

| Family | Records |
|---|---|
| Task record | 12–16 |
| Situation log | 70–90 |
| Radio transcripts | 140–170 (≈40 lateral, ≈50 noise) |
| Metadata-only traffic | 25–35 |
| Aerial and sensor observations | 50–70 |
| Reference registers | 30–40 |
| Weather products | 20–25 |
| Duty officer and regional | 25 |
| Logistics and time on task | 15–20 |
| Authored replies for "ask only" knowledge | 70–100 (T3) |
| **Total authored** | **≈ 460–590**, above the `02` §3 range because radio transcripts are now explicit; the domain reviewer should confirm the load is realistic |

Hover history and projection history are generated from the world state and not counted.

---

## 9. Questions for the domain reviewer

1. Is recording and automatic transcription of authority talk groups plausible by 2030, and would transcripts be available to the incident commander during the incident?
2. Is the talk-group plan realistic for a company-level wildfire in this region?
3. How much do crews actually use DMO and phones, and what would a crew leader type into the field command system under load?
4. Are tank-level telemetry and body-worn heat-stress sensors credible as partial deployments?
5. Would a police evacuation status be shared with the incident commander's system?
6. Is the total record volume realistic for eight hours of this incident?
