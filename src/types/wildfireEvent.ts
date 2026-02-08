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

export interface RegionIntelligence {
  biome: string
  vegetation: string
  fuelType: string
  drynessIndex: number       // 0–100
  protectedAreas: string[]
  populationRisk: 'Low' | 'Moderate' | 'High' | 'Critical'
  landCover: string
}

export interface WeatherConditions {
  temperature: number     // °C
  humidity: number        // %
  windSpeed: number       // km/h
  windDirection: string   // e.g. "NW"
  precipitation: number   // mm (last 24h)
}

/** Biome lookup table for mocked region intelligence */
export function getRegionIntelligence(lat: number, lon: number, country?: string): RegionIntelligence {
  // Simple lat-based biome estimation
  const absLat = Math.abs(lat)

  if (absLat < 10) {
    return {
      biome: 'Tropical Rainforest',
      vegetation: 'Dense broadleaf evergreen',
      fuelType: 'Heavy organic litter + canopy',
      drynessIndex: 35,
      protectedAreas: ['UNESCO Biosphere Reserve'],
      populationRisk: 'Moderate',
      landCover: 'Closed canopy forest',
    }
  }
  if (absLat < 25) {
    return {
      biome: 'Tropical Savanna',
      vegetation: 'Grasslands with scattered trees',
      fuelType: 'Grass + shrub',
      drynessIndex: 72,
      protectedAreas: ['National Wildlife Refuge'],
      populationRisk: 'Low',
      landCover: 'Open woodland / savanna',
    }
  }
  if (absLat < 40) {
    return {
      biome: 'Mediterranean / Temperate',
      vegetation: 'Chaparral, scrubland, mixed forest',
      fuelType: 'Shrub + dead wood',
      drynessIndex: 65,
      protectedAreas: ['State Forest Reserve'],
      populationRisk: 'High',
      landCover: 'Mixed shrubland / agriculture',
    }
  }
  if (absLat < 55) {
    return {
      biome: 'Temperate / Boreal Transition',
      vegetation: 'Coniferous + deciduous mixed forest',
      fuelType: 'Needle litter + deadfall',
      drynessIndex: 48,
      protectedAreas: ['Provincial Park'],
      populationRisk: 'Moderate',
      landCover: 'Boreal mixed forest',
    }
  }
  return {
    biome: 'Boreal / Taiga',
    vegetation: 'Spruce, pine, larch forest',
    fuelType: 'Conifer needle litter + peat',
    drynessIndex: 40,
    protectedAreas: ['Protected Wilderness Area'],
    populationRisk: 'Low',
    landCover: 'Dense coniferous forest',
  }
}

/** Mock weather conditions */
export function getWeatherConditions(lat: number): WeatherConditions {
  const absLat = Math.abs(lat)
  const baseTemp = 35 - absLat * 0.5
  return {
    temperature: Math.round(baseTemp + (Math.random() - 0.5) * 10),
    humidity: Math.round(20 + Math.random() * 40),
    windSpeed: Math.round(5 + Math.random() * 30),
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    precipitation: Math.round(Math.random() * 5 * 10) / 10,
  }
}
