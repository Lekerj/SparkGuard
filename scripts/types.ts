/**
 * SparkGuard — Shared types for the preprocessing pipeline and the UI.
 *
 * These types describe the CSV row schema, the per-country aggregated stats,
 * and the downsampled point data that the globe visualization consumes.
 */

// ─── Raw CSV row (matches MODIS FIRMS CSV columns) ──────────────────────────

export interface ModisCsvRow {
  latitude: number
  longitude: number
  brightness: number
  scan: number
  track: number
  acq_date: string      // "YYYY-MM-DD"
  acq_time: string      // "HHMM"
  satellite: string     // "Terra" | "Aqua"
  instrument: string    // "MODIS"
  confidence: number    // 0-100
  version: string
  bright_t31: number
  frp: number           // fire radiative power (MW)
  daynight: string      // "D" | "N"
  type: number
}

// ─── Per-country aggregated stats ───────────────────────────────────────────

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

// ─── All-countries summary file ─────────────────────────────────────────────

export interface CountryFireStatsFile {
  generated_at: string
  year: number
  total_countries: number
  total_detections: number
  countries: CountryFireStats[]
}

// ─── Downsampled point for per-country visualization ────────────────────────

export interface FirePoint {
  lat: number
  lng: number
  frp: number
  brightness: number
  confidence: number
  date: string       // "YYYY-MM-DD"
  daynight: string   // "D" | "N"
}

// ─── Per-country points file ────────────────────────────────────────────────

export interface CountryPointsFile {
  country: string
  total_raw: number
  sampled: number
  points: FirePoint[]
}
