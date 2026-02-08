## Inspiration

Wildfires are getting worse every year. In 2023 alone, Canada lost over 18 million hectares to fire — more than double any previous record. When fires break out, responders are forced to piece together information from scattered sources: one website for satellite detections, another for weather, a phone call for terrain info, a PDF map for perimeters. Critical minutes are lost just figuring out what's happening.

We asked ourselves: what if all of that information — fire location, weather, terrain, population risk, containment status — was in one place, updated in real time, and available the moment a fire is detected from space?

That's SparkGuard.

## What it does

SparkGuard is a real-time wildfire monitoring platform that displays live satellite fire detections on an interactive 3D globe. When you click on any fire hotspot anywhere on Earth, you instantly get a complete responder briefing pulled from 5 different live APIs:

- **Live fire detections** from NASA's VIIRS satellite (NOAA-20), updated throughout the day
- **Current weather on scene** — temperature, wind speed and direction, gusts, humidity, precipitation, plus a full 24-hour forecast from MET Norway
- **Region intelligence** — what biome the fire is in, what vegetation is burning, fuel type, land cover, dryness index, and whether any protected areas are nearby — all queried from OpenStreetMap in real time
- **Population risk assessment** — nearest city, population, and a risk level based on proximity to residential areas
- **Fire perimeter boundaries** for active US fires (from NIFC/WFIGS) and Canadian fires (from CWFIS), showing acreage and containment percentage

Everything on screen is live. There is zero mock data, zero historical datasets, and zero hardcoded values. Every number comes from a real API call.

The platform also generates one-click **Responder Briefs** — structured summaries that combine all available data into a single document a first responder can read in 30 seconds.

## How we built it

The frontend is built with **React 18 and TypeScript**, bundled with **Vite**, and styled with **Tailwind CSS**. The 3D globe uses **react-globe.gl** (built on Three.js) with NASA Blue Marble textures.

The real complexity is in the data layer. We wrote service adapters for each external API:

- **NASA FIRMS** — fetches VIIRS NOAA-20 near-real-time CSV data, parses it, maps confidence values (which come as single characters like 'h', 'n', 'l'), and downsamples to 2,000 points using reservoir sampling that prioritizes the highest-intensity fires
- **MET Norway Locationforecast 2.0** — proxied through Vite's dev server to attach the required User-Agent header, returns current conditions and 24-hour forecast
- **OSM Overpass API** — queries land use, natural cover, and protected area boundaries within a radius of the clicked point, then derives biome, vegetation type, and fuel type from the raw OpenStreetMap tags
- **OSM Nominatim** — reverse geocodes coordinates to get country, state, nearest city, and population
- **Open-Meteo** — provides humidity and precipitation data which we combine into a dryness index (0–100), plus elevation
- **WFIGS (ArcGIS REST)** and **CWFIS (GeoServer WFS)** — fetch active fire perimeter polygons with pagination support

Every service has its own TTL cache (5–30 minutes depending on the data) to stay within rate limits and keep the UI snappy. When a user clicks a fire, we fire all the API calls in parallel so the panel populates as fast as possible.

## Challenges we ran into

**Dead satellites.** We initially built against the VIIRS SNPP product, which was the standard for years. Midway through development we discovered it was returning completely empty responses — just CSV headers with zero rows. After testing multiple products via curl, we found that NOAA-20 and NOAA-21 were the active ones and switched.

**Confidence format mismatch.** NASA's documentation says VIIRS confidence values are "low", "nominal", or "high". The actual API returns single characters: 'l', 'n', 'h'. Our parser was looking for full words and marking everything as 50% confidence. We had to handle both formats.

**Performance on the globe.** VIIRS can return thousands of detections in a single day. Rendering all of them as 3D points tanked the frame rate. We implemented a reservoir sampling algorithm that caps rendering at 2,000 points but guarantees the top 40% highest-FRP fires are always included — so the most dangerous fires are never dropped.

**Overpass API speed.** The OSM Overpass API can take 2–8 seconds to respond depending on the region. We had to design the UI with proper async loading states so the panel feels responsive even while region data is still coming in, and cache aggressively to avoid repeat queries.

**CORS and proxy headaches.** MET Norway requires a custom User-Agent header, which browsers silently strip from fetch requests. We had to set up a Vite proxy that rewrites the request server-side and injects the header.

## Accomplishments that we're proud of

- **Every single piece of data is real.** We started with mock data and systematically replaced every fake function with a live API call. The biome, vegetation, fuel type, dryness index, population risk, weather, perimeters — all of it comes from actual data sources, not lookup tables.

- **The region intelligence system.** We combine three separate APIs (Overpass, Nominatim, Open-Meteo) into a single unified Region Intelligence response that tells you the biome, what's burning, how dry it is, who lives nearby, and what's protected — all derived from real geospatial data, not latitude-band approximations.

- **It actually works globally.** Click a fire in Australia, Brazil, Siberia, or California — the system returns meaningful, accurate data for all of them. The APIs are global and so is SparkGuard.

- **The responder brief.** One click generates a structured summary that includes satellite detection data, live weather, region context, and risk assessment. It's designed to be readable in under 30 seconds.

- **Selection UX on the globe.** When you click a fire, the globe stops rotating, zooms into the location, places a bright white marker on top, and pulses a blue ring outward from the point — making it immediately obvious which detection you're inspecting.

## What we learned

- **Public APIs are powerful but fragile.** NASA, MET Norway, OpenStreetMap, and Open-Meteo provide incredible data for free — but each has quirks: undocumented format changes, rate limits, CORS restrictions, and occasional downtime. Building resilient adapters with caching, error handling, and fallback logic is just as important as the feature itself.

- **Real data is messier than mock data.** Mock data always looks perfect. Real satellite CSV has inconsistent confidence formats, empty payloads, and products that silently stop returning results. Testing against live APIs early saves a lot of pain later.

- **Performance is a feature.** A globe with 5,000 fire points looks impressive for a screenshot but runs at 3 FPS. Smart downsampling — keeping the most important fires, dropping redundant ones — made the difference between a demo that stutters and one that feels polished.

- **Parallel API calls matter.** Loading weather, region data, and geocoding sequentially would mean 5–10 seconds of waiting. Firing them all in parallel with `Promise.all` and rendering each section as it arrives makes the experience feel instant.

## What's next for SparkGuard

- **Fire spread prediction** — using wind direction, speed, terrain slope, and fuel type to project where a fire is likely to move in the next 6–12 hours
- **Push notifications** — configurable alerts when a new fire is detected in a region of interest (email, SMS, webhook)
- **Historical analysis** — overlay past fire data to identify high-risk zones and seasonal patterns
- **AI-generated responder briefs** — use an LLM to turn raw data into natural-language tactical recommendations tailored to the specific terrain and conditions
- **Mobile-optimized view** — a simplified interface for responders in the field who need information on a phone screen
- **Custom monitoring zones** — let agencies define geographic areas they're responsible for and only surface relevant detections
