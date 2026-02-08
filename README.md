# 🔥 SparkGuard

**Real-time wildfire monitoring powered by satellite intelligence — bringing live fire detection, weather conditions, and region analysis onto an interactive 3D globe for first responders.**

Built for the **Upstart Competition (GCES Concordia)** under the themes of **Health & Wellness** and **Smart Systems**.

---

## What It Does

SparkGuard pulls **live data from 5 free public APIs** and displays it on an interactive 3D globe. Click any fire hotspot on Earth and instantly get:

- **Where it is** — real-time satellite-detected fire location, coordinates, and nearest populated area
- **What's burning** — biome, vegetation type, fuel type, and land cover pulled from OpenStreetMap
- **How dangerous it is** — fire intensity (MW), dryness index, population risk, and protected areas nearby
- **Current weather on scene** — temperature, wind speed & direction, gusts, humidity, and precipitation from MET Norway
- **How the fire is contained** — official fire perimeter boundaries and containment status for US and Canadian fires

Everything is live. No mock data, no historical datasets, no simulations.

---

## Live Data Sources

Every piece of information displayed comes from a real API queried in real time:

| What | Source | What It Gives Us |
|------|--------|------------------|
| 🔥 **Fire hotspots** | [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/) (VIIRS NOAA-20 satellite) | Fire locations worldwide — intensity (FRP), brightness temperature, confidence, day/night |
| 🌤️ **Weather** | [MET Norway Locationforecast 2.0](https://api.met.no/) | Temperature, humidity, wind speed & gusts, wind direction, precipitation, 24h forecast |
| 🗺️ **Region intelligence** | [OpenStreetMap Overpass API](https://overpass-api.de/) | Land use, natural cover, protected area names, biome classification |
| 📍 **Reverse geocoding** | [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) | Country, state/province, nearest city, population data |
| 🌡️ **Dryness & elevation** | [Open-Meteo](https://open-meteo.com/) | Relative humidity, precipitation (→ dryness index), elevation in meters |
| 🔶 **US fire perimeters** | [WFIGS](https://data-nifc.opendata.arcgis.com/) (NIFC ArcGIS) | Active fire boundary polygons, acreage, containment %, discovery date |
| 🔷 **Canada fire perimeters** | [CWFIS](https://cwfis.cfs.nrcan.gc.ca/) (GeoServer WFS) | Active fire boundary polygons for Canadian wildfires |

> **API keys:** Only NASA FIRMS requires a free API key. All other services are completely open.

---

## Features

### 🌍 Interactive 3D Globe
- Full-viewport Three.js globe with NASA Blue Marble textures
- Fire hotspots colored by intensity — green (low) → yellow → orange → red (extreme)
- Click any hotspot to select it — the globe stops rotating, zooms in, and highlights the point with a bright pulsing ring
- Fire perimeter polygons overlaid for US (red) and Canadian (blue) fires
- Pulsing rings on high-intensity fires (FRP > 50 MW) for visual emphasis
- Smart downsampling — renders up to 2,000 points for smooth performance while preserving the most intense fires

### 📋 Responder Panel
- **Key facts** — date, intensity (MW), confidence (%), severity rating, brightness temperature, day/night
- **Region Intelligence** (live) — biome, vegetation, fuel type, land cover, dryness index (0–100 bar), population risk level, nearest place, elevation, protected areas
- **Weather** (live) — current conditions + 24-hour forecast in 3-hour intervals + wind risk assessment
- **Responder Brief** — one-click generated summary combining all live data into a structured briefing document
- **Export** — download full detection data as JSON

### 🔎 Globe Controls
- Time range selector: 24h / 48h / 7 days of fire data
- Fire perimeter toggle with source filter (US / Canada / Both)
- Detection count and last-updated timestamp
- Manual refresh

---

## How It Works

```
NASA FIRMS API ──→ VIIRS CSV ──→ Parse & downsample ──→ 3D Globe points
                                                          │
User clicks a point ──→ Globe stops + highlights ─────────┤
                                                          │
                    ┌─────────────────────────────────────┘
                    ▼
              InfoPanel loads (in parallel):
                ├─ MET Norway ──→ Weather + 24h forecast
                ├─ OSM Overpass ──→ Land use, biome, protected areas
                ├─ OSM Nominatim ──→ Country, city, population
                └─ Open-Meteo ──→ Humidity, elevation → dryness index
                    │
                    ▼
              Responder view with all live data
```

All API responses are cached in memory (weather: 15 min, region data: 30 min, FIRMS: 5 min) so repeated queries are instant and rate limits are respected.

---

## Impact

### Health & Wellness
- **Faster situational awareness** — responders see fire conditions before arriving on scene
- **Reduced smoke exposure** — earlier detection enables smaller, faster interventions
- **Responder safety** — wind, humidity, and terrain data help assess risk before deployment

### Sustainability
- **Prevention-oriented** — early satellite detection enables containment while fires are small
- **Reduced burned area** — faster response protects ecosystems and reduces carbon emissions
- **Efficient resource allocation** — severity and region data help prioritize response

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- A modern browser with WebGL support (Chrome, Firefox, Safari, Edge)

### Install & Run

```bash
# Clone
git clone https://github.com/Lekerj/SparkGuard.git
cd SparkGuard

# Install dependencies
npm install

# Start development server
npm run dev
```

The app opens at `http://localhost:5173`.

### NASA FIRMS API Key (Free)

You need a free NASA API key to load live fire data:

1. Create a free account at [NASA Earthdata](https://urs.earthdata.nasa.gov/users/new)
2. Request a MAP_KEY at [FIRMS API](https://firms.modaps.eosdis.nasa.gov/api/area/)
3. Create a `.env` file in the project root:
   ```
   VITE_FIRMS_API_KEY=your_key_here
   ```
4. Restart the dev server

> All other APIs (MET Norway, OSM, Open-Meteo, WFIGS, CWFIS) require **no keys** — they're completely open.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── FireGlobe.tsx          # 3D globe with points, rings, polygons, selection
│   ├── InfoPanel.tsx          # Right panel — responder view, weather, region intel
│   ├── GlobeControls.tsx      # Time range, perimeter toggles, search
│   ├── FireDetectionPanel.tsx # Detection list for the Home page
│   ├── ErrorBoundary.tsx      # React error boundary wrapper
│   ├── FutureSection.tsx      # Placeholder section for future features
│   ├── layout/                # Header, Footer, AppLayout, Container
│   └── ui/                    # Reusable UI primitives (Badge, Button, etc.)
├── services/
│   ├── firms.ts               # NASA FIRMS VIIRS fire detection API
│   ├── weatherMetNo.ts        # MET Norway Locationforecast 2.0
│   ├── regionIntelligence.ts  # OSM Overpass + Nominatim + Open-Meteo
│   ├── wfigs.ts               # US fire perimeters (NIFC ArcGIS)
│   ├── cwfis.ts               # Canada fire perimeters (GeoServer WFS)
│   └── cache.ts               # TTL cache + bbox utilities
├── data/
│   ├── fireDataService.ts     # FIRMS adapter — parse, confidence map, downsample
│   ├── perimeterService.ts    # WFIGS + CWFIS fetching with pagination
│   └── teamMembers.ts         # Team member data
├── hooks/
│   ├── useFireData.ts         # React hook — live FIRMS data + auto-refresh
│   └── useFirePerimeters.ts   # React hook — live perimeters + source filter
├── pages/
│   ├── GlobeExplorer.tsx      # Main page — globe + controls + info panel
│   ├── Home.tsx               # Landing page with hero section
│   ├── Comparison.tsx         # Imagery comparison page
│   └── Team.tsx               # Team profiles
├── types/
│   ├── fireData.ts            # FirePoint type
│   ├── firePerimeter.ts       # FirePerimeter type
│   └── wildfireEvent.ts       # WildfireEvent + RegionIntelligence types
└── App.tsx                    # Router (/, /comparison, /team)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5.3 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 3.4 |
| 3D Globe | react-globe.gl (Three.js) |
| Animation | Framer Motion |
| Routing | React Router v6 |
| Icons | Lucide React |

### External APIs (all free, no cost)

| API | Used For | Auth |
|-----|----------|------|
| NASA FIRMS | Fire hotspot detections (VIIRS NOAA-20) | Free API key |
| MET Norway | Weather + forecast | None (User-Agent required) |
| OSM Overpass | Land use, biome, protected areas | None |
| OSM Nominatim | Reverse geocoding, population | None |
| Open-Meteo | Humidity, precipitation, elevation | None |
| WFIGS (NIFC) | US fire perimeters | None |
| CWFIS (NRCan) | Canada fire perimeters | None |

---

## Team

| Name | Role |
|------|------|
| [Ahmed E.] | Software Developer |
| [Ahmed G.] | Software Developer |
| [Mohammed J.] | Software Developer |

---

## License

MIT

---

## Why This Is Feasible

SparkGuard is designed around **existing, accessible infrastructure**:

1. **Public satellite data is available today** — NASA FIRMS, Sentinel, and others provide free or low-cost fire detection feeds.
2. **Modular integrations** — the platform connects to external systems via standard APIs and export formats, minimizing custom development.
3. **AI is assistive, not autonomous** — we use proven classification techniques with human oversight, avoiding regulatory and liability complexity of fully autonomous systems.

The core innovation is **integration and interpretation** — bringing fragmented data into a unified view and translating it into actionable guidance for responders.

---

<p align="center">
  <strong>SparkGuard</strong> · Built for <a href="#">Upstart @ GCES Concordia</a> · Health & Wellness · Smart Systems
</p>


