/**
 * SparkGuard — Shared types used by both the preprocessing pipeline and the UI.
 *
 * These types mirror scripts/types.ts but live inside src/ so the browser-side
 * code can import them without reaching outside the Vite root.
 */

// ─── Per-country aggregated stats (from country_fire_stats_2024.json) ───────

export interface CountryFireStats {
  country: string
  detections_count: number
  total_frp: number
  avg_frp: number
  avg_confidence: number
  max_brightness: number
  day_count: number
  night_count: number
  date_range: {
    earliest: string
    latest: string
  }
  bbox: {
    min_lat: number
    max_lat: number
    min_lon: number
    max_lon: number
  }
  center: {
    lat: number
    lon: number
  }
}

// ─── Summary file shape ─────────────────────────────────────────────────────

export interface CountryFireStatsFile {
  generated_at: string
  year: number
  total_countries: number
  total_detections: number
  countries: CountryFireStats[]
}

// ─── Downsampled fire point ─────────────────────────────────────────────────

export interface FirePoint {
  lat: number
  lng: number
  frp: number
  brightness: number
  confidence: number
  date: string
  daynight: string
}

// ─── Per-country points file shape ──────────────────────────────────────────

export interface CountryPointsFile {
  country: string
  total_raw: number
  sampled: number
  points: FirePoint[]
}

// ─── Legacy WildfireRecord (kept for mock fallback) ─────────────────────────

export type WildfireSeverity = 'Low' | 'Moderate' | 'High' | 'Extreme'

export interface WildfireRecord {
  id: string
  name: string
  region: string
  coordinates: { lat: number; lon: number }
  startedAt: string
  updatedAt: string
  severity: WildfireSeverity
  areaBurnedHa?: number
  confidence: number
  source: string
  brightness?: number
  frp?: number
}

/** Map FRP to a severity label */
export function frpToSeverity(frp: number): WildfireSeverity {
  if (frp > 200) return 'Extreme'
  if (frp > 80) return 'High'
  if (frp > 20) return 'Moderate'
  return 'Low'
}
