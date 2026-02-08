/**
 * SparkGuard — Fire perimeter types.
 *
 * Normalized perimeter data from WFIGS (US) and CWFIS (Canada).
 * Both sources are fetched as GeoJSON and mapped to these types.
 */

// ─── Unified fire perimeter ─────────────────────────────────────────────────

export interface FirePerimeter {
  id: string
  name: string
  source: 'WFIGS' | 'CWFIS'
  /** GIS-calculated area in acres (WFIGS) or hectares (CWFIS) */
  acres: number
  /** Percent contained (0–100), null if unknown */
  percentContained: number | null
  /** ISO date string of discovery / start */
  discoveryDate: string | null
  /** ISO date string of the perimeter update */
  updatedDate: string | null
  /** Fire cause description */
  cause: string | null
  /** US state or Canadian province */
  region: string | null
  /** Centroid lat */
  lat: number
  /** Centroid lon */
  lng: number
  /** GeoJSON geometry (Polygon / MultiPolygon) */
  geometry: GeoJSON.Geometry
}

// ─── Perimeter collection ───────────────────────────────────────────────────

export interface FirePerimetersResult {
  perimeters: FirePerimeter[]
  fetchedAt: string
  source: 'WFIGS' | 'CWFIS' | 'all'
  totalCount: number
}
