/**
 * SparkGuard — MET Norway Locationforecast 2.0 weather service.
 *
 * Replaces Open-Meteo with the free MET Norway Locationforecast/2.0 compact API.
 * Docs: https://api.met.no/weatherapi/locationforecast/2.0/documentation
 *
 * Requirements:
 *   - Identify your app via User-Agent (ToS)
 *   - CORS: api.met.no allows browser requests but we proxy via Vite to be safe
 */

import { TTLCache } from './cache'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface WeatherNow {
  temperature: number     // °C
  humidity: number        // %
  windSpeed: number       // m/s
  windDirection: number   // degrees
  windGust: number        // m/s
  precipitation: number   // mm/h
  cloudCover: number      // %
  pressure: number        // hPa
  symbol: string          // weather icon code
}

export interface ForecastEntry {
  time: string            // ISO timestamp
  temperature: number
  windSpeed: number
  windDirection: number
  windGust: number
  precipitation: number
  humidity: number
  symbol: string
}

export interface WeatherNowAndForecast {
  current: WeatherNow
  forecast24h: ForecastEntry[]
  fetchedAt: string
  source: 'MET Norway'
}

// ─── Constants ──────────────────────────────────────────────────────────────

// We proxy through Vite in dev to add the User-Agent header since
// browsers strip custom User-Agent in fetch. The proxy is defined in vite.config.ts.
const MET_BASE = '/api/met'

// Cache: 15 minutes (MET Norway asks to cache for at least 10 min)
const cache = new TTLCache<WeatherNowAndForecast>(15 * 60 * 1000)

// ─── Helpers ────────────────────────────────────────────────────────────────

function degreesToCompass(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

export { degreesToCompass }

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch current weather + 24-hour forecast from MET Norway.
 *
 * @param lat  Latitude
 * @param lon  Longitude
 */
export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherNowAndForecast> {
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  const url = `${MET_BASE}/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`MET Norway API error: HTTP ${res.status}`)
  }

  const data = await res.json()

  // Parse the Locationforecast compact response
  const timeseries: any[] = data?.properties?.timeseries ?? []
  if (timeseries.length === 0) {
    throw new Error('Empty weather response from MET Norway')
  }

  // Current conditions = first timeseries entry
  const now = timeseries[0]
  const nowInstant = now.data?.instant?.details ?? {}
  const nowSymbol =
    now.data?.next_1_hours?.summary?.symbol_code ??
    now.data?.next_6_hours?.summary?.symbol_code ??
    'fair_day'
  const nowPrecip =
    now.data?.next_1_hours?.details?.precipitation_amount ??
    now.data?.next_6_hours?.details?.precipitation_amount ??
    0

  const current: WeatherNow = {
    temperature: nowInstant.air_temperature ?? 0,
    humidity: nowInstant.relative_humidity ?? 0,
    windSpeed: nowInstant.wind_speed ?? 0,
    windDirection: nowInstant.wind_from_direction ?? 0,
    windGust: nowInstant.wind_speed_of_gust ?? nowInstant.wind_speed ?? 0,
    precipitation: nowPrecip,
    cloudCover: nowInstant.cloud_area_fraction ?? 0,
    pressure: nowInstant.air_pressure_at_sea_level ?? 0,
    symbol: nowSymbol,
  }

  // 24-hour forecast: take entries up to ~24h ahead
  const cutoff = new Date(now.time)
  cutoff.setHours(cutoff.getHours() + 24)

  const forecast24h: ForecastEntry[] = timeseries
    .slice(1)
    .filter((t: any) => new Date(t.time) <= cutoff)
    .map((t: any) => {
      const inst = t.data?.instant?.details ?? {}
      const sym =
        t.data?.next_1_hours?.summary?.symbol_code ??
        t.data?.next_6_hours?.summary?.symbol_code ??
        'fair_day'
      const precip =
        t.data?.next_1_hours?.details?.precipitation_amount ??
        t.data?.next_6_hours?.details?.precipitation_amount ??
        0

      return {
        time: t.time,
        temperature: inst.air_temperature ?? 0,
        windSpeed: inst.wind_speed ?? 0,
        windDirection: inst.wind_from_direction ?? 0,
        windGust: inst.wind_speed_of_gust ?? inst.wind_speed ?? 0,
        precipitation: precip,
        humidity: inst.relative_humidity ?? 0,
        symbol: sym,
      } satisfies ForecastEntry
    })

  const result: WeatherNowAndForecast = {
    current,
    forecast24h,
    fetchedAt: new Date().toISOString(),
    source: 'MET Norway',
  }

  cache.set(cacheKey, result)
  return result
}

/** Clear weather cache */
export function clearWeatherCache(): void {
  cache.clear()
}
