# 18 — Scenario world state (draft for domain review)

**Version 0.2 · 17 September 2026 · Status: adopted into the scenario (`03` revision (g)); all numbers pending domain review (`11` §1.2).** Fills the gaps listed in `11` §7.3.

Every number here is a *proposal* chosen for internal consistency and plausibility. Place names marked **[nimi]** are placeholders to be bound to real MML features in QGIS.

> **Changelog**
> - **0.2 · 17 Sep 2026** — adopted into `03`; §12 changes applied there.
> - 0.1 · 17 Sep 2026 — first full draft: incident setting, available information in 2030, intent and hinge guidance, geography, weather series, fire behaviour, unit, drone and air timelines, values at risk, injected faults, prologue, lessons embedded.

---

## 1. Design stance

**Time frame: an incident around 2030.** The participant works with what a southeast-Finland rescue department could plausibly have by then — not a showcase of every emerging technology. More sensors do not remove the study's problem; they enlarge it. Each new feed arrives at a different latency, with a different reliability, and at least one of them silently fails. That is what makes integration hard, and why an AI that integrates is attractive.

**Four rules for "future" realism:**
1. **Only technology already fielded or in late trials by 2026** is assumed operational in 2030. Anything newer is a pilot with one unit.
2. **Every source has a latency, a failure mode and a reliability class.** Nothing is instant and nothing is complete.
3. **Old limits persist:** smoke blocks optics; drones and helicopters do not share airspace freely; radio and data coverage has holes in forest valleys; firefighters on foot are not tracked; deep smouldering is invisible from above after rain.
4. **The machine never sees more than the data it is given**, and its fuel data is older than the forest (M3).

**Design references carried in** (details in §11):
- *Kalajoki (Rautio) 2021:* re-ignition from smouldering ditch spoil after apparent control; late escalation; surveillance-aircraft reports not reaching the command post; water supply failure; weather services underused; long shifts; farmers' tankers used.
- *Sweden 2018 (SOU 2019:7):* slow and cautious starts; operations ended too early and fires flared again; weak initial situational picture; helicopter use delayed by cost; shortages of pumps, hose and fuel; multiple lightning ignitions; confusion about who was in command; civilians taking part.
- *Västmanland 2014:* ignition from forestry work.
- *Nick Ruest's `wildfire-robotics` (MIT):* mandatory provenance on every observation; "unknown" exposed rather than silently substituted; an explicit simulator-validity claim; command lifecycle separating authorisation from decision; deterministic fault campaigns (link loss, sensor faults) as authored events.

---

## 2. Setting

| Item | Value |
|---|---|
| Date | A Friday in late July, school holidays, the fourth week of a drought |
| Region | Southeast Finland, inside the `03` §1.1 box, near the South Karelia–Kymenlaakso boundary |
| Ignition point | **[nimi]** harvesting block, ≈ 60.90 N, 27.35 E (to be placed on a real mature pine/spruce mosaic from Metsäkeskus data, ≥ 10 km from the border) |
| Cause | Sparks from a harvester working a dry clear-cut (Västmanland pattern). The operator calls 112 at 11:32 |
| Fire danger | FMI forest-fire warning in force for the region for 9 days |
| Regional situation | Holiday staffing; a dry thunderstorm line passes the region from 13:30, igniting further fires (Ljusdal pattern) |
| Participant | *Joukkueenjohtaja* acting as *pelastustoiminnan johtaja* (PTJ). Follows the incident from 11:40 en route; **takes command at 13:20** (start of cycle 1) |
| Above the participant | Duty officer **P3** (regional, remote) |
| Incident end in scenario | 20:00 handover to the night organisation |

---

## 3. Information available in 2030 — the source inventory

Tier as in `02` §3: T1 pushed · T2 system-queryable · T3 ask a person · T4 lateral traffic.

| Source | Status by 2030 | Tier | Latency | Reliability class | Failure mode used in scenario |
|---|---|---|---|---|---|
| Emergency centre task record (ERICA) | Operational | T2 | Minutes | High for what the caller said | First location 300 m off (clumsiness #11) |
| Field command system entries (KEJO-type) | Operational | T1/T2 | Typed when a hand is free | Variable | Record thins under load (#7) |
| Vehicle positions (AVL) | Operational for vehicles | T1 | ~30 s | High | GPS drift on EK12 (fault F2); **crews on foot are not tracked** |
| Unit status codes | Operational | T2 | Entered late or never | Low | EK12 shows *kohteessa* since 13:40 while moving (#5) |
| Broadband authority radio (Virve 2.0-type), voice + data | Operational | T1 (voice), T4 (lateral) | Live | High where coverage exists | Dead zone in the northern valley (fault F3) |
| **Drone group** — two thermal multicopters + one long-endurance VTOL | Operational in larger departments | T1 (perimeter updates), T2 (imagery) | 1–5 min | High while airborne | Battery limits; grounded when the helicopter works; thermal saturation in crown fire (F4); rain-cooled surface hides smouldering |
| Volunteer fire-spotting aircraft | Operational in fire-warning periods | T1 | 5–15 min, via voice relay | Medium | Report not entered for 20 min (Kalajoki lesson) |
| Satellite thermal hotspots (polar orbiters; geostationary coarse detection; emerging small-sat constellations) | Operational (coarse); small-sat constellations partly available | T2 | 20–60 min | Medium; coarse position | Crown-run hotspots appear two cycles late (F5); smoke and cloud gaps |
| SAR imagery through smoke | Available on tasking | T2 | Hours | High but late | Arrives after the incident's key decisions (cycle 16) |
| FMI forecast, warnings and index | Operational | T2 | Hourly | High for means, weaker for gusts | **Gusts under-forecast locally** (M2); not pushed (Kalajoki lesson) |
| Portable weather station at the command point | Operational | T1 | 1 min | High, but one point | Sheltered by forest; under-reads open-ground wind |
| Forest stand data (Metsäkeskus, laser-scan based) | Operational | T2 | Static | Good but **dated** | Last scan predates a thinning and a storm-damage salvage: fuel boundary wrong (M3) |
| Peat and ditch network data | Operational | T2 | Static | Good | Ditch-maintenance record in a separate register (T2 cycle 12) |
| Road register (load limits) | Operational | T2 | Static | High | Bridge limit not shown on the map layer (cycle 16) |
| Water-point register | Operational | T2 | Static | Medium | One point dry this summer (T4 `t4.water_state`) |
| National spread-simulation service → **the machine's envelope** | In use / late trial | T1 (envelope) | Per cycle | Deliberately 50% | Uses mean wind, stale fuel map, no spotting, no deep ground fire (M1–M4) |
| Body-worn heat-stress sensors | **Pilot, one unit (EK11)** | T2 | 1 min | Medium | Only EK11 is instrumented; others unknown |
| Hose-laying ground robot (UGV) | **Pilot, arrives with reinforcements** | T1 (position), T3 (operator) | Live | Medium | Stuck on soft ground once (cycle 19) |
| Public warning (vaaratiedote / cell broadcast) | Operational | — | Minutes after decision | High | Decision authority lies with the police and the emergency centre |
| Civilians: harvester operator, farmers with slurry tankers, cabin owners | Real resources | T3 | By phone | Mixed | Enthusiastic, untracked, outside the command structure (Sweden 2018) |

**Deliberately not available:** position of firefighters on foot; reliable detection of ground fire below 10 cm after rain; a validated spread model for drained peat; shared airspace for drones and helicopters; live data from the second incident.

---

## 4. Commander's intent

The two texts below are what Paper 2 scores against. They are written to create a clear "old strategy" that later options can still follow.

### 4.1 Initial intent — prologue and phase A (from P3 at 13:00, W5)

> **Tavoite:** palo rajataan **[nimi] metsäautotien**, **[nimi] lammen** ja eteläisen suoalueen väliin.
> **Painopiste:** kärjen pysäyttäminen koillisessa ennen kuusikkoa ja pohjoiskyljen hallinta.
> **Toimintatapa:** suora hyökkäys siellä, missä teho sallii.
> **Resurssit:** yksikkö vapautetaan heti, kun sen lohko on hallinnassa — kesäloma-aika, alueen valmius on ohut.

*Contain between the forest road, the pond and the southern bog. Priority: stop the head in the northeast before the spruce and control the north flank. Direct attack where intensity allows. Release a unit as soon as its sector is in hand.*

### 4.2 Hinge guidance — phase B (from P3 at 16:40, after the pause)

> Alueella on nyt kolme maastopaloa. **Uusi linja:**
> 1. **Ihmiset ja asutus ensin.** Valmistaudu **[nimi] Mökkirannan** ja **[nimi] kylän** evakuointiin yhdessä poliisin kanssa.
> 2. **Puolustava toiminta.** Linjat teiden, vesistöjen ja vanhan linnoitusuran varaan. Ei miehistöä kärjen eteen kuusikossa.
> 3. **Ei vapautuksia ennen varmistusta.** Lohkoa ei vapauteta ennen kuin jälkisammutus on varmistettu lämpökameralla vähintään 30 metrin syvyyteen ojitusalueilla.
> 4. **Resurssit P3:n kautta.** Alue voi siirtää yksiköitä toiselle palolle klo 17.40 alkaen.

*There are now three wildfires in the region. New line: (1) people and settlement first — prepare evacuation of the lakeside cabins and the village with the police; (2) defensive action on roads, water and the old fortification track, no crews ahead of the head in spruce; (3) no sector released until mop-up is thermally confirmed to 30 m depth in ditched ground; (4) resources through P3; the region may move units to another fire from 17:40.*

**What changes, and what "old strategy" looks like in phase B:** direct attack at the head; releasing units once a sector looks in hand; offensive use of resources over protection of people. Rules 3 and 4 collide deliberately at cycle 14.

---

## 5. Geography

Distances are from the ignition point **IGN**. The author binds each item to a real feature.

| Id | Feature | Position | Role |
|---|---|---|---|
| IGN | Harvesting block, dry pine heath | 0 | Origin |
| R1 | Forest road **[nimi]**, gravel, E–W | 400 m N | First line; spot fire crossing W3 |
| RIDGE | Lichen-heath esker ridge | 800–1,200 m NE | Second ignition (cycle 3) ahead of the head |
| SPR | Mature, unthinned spruce, low crown base | 1.3–2.2 km NE | Crown run (cycles 5–7). Stand data shows it as thinned (M3) |
| BIRCH | Birch–aspen strip along a brook | 2.3 km NE | Where the crown run drops (cycle 7) |
| POND | Pond **[nimi]** | 1.5 km NW | Water point W1 |
| LAKE-N | Lake **[nimi]** with 14 cabins (**Mökkiranta**) | 2.5 km NW | Values at risk after the wind backs (cycle 9) |
| VALLEY-N | Wet valley north of R1 | 1–2 km N | Radio dead zone (F3); EK14's sector |
| BOG-S | Drained peatland, ditched; **ditch maintenance 2024** with spoil banks | 0.6–1.8 km S/SE | Smouldering and the omission (cycle 12); peat depth (15) |
| R2 | Forest road **[nimi]**, water-shuttle route | Along the E side, crossing BOG-S's east edge | Cut by fire (cycle 13) |
| SALPA | Old fortification track (Salpa Line), cleared corridor | 2 km S, E–W | Defensive line in phase B |
| BRIDGE | Timber bridge on R3, load limit 16 t | 3 km E | Reinforcement route problem (cycle 16) |
| VILLAGE-E | Village **[nimi]**: 9 houses, 2 farms | 3.5–4 km SE | Evacuation advisory (cycle 17) |
| W2 | Farm pond at VILLAGE-E | 3.8 km SE | Water point; shallow |
| W3 | River crossing **[nimi]** | 4 km NE | Reliable water point, long shuttle |
| PL | 110 kV power line, NE–SW | 1.5 km E | Smoke under the line; grid operator asks for a status report (cycle 6) |
| CP | Command point at R1/R3 junction | 1 km W | Participant's location; portable weather station |

### Sectors (lohkot)

| Sector | Area | Phase A | Phase B |
|---|---|---|---|
| **L1 Pohjoinen** | North flank, R1 to VALLEY-N and LAKE-N | EK14 | EK14 + relief |
| **L2 Kärki** | Head, RIDGE → SPR → BIRCH | EK11, EK12 | Defensive only (rule 2) |
| **L3 Etelä** | BOG-S, ditches, SALPA | VPK | KY21, then reinforcements |
| **L4 Länsi** | Origin and rear, CP | Harvester operator, VPK | Mop-up |

---

## 6. Weather series

The FWI-system columns are **scenario-internal values** computed with the standard equations so the failure mechanisms are physically consistent. Participants see FMI-style forecasts, the warning and the portable-station readings, not these columns.

Wind is given as the direction it blows *from*. ISI is computed for the mean wind (what the machine uses) and for the gust (what the fire meets).

| Cycle | Time | Wind from | Mean m/s | Gust m/s | T °C | RH % | Rain mm | FFMC | DMC | DC | ISI mean | ISI gust | BUI | FWI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| W1 | 11:40 | SW 225 | 4 | 7 | 26 | 32 | 0 | 90 | 70 | 480 | 8.9 | 15.3 | 103 | 29 |
| W2 | 12:00 | SW 225 | 4 | 7 | 27 | 30 | 0 | 91 | 70 | 480 | 10.2 | 17.6 | 103 | 32 |
| W3 | 12:20 | SW 230 | 5 | 9 | 27 | 29 | 0 | 91 | 70 | 480 | 12.3 | 25.3 | 103 | 36 |
| W4 | 12:40 | SW 230 | 5 | 8 | 28 | 28 | 0 | 92 | 70 | 480 | 14.1 | 24.3 | 103 | 40 |
| W5 | 13:00 | SW 230 | 5 | 9 | 28 | 28 | 0 | 92 | 70 | 481 | 14.1 | 29.2 | 103 | 40 |
| 1 | 13:20 | SW 230 | 5 | 9 | 28 | 27 | 0 | 92 | 71 | 481 | 14.1 | 29.2 | 104 | 40 |
| 2 | 13:40 | SW 230 | 5 | 9 | 29 | 27 | 0 | 92 | 71 | 481 | 14.1 | 29.2 | 104 | 40 |
| 3 | 14:00 | SW 235 | 6 | 11 | 29 | 26 | 0 | 93 | 71 | 481 | 19.5 | 48.3 | 104 | 49 |
| 4 | 14:20 | SW 230 | 6 | 10 | 29 | 26 | 0 | 93 | 71 | 481 | 19.5 | 40.3 | 104 | 49 |
| 5 | 14:40 | SW 230 | 6 | 11 | 29 | 26 | 0 | 93 | 71 | 482 | 19.5 | 48.3 | 104 | 49 |
| 6 | 15:00 | SW 225 | **7** | **13** | 29 | 25 | 0 | 93 | 71 | 482 | 23.4 | **69.4** | 104 | 55 |
| 7 | 15:20 | SW 220 | 6 | 11 | 28 | 27 | 0 | 93 | 72 | 482 | 19.5 | 48.3 | 105 | 50 |
| 8 | 15:40 | SSW 200 | 6 | 10 | 27 | 30 | 0 | 92 | 72 | 482 | 16.9 | 35.0 | 105 | 45 |
| 9 | 16:00 | **S→SE 160** | 5 | 9 | 25 | 38 | 0 | 91 | 72 | 482 | 12.3 | 25.3 | 105 | 37 |
| 10 | 16:20 | SE 130 | 4 | 7 | 22 | 60 | **2.0** | **82** | 70 | **482** | 2.9 | 5.1 | **103** | 13 |
| 11 | 16:40 | S 180 | 3 | 5 | 21 | 62 | 0 | 78 | 70 | 482 | 1.6 | 2.3 | 103 | 8 |
| 12 | 17:00 | SW 240 | 3 | 6 | 22 | 55 | 0 | 80 | 70 | 482 | 2.0 | 3.4 | 103 | 9 |
| 13 | 17:20 | W 270 | 5 | 8 | 23 | 48 | 0 | 84 | 70 | 482 | 4.6 | 7.9 | 103 | 18 |
| 14 | 17:40 | W 280 | 5 | 10 | 23 | 45 | 0 | 86 | 70 | 482 | 6.0 | 14.9 | 103 | 22 |
| 15 | 18:00 | WNW 290 | 6 | 11 | 23 | 43 | 0 | 87 | 70 | 482 | 8.3 | 20.5 | 103 | 28 |
| 16 | 18:20 | NW 310 | 6 | 10 | 22 | 44 | 0 | 88 | 70 | 482 | 9.6 | 19.7 | 103 | 31 |
| 17 | 18:40 | **NW 315** | **9** | **14** | 21 | 42 | 0 | 89 | 70 | 482 | 19.0 | **47.1** | 103 | 48 |
| 18 | 19:00 | NW 315 | 7 | 12 | 20 | 45 | 0 | 89 | 70 | 482 | 13.2 | 32.8 | 103 | 38 |
| 19 | 19:20 | NW 320 | 6 | 11 | 20 | 48 | 0 | 88 | 70 | 482 | 9.6 | 23.7 | 103 | 31 |
| 20 | 19:40 | NW 320 | 5 | 9 | 19 | 52 | 0 | 87 | 70 | 482 | 6.9 | 14.3 | 103 | 25 |

**The meteorology is one coherent story:** a southwesterly afternoon with gusts (M2) → winds **back** ahead of a weak front (cycle 9) → a 2 mm shower as it passes (cycle 10) → winds **veer** to the northwest and strengthen in cooler, gusty air behind it (cycle 17).

**M1 in the numbers:** after the shower FFMC falls from 91 to 82 and ISI collapses, so a surface-based projection says "slowing". DC stays at 482 — 2 mm is below the DC rain threshold — and BUI stays above 100: the deep layers are as dry as before.

**Flag for the reviewer:** DC ≈ 480 is high for Finland but plausible in a long drought. FFMC is treated as varying within the day for scenario purposes; the standard system computes it once daily.

---

## 7. Fire behaviour by cycle

ROS in metres per minute; "20-min advance" is what the participant can check against the envelope. Area is the authored burned area at cycle end.

| Cycle | Head ROS (actual) | Envelope assumed | Flag | What happens | Area ha |
|---|---|---|---|---|---|
| W1 | 3 | 3 | H | Surface fire in harvest slash and pine heath, running NE | 1 |
| W2 | 4 | 4 | H | Head approaches R1 | 3 |
| W3 | 6 (gust) | 4 | Q | Spot fire 30 m across R1; VPK knocks it down | 5 |
| W4 | 5 | 5 | H | Line along R1 holds in the west | 8 |
| W5 | 7 | 5 | Q | Head accelerates in open pine at the block edge | 11 |
| 1 | 6 | 6 | H | Command handover. Size estimates conflict: 11 ha (drone) vs 15 ha (EK11) | 14 |
| 2 | 6 | 6 | H | Lines being established on both flanks | 18 |
| 3 | 7 + spotting | 7 | Q | **Second ignition on RIDGE**, 250 m ahead. Cause open: ember spotting, or lightning from the passing thunderstorm line | 24 |
| 4 | 7 | 7 | H | Junction of main fire and ridge fire; water-point selection | 30 |
| 5 | 11 | 7 | Q | Head enters SPR. Stand data shows it as thinned; it was not (M3) | 38 |
| 6 | 18–22 | 8 | **C** | **Crown run** in SPR with spotting 200–400 m (M2 + M3 + M4). Near-miss: EK12 crew withdraws | 58 |
| 7 | 8 | 8 | H | Crown run drops in BIRCH; surface fire continues | 70 |
| 8 | 8 | 6 | Q | Helicopter working the head; drones grounded north of R1; spread faster than modelled on the NE edge | 82 |
| 9 | 7 on north flank | 1–2 (flank) | **C** | **Winds back:** the north flank becomes a head running NW toward LAKE-N, on ground unobserved since cycle 8 | 96 |
| 10 | 1–2 | 2 | H | Shower. Crews report L1 and L2 **in hand**. Steam, peat smell in BOG-S | 100 |
| — | — | — | — | **HINGE 16:40** | — |
| 11 | 1 | 1 | H | Quiet. Relief planning. `t4.private_doubt` from VPK about the bog | 101 |
| 12 | 3 surface, new front | not represented | **C + omission** | **Smouldering in the 2024 ditch-spoil banks in BOG-S surfaces** as open fire on the SE edge, outside every envelope | 104 |
| 13 | 4 | 4 | H | Fire crosses R2: the water shuttle is cut | 110 |
| 14 | 6 | 4 | Q | SE edge spreads in dry pine between ditches; region asks to release KY21 and the VTOL drone | 118 |
| 15 | 1 surface; burn depth 20–40 cm | surface only | **C** | Deep ground fire in drained peat; water does not penetrate without wetting agent | 122 |
| 16 | 5 | 5 | H | Reinforcements arrive via R3; BRIDGE limit stops the heavy tanker | 128 |
| 17 | 10 (gusts) | 7 | Q | **Second wind event:** NW gusts drive the SE head toward VILLAGE-E (Kalajoki-type 9–11 m/min on mineral soil) | 142 |
| 18 | 7 | 7 | H | **Contradiction:** spotting aircraft reports the north flank accelerating; EK14 reports its line holding | 152 |
| 19 | 9 | 7 | Q | Head gusts past SALPA corridor's east end; crews rotating out | 164 |
| 20 | 5 | 5 | H | Head held on SALPA and the village fields; handover | 172 |

Flags match `03` §4.2 exactly (10 H, 6 Q, 4 C in cycles 1–20). Prologue: 3 H, 2 Q, no C.

**Scale check:** ~170 ha in 8 h 20 min is at the severe end of Finnish experience, comparable in order of magnitude to Kalajoki 2021, and far below Swedish 2018 fires. This fits the `03` §1.4 divergence statement.

### 7.1 The contradiction (cycle 18), resolved in geography

The spotting aircraft sees a new spot fire 150 m **north of the east end of EK14's line**, across a forest track, and reports "the north flank is accelerating". EK14 sees only its own line, which is holding. The reconciling T4 item: EK14's crew leader tells the neighbouring relief unit on their direct group that "something is smoking behind the track to the east, not ours". Both reports are true.

### 7.2 The omission (cycle 12), resolved in geography

The 2024 ditch maintenance left 1–1.5 m spoil banks of dry peat along three ditches in BOG-S. Fire entered them at cycles 6–9 via spotting and smouldered under the surface. The shower cooled the surface; the drones that could have caught it were grounded or tasked north; thermal after rain showed only steam. At 17:00 it surfaces 600 m beyond the south edge of every envelope. The ditch-maintenance record exists — in the forest-use register, not on the map (T2).

---

## 8. Units and aircraft

### 8.1 Order of battle

| Id | Type | Crew | From | Notes |
|---|---|---|---|---|
| EK11 | Rescue engine + tanker | 1+5 | South Karelia, nearest full-time station | First unit; body-worn sensors (pilot) |
| VPK | Volunteer brigade, tank truck | 1+3 | Local | Knows the ground; untracked hand crews |
| EK12 | Rescue engine | 1+4 | South Karelia | AVL drift (F2) |
| EK14 | Forest-fire unit (terrain vehicle + trailer) | 1+3 | South Karelia | North flank |
| KY21 | Rescue engine + forest-fire container | 1+4 | Kymenlaakso | Cross-border unit; different call-sign conventions |
| DRONE | Drone team: DR1, DR2 (thermal multicopters, ~35 min per battery), DR3 (VTOL, ~2.5 h, perimeter mapping) | 3 | Regional drone unit | Operators on the ground at CP |
| HELI1 | Helicopter with bucket | — | State aviation, requested at 14:20 | Arrives 15:40, after its requested lead time |
| SPOT | Volunteer spotting aircraft | 2 | Fire-warning patrol | Voice reports via emergency centre |
| HARV | Harvester and operator (civilian) | 1 | Forest contractor | Digs a mineral-soil line in L4 |
| FARM | Two farmers with slurry tankers (civilian) | 2 | VILLAGE-E | Water in phase B |
| EK15, EK16, KY23 | Reinforcement engines (company level) | 1+4 each | Neighbouring stations | Escalation decided at cycle 7 |
| OUT1, OUT2 | Reinforcements from outside the region | 1+4 each | Other region | Unfamiliar ground; arrive cycle 16 |
| UGV1 | Hose-laying ground robot (pilot) + operator | 1 | Arrives with OUT1 | Stuck once in soft ground (cycle 19) |
| POL | Police patrol | 2 | — | Evacuation authority |
| P3 | Duty officer | — | Remote | Source of intent |

### 8.2 Timeline

| Cycle | EK11 | VPK | EK12 | EK14 | KY21 | Drone team | Air | Others |
|---|---|---|---|---|---|---|---|---|
| W1 | En route | En route | — | — | — | — | — | HARV on scene |
| W2 | On scene, R1 west | On scene, L4 | En route | — | — | DR1 launched from EK11 | — | |
| W3 | R1 | Spot fire N of R1 | En route | — | — | DR1 over head | — | |
| W4 | R1 east | L4 | On scene | En route | — | DR1 battery swap | — | FMI gust forecast in T2 |
| W5 | Head, L2 | L4 | L2 | En route | En route | DR1 | — | P3 intent |
| 1 | L2 | L3 | L2 | Arriving L1 | ETA 25 min | Team arrives: DR1–3 | SPOT on patrol | Berry pickers possibly in forest |
| 2 | L2 | L3 | L2 | L1 | ETA 5 min | DR3 mapping loop | | EK11 and EK14 agree a boundary (T4) |
| 3 | L2 ridge | L3 | L2 | L1 | Arrives, L3 | DR1 on ridge fire | | Thunderstorm line north of area |
| 4 | L2 | L4 | L2 | L1 | L3 | DR2 link drop 3 min (F1) | | `t4.water_state`: W1 low |
| 5 | L2 | L4 | L2 → SPR edge | L1 | L3 | DR3 thermal on SPR | | |
| 6 | L2 withdraws | L4 | **Near-miss, withdraws** | L1 | L3 | DR3 thermal saturated (F4) | SPOT reports crown fire | `t4.ember_warning` (from cycle 4); grid operator call |
| 7 | L2 BIRCH | L4 | Status stale (F2) | L1 | L3 | DR2 battery low (T4 warning) | HELI1 ETA 20 min | **Escalation to company** requested |
| 8 | L2 | L4 | L2 | L1 | L3 | **DR1, DR3 grounded** (heli area N of R1); DR2 over L3 only | **HELI1 working head** | Satellite hotspots from cycle 6 appear (F5) |
| 9 | L2 | L4 | L2 | L1, radio dead zone (F3) | L3 | DR2 battery swap | HELI1 | Cabin occupancy unknown; POL contacted |
| 10 | "In hand" | L3 | "In hand" | "In hand", voice only | L3 | DR3 relaunch, rain on optics | HELI1 refuelling | EK15 arrives |
| **Hinge** | | | | | | | | P3 guidance |
| 11 | Relief planning | L3, private doubt | L2 | L1 | L3 | DR1 to LAKE-N cabins | HELI1 on standby | EK16, KY23 arrive |
| 12 | L2 | L3 | L2 | L1 | L3 → SE | DR2 to BOG-S | — | **Surfacing fire in BOG-S** |
| 13 | → L3 | L3 | L2 | L1 | L3 | DR2 | — | R2 cut; FARM tankers offered |
| 14 | L3 | L3 | L2 | L1 | **Release requested** | **DR3 release requested** | — | Second incident crews on shared group (T4) |
| 15 | L3 | L3 | L3 | L1 | L3 | DR2 | — | Wetting agent short; hose short (Sweden 2018) |
| 16 | L3 | L4 | L3 | L1 | L3 | DR1 | SAR image arrives | OUT1, OUT2, UGV1 arrive; BRIDGE blocks heavy tanker |
| 17 | L3 SE | Evacuation help | L3 | L1 | L3 | DR1 over VILLAGE-E | HELI1 recalled to other fire | POL: evacuation advisory; public warning |
| 18 | L3 | VILLAGE-E | L3 | L1 line holding | L3 | DR2 | **SPOT: north flank accelerating** | Lateral traffic reconciles |
| 19 | **Crew ~7.5 h on task** | Rotating | L3 | L1 | L3 | DR1 | — | UGV1 stuck; heat-stress readings high on EK11 |
| 20 | Handover | Handover | Handover | Handover | Handover | Handover | — | Night organisation arrives |

---

## 9. Values at risk

| Id | What | Where | People | Becomes critical |
|---|---|---|---|---|
| V1 | 14 cabins, Mökkiranta | LAKE-N | Occupancy unknown until cycle 17 (holiday Friday) | Cycle 9 |
| V2 | Village: 9 houses, 2 farms with livestock | VILLAGE-E | ~25 residents | Cycle 17 |
| V3 | Berry pickers | Forest, unknown | Unknown | Cycle 1 |
| V4 | 110 kV power line | PL | — | Cycle 6 |
| V5 | Water shuttle route | R2 | — | Cycle 13 |
| V6 | Salpa Line structures (protected heritage) | SALPA | — | Cycle 19 |
| V7 | Crews | All | ~30 → ~50 | Cycles 6, 19 |

---

## 10. Injected faults (Ruest-style fault campaign)

Authored, deterministic, and logged as truth.

| Id | Cycle | Fault | What the participant can notice |
|---|---|---|---|
| F1 | 4 | DR2 data link drops for 3 minutes | Frozen footprint, stale timestamp |
| F2 | 7 | EK12 AVL position drifts 400 m | Position disagrees with the crew's radio report |
| F3 | 9–10 | Radio dead zone in VALLEY-N | EK14 traffic becomes voice-relayed, logged without content |
| F4 | 6 | DR3 thermal saturation over the crown fire | Implausibly uniform hot area; perimeter unusable |
| F5 | 6 → 8 | Satellite hotspots from the crown run arrive two cycles late | Hotspots appear where fire already was |
| F6 | 12 | Rain-cooled surface hides smouldering from thermal | Only steam visible; the omission |

---

## 11. Where each lesson appears

| Lesson | Source | Cycle(s) |
|---|---|---|
| Ignition from forestry work | Västmanland 2014 | W1 |
| Multiple ignitions, including lightning | Ljusdal 2018 | 3 (ambiguous), hinge (three fires in region) |
| Weather services underused; gust forecast available but not pushed | Kalajoki 2021 | W4, 5–6 |
| Slow, cautious start; escalation late | SOU 2019:7; Kalajoki | 7 (escalation), 8 (helicopter late) |
| Surveillance-aircraft reports delayed or not entered | Kalajoki | 6, 18 |
| Apparent control, then re-ignition from smouldering ditch spoil | Kalajoki | 10–12 |
| Operations ended too early; rule against early release | SOU 2019:7 | Hinge rule 3, 14 |
| Water supply fails when most needed | Kalajoki | 4, 13 |
| Shortages of hose, pumps, wetting agent | SOU 2019:7 | 15 |
| Civilians as resources, outside command | Ljusdal 2018; Kalajoki farmers | W1, 13, 17 |
| Unclear responsibility when the region steps in | Ljusdal 2018 | 14 |
| Unfamiliar reinforcements, load limits | SOU 2019:7 | 16 |
| Long shifts and fatigue | Kalajoki | 19 |
| Provenance on every observation; unknown shown as unknown | wildfire-robotics | All atoms |
| Authored fault campaign | wildfire-robotics | §10 |
| Authorisation separated from decision | wildfire-robotics | Drone tasking: operator proposes, PTJ authorises, logged as separate events |

---

## 12. Changes applied to `03` (revision (g))

| Item | Change |
|---|---|
| Cycle 1 title | "Arrival" → **"Command handover"** (*Johtovastuun siirto*), since the prologue covers arrival |
| §7.3 worked example (crown-run gap at 17:12–18:51) | Re-time to the crown run at cycles 5–7: **gap 14:52–16:05** |
| §4 starting force | "Four formations plus a drone" → four formations, a volunteer brigade, a three-aircraft drone team and a civilian harvester |
| §4.1 cycle 8 | "Drone grounded" → DR1 and DR3 grounded north of R1; DR2 keeps flying over L3 |
| §4.1 cycle 14 | Released formations → KY21 and DR3 requested by the region |
| §8 channel vocabulary | Not needed while the AI is pull-only; keep for a later study |
| §10 budget | Add: 5 prologue cycles, 2 civilian resources, fault events F1–F6, satellite and SAR layers |

---

## 13. Questions for the domain reviewer

1. Are the ROS values and the 170 ha end state plausible for this terrain and weather?
2. Would a *joukkueenjohtaja* take command at 13:20 for an 11 ha fire, and escalate at cycle 7?
3. Is a three-aircraft drone team realistic for a southeast-Finland department by 2030? Grounding rule with a helicopter?
4. Is the ditch-spoil re-ignition mechanism recognised in this region?
5. Is the hinge guidance realistic in content and wording, and would a duty officer issue it at 16:40?
6. Does the region realistically request KY21 and the VTOL drone for another fire?
7. Call signs, record fields and Finnish register throughout.
8. Is harvester line-digging and farmers' tanker use realistic, and how would it be recorded?
