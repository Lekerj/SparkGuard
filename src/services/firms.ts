/**
 * SparkGuard — NASA FIRMS live fire detection service.
 *
 * Fetches active fire hotspots from NASA FIRMS (Fire Information for Resource
 * Management System) using the MAP_KEY from .env.
 *
 * Product: VIIRS (SNPP + NOAA-20)
 * Output: CSV (parsed to FireDetection[])
 *
 * API docs: https://firms.modaps.eosdis.nasa.gov/api/area/
 */

import { TTLCache, type BBox, WORLD_BBOX } from './cache'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FireDetection {
  lat: number
  lng: number
  frp: number         // Fire Radiative Power (MW)
  brightness: number  // Brightness temperature (K)
  confidence: string  // 'low' | 'nominal' | 'high'
  date: string        // YYYY-MM-DD
  time: string        // HH:MM (UTC)
  daynight: 'D' | 'N'
  satellite: string   // 'N' (NOAA-20) | 'S' (Suomi NPP)
  instrument: string  // 'VIIRS'
}

export type FIRMSTimeRange = '24h' | '48h' | '7d'

// ─── Constants ──────────────────────────────────────────────────────────────

const FIRMS_BASE = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv'

/**
 * VIIRS product to query. SNPP is no longer returning data as of early 2026.
 * NOAA-20 and NOAA-21 are the active satellites.
 */
const VIIRS_PRODUCT = 'VIIRS_NOAA20_NRT'

/** Map our time range labels to the FIRMS `day_range` parameter */
const TIME_RANGE_MAP: Record<FIRMSTimeRange, string> = {
  '24h': '1',
  '48h': '2',
  '7d':  '7',
}

// ─── Cache (5-minute TTL) ───────────────────────────────────────────────────

const cache = new TTLCache<FireDetection[]>(5 * 60 * 1000)

// ─── Helpers ────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = import.meta.env.VITE_FIRMS_API_KEY
  if (!key) {
    console.warn('⚠️  VITE_FIRMS_API_KEY is not set — FIRMS requests will fail.')
  }
  return key ?? ''
}

/**
 * Parse FIRMS CSV response into FireDetection[].
 * VIIRS CSV columns (SNPP/NOAA-20):
 *   latitude,longitude,bright_ti4,scan,track,acq_date,acq_time,satellite,
 *   instrument,confidence,version,bright_ti5,frp,daynight
 */
function parseFIRMSCsv(csv: string): FireDetection[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const header = lines[0].split(',')
  const latIdx = header.indexOf('latitude')
  const lngIdx = header.indexOf('longitude')
  const frpIdx = header.indexOf('frp')
  const brightIdx = header.indexOf('bright_ti4')
  const confIdx = header.indexOf('confidence')
  const dateIdx = header.indexOf('acq_date')
  const timeIdx = header.indexOf('acq_time')
  const dnIdx = header.indexOf('daynight')
  const satIdx = header.indexOf('satellite')
  const instrIdx = header.indexOf('instrument')

  const detections: FireDetection[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < header.length) continue

    const frp = parseFloat(cols[frpIdx])
    const brightness = parseFloat(cols[brightIdx])
    const lat = parseFloat(cols[latIdx])
    const lng = parseFloat(cols[lngIdx])

    if (isNaN(lat) || isNaN(lng)) continue

    detections.push({
      lat,
      lng,
      frp: isNaN(frp) ? 0 : frp,
      brightness: isNaN(brightness) ? 0 : brightness,
      confidence: cols[confIdx] ?? 'nominal',
      date: cols[dateIdx] ?? '',
      time: cols[timeIdx] ?? '',
      daynight: (cols[dnIdx] === 'D' ? 'D' : 'N') as 'D' | 'N',
      satellite: cols[satIdx] ?? '',
      instrument: cols[instrIdx] ?? 'VIIRS',
    })
  }

  return detections
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch VIIRS fire detections from NASA FIRMS.
 *
 * @param timeRange  '24h' | '48h' | '7d'
 * @param bbox       Bounding box for spatial filtering (default: world)
 * @returns          Array of fire detections
 */
export async function fetchFIRMSDetections(
  timeRange: FIRMSTimeRange = '24h',
  bbox: BBox = WORLD_BBOX,
): Promise<FireDetection[]> {
  const cacheKey = TTLCache.bboxKey(bbox, timeRange)
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const apiKey = getApiKey()
  if (!apiKey) throw new Error('FIRMS API key not configured')

  const dayRange = TIME_RANGE_MAP[timeRange]

  // FIRMS area API: /csv/{API_KEY}/{PRODUCT}/{bbox}/{dayRange}
  // bbox format: west,south,east,north
  const bboxStr = `${bbox.west},${bbox.south},${bbox.east},${bbox.north}`
  const url = `${FIRMS_BASE}/${apiKey}/${VIIRS_PRODUCT}/${bboxStr}/${dayRange}`

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`FIRMS API error: HTTP ${res.status} — ${await res.text().catch(() => '')}`)
  }

  const csv = await res.text()
  const detections = parseFIRMSCsv(csv)

  cache.set(cacheKey, detections)
  return detections
}

/** Clear the FIRMS cache */
export function clearFIRMSCache(): void {
  cache.clear()
}
