/**
 * SparkGuard — Region Intelligence service.
 *
 * Fetches REAL land cover, biome, vegetation, protected areas,
 * dryness, and population risk data from free public APIs:
 *
 *   1. OSM Overpass API  → land use, natural cover, protected areas
 *   2. OSM Nominatim     → country, state, city, population
 *   3. Open-Meteo        → humidity (dryness proxy), elevation
 *
 * All APIs are free, no keys required.
 * Results are cached for 30 minutes to respect rate limits.
 */

import { TTLCache } from './cache'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RegionIntelligence {
  biome: string
  vegetation: string
  fuelType: string
  landCover: string
  drynessIndex: number             // 0–100, derived from humidity + precip
  populationRisk: 'Low' | 'Moderate' | 'High' | 'Critical'
  protectedAreas: string[]
  elevation: number | null         // meters
  country: string | null
  region: string | null            // state/province
  nearestPlace: string | null      // city/town
  population: number | null
  dataSource: 'live'
}

// ─── Cache (30-minute TTL) ──────────────────────────────────────────────────

const cache = new TTLCache<RegionIntelligence>(30 * 60 * 1000)

// ─── Nominatim: reverse geocode ─────────────────────────────────────────────

interface NominatimResult {
  country: string | null
  state: string | null
  city: string | null
  population: number | null
}

async function reverseGeocode(lat: number, lon: number): Promise<NominatimResult> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat.toFixed(5)}&lon=${lon.toFixed(5)}&format=json&zoom=10&extratags=1`
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SparkGuard/1.0 (github.com/sparkguard)' },
    })
    if (!res.ok) return { country: null, state: null, city: null, population: null }

    const data = await res.json()
    const addr = data.address ?? {}
    const pop = data.extratags?.population
      ? parseInt(data.extratags.population, 10)
      : null

    return {
      country: addr.country ?? null,
      state: addr.state ?? addr.province ?? null,
      city: addr.city ?? addr.town ?? addr.village ?? addr.hamlet ?? null,
      population: isNaN(pop as number) ? null : pop,
    }
  } catch {
    return { country: null, state: null, city: null, population: null }
  }
}

// ─── Overpass: land use + natural + protected areas ─────────────────────────

interface OverpassResult {
  landUse: string[]
  natural: string[]
  protectedAreas: string[]
}

async function queryOverpass(lat: number, lon: number): Promise<OverpassResult> {
  try {
    const query = `[out:json][timeout:8];
is_in(${lat.toFixed(5)},${lon.toFixed(5)})->.a;
area.a["landuse"];out tags 3;
area.a["natural"];out tags 3;
area.a["boundary"~"protected_area|national_park"];out tags 3;
area.a["leisure"~"nature_reserve|park"];out tags 3;`

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    if (!res.ok) return { landUse: [], natural: [], protectedAreas: [] }

    const data = await res.json()
    const elements: any[] = data.elements ?? []

    const landUse = new Set<string>()
    const natural = new Set<string>()
    const protectedAreas = new Set<string>()

    for (const el of elements) {
      const tags = el.tags ?? {}
      if (tags.landuse) landUse.add(tags.landuse)
      if (tags.natural) natural.add(tags.natural)
      if (tags.name && (tags.boundary || tags.leisure === 'nature_reserve')) {
        protectedAreas.add(tags.name)
      }
    }

    return {
      landUse: [...landUse],
      natural: [...natural],
      protectedAreas: [...protectedAreas],
    }
  } catch {
    return { landUse: [], natural: [], protectedAreas: [] }
  }
}

// ─── Open-Meteo: humidity + elevation for dryness ───────────────────────────

interface MeteoResult {
  humidity: number | null       // %
  precipitation: number | null  // mm in last hour
  elevation: number | null      // meters
}

async function queryOpenMeteo(lat: number, lon: number): Promise<MeteoResult> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=relative_humidity_2m,precipitation&timezone=auto&forecast_days=1`
    const res = await fetch(url)
    if (!res.ok) return { humidity: null, precipitation: null, elevation: null }

    const data = await res.json()
    return {
      humidity: data.current?.relative_humidity_2m ?? null,
      precipitation: data.current?.precipitation ?? null,
      elevation: data.elevation ?? null,
    }
  } catch {
    return { humidity: null, precipitation: null, elevation: null }
  }
}

// ─── Derived intelligence ───────────────────────────────────────────────────

/**
 * Infer biome from latitude + real Overpass natural/landuse data.
 * Uses the real OSM data to refine beyond just latitude bands.
 */
function deriveBiome(lat: number, overpass: OverpassResult): string {
  const absLat = Math.abs(lat)
  const { natural, landUse } = overpass

  // Check OSM tags for specific indicators
  if (natural.includes('wood') || natural.includes('tree') || landUse.includes('forest')) {
    if (absLat > 55) return 'Boreal / Taiga'
    if (absLat > 40) return 'Temperate Forest'
    if (absLat > 25) return 'Subtropical Forest'
    return 'Tropical Forest'
  }
  if (natural.includes('grassland') || landUse.includes('meadow') || landUse.includes('grass')) {
    if (absLat > 40) return 'Temperate Grassland'
    if (absLat > 15) return 'Savanna / Tropical Grassland'
    return 'Tropical Savanna'
  }
  if (natural.includes('scrub') || natural.includes('heath') || landUse.includes('scrub')) {
    return absLat > 30 ? 'Mediterranean Scrubland' : 'Tropical Scrubland'
  }
  if (natural.includes('wetland') || natural.includes('marsh') || natural.includes('swamp')) {
    return 'Wetland / Marsh'
  }
  if (natural.includes('desert') || natural.includes('sand') || natural.includes('bare_rock')) {
    return absLat > 35 ? 'Cold Desert / Steppe' : 'Hot Desert / Arid'
  }
  if (landUse.includes('farmland') || landUse.includes('orchard') || landUse.includes('vineyard')) {
    return 'Agricultural / Cropland'
  }
  if (landUse.includes('residential') || landUse.includes('commercial') || landUse.includes('industrial')) {
    return 'Urban / Developed'
  }

  // Fallback to latitude-based classification
  if (absLat < 10) return 'Tropical'
  if (absLat < 25) return 'Subtropical'
  if (absLat < 40) return 'Mediterranean / Temperate'
  if (absLat < 55) return 'Temperate / Boreal Transition'
  return 'Boreal / Subarctic'
}

/** Derive vegetation description from real Overpass data */
function deriveVegetation(overpass: OverpassResult): string {
  const all = [...overpass.natural, ...overpass.landUse]
  const parts: string[] = []

  if (all.includes('wood') || all.includes('forest')) parts.push('Forest')
  if (all.includes('tree')) parts.push('Scattered trees')
  if (all.includes('scrub') || all.includes('heath')) parts.push('Scrubland')
  if (all.includes('grassland') || all.includes('meadow') || all.includes('grass')) parts.push('Grassland')
  if (all.includes('wetland') || all.includes('marsh')) parts.push('Wetland')
  if (all.includes('farmland') || all.includes('orchard')) parts.push('Cropland')
  if (all.includes('vineyard')) parts.push('Vineyard')
  if (all.includes('residential')) parts.push('Urban vegetation')

  return parts.length > 0 ? parts.join(', ') : 'Not classified'
}

/** Derive fuel type from real Overpass data + biome */
function deriveFuelType(biome: string, overpass: OverpassResult): string {
  const all = [...overpass.natural, ...overpass.landUse]

  if (all.includes('scrub') || all.includes('heath')) return 'Shrub + dry brush'
  if (all.includes('grassland') || all.includes('meadow')) return 'Grass + herbaceous'
  if (biome.includes('Boreal') || biome.includes('Taiga')) return 'Conifer needle litter + peat'
  if (biome.includes('Temperate Forest')) return 'Broadleaf litter + deadfall'
  if (biome.includes('Mediterranean')) return 'Chaparral + dead wood'
  if (biome.includes('Tropical')) return 'Heavy organic litter'
  if (all.includes('farmland')) return 'Crop residue + stubble'
  if (all.includes('forest') || all.includes('wood')) return 'Mixed forest litter'
  return 'Variable / mixed'
}

/** Derive land cover description from Overpass */
function deriveLandCover(overpass: OverpassResult): string {
  const uses = overpass.landUse
  const nats = overpass.natural

  if (uses.length === 0 && nats.length === 0) return 'Unclassified'

  const parts: string[] = []
  if (uses.length > 0) parts.push(...uses.slice(0, 3).map(capitalize))
  if (nats.length > 0) parts.push(...nats.slice(0, 2).map(capitalize))

  return parts.join(', ')
}

/** Compute a dryness index from real humidity + precipitation data */
function computeDrynessIndex(meteo: MeteoResult): number {
  if (meteo.humidity == null) return 50 // unknown → neutral

  // Lower humidity = higher dryness; no precip = drier
  const humidityFactor = 100 - meteo.humidity // 0–100
  const precipFactor = meteo.precipitation != null
    ? Math.max(0, 20 - meteo.precipitation * 10) // less precip → higher dryness
    : 10

  const raw = humidityFactor * 0.75 + precipFactor * 1.25
  return Math.round(Math.max(0, Math.min(100, raw)))
}

/** Derive population risk from real population data + land use */
function derivePopulationRisk(
  nominatim: NominatimResult,
  overpass: OverpassResult,
): 'Low' | 'Moderate' | 'High' | 'Critical' {
  const uses = overpass.landUse

  // Urban/residential areas
  if (uses.includes('residential') || uses.includes('commercial')) {
    if (nominatim.population && nominatim.population > 500_000) return 'Critical'
    if (nominatim.population && nominatim.population > 100_000) return 'High'
    return 'High'
  }

  // Near a populated place
  if (nominatim.city || nominatim.population) {
    if (nominatim.population && nominatim.population > 1_000_000) return 'Critical'
    if (nominatim.population && nominatim.population > 200_000) return 'High'
    return 'Moderate'
  }

  // Remote / wilderness
  return 'Low'
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch real region intelligence for a given coordinate.
 *
 * Combines data from 3 free APIs:
 *   - OSM Nominatim (reverse geocode)
 *   - OSM Overpass (land use, natural areas, protected areas)
 *   - Open-Meteo (humidity for dryness index)
 *
 * Results are cached for 30 minutes.
 */
export async function fetchRegionIntelligence(
  lat: number,
  lon: number,
): Promise<RegionIntelligence> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  // Fire all 3 API calls in parallel
  const [nominatim, overpass, meteo] = await Promise.all([
    reverseGeocode(lat, lon),
    queryOverpass(lat, lon),
    queryOpenMeteo(lat, lon),
  ])

  const biome = deriveBiome(lat, overpass)

  const result: RegionIntelligence = {
    biome,
    vegetation: deriveVegetation(overpass),
    fuelType: deriveFuelType(biome, overpass),
    landCover: deriveLandCover(overpass),
    drynessIndex: computeDrynessIndex(meteo),
    populationRisk: derivePopulationRisk(nominatim, overpass),
    protectedAreas: overpass.protectedAreas.slice(0, 5), // top 5
    elevation: meteo.elevation,
    country: nominatim.country,
    region: nominatim.state,
    nearestPlace: nominatim.city,
    population: nominatim.population,
    dataSource: 'live',
  }

  cache.set(cacheKey, result)
  return result
}
