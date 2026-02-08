/**
 * Normalized wildfire event — the unified internal format
 * that all data sources (CSV, GeoJSON, API) get converted to.
 */

export interface WildfireEvent {
  id: string
  lat: number
  lon: number
  startDate: string       // ISO date
  endDate?: string        // ISO date
  confidence: number      // 0–100
  intensity: number       // FRP in MW
  areaHa?: number         // estimated area in hectares
  brightness?: number     // brightness temperature K
  cause?: string
  country?: string
  region?: string
  status: 'historical' | 'active' | 'predicted'
  daynight?: 'D' | 'N'
  geometry?: GeoJSON.Geometry  // optional polygon
}

/**
 * Re-export the live RegionIntelligence type from the real service.
 * All region intelligence is now fetched via OSM Overpass + Nominatim + Open-Meteo.
 */
export type { RegionIntelligence } from '@/services/regionIntelligence'
