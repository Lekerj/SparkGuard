/**
 * SparkGuard — Shared fire data types for the UI.
 *
 * These types are used by the live NASA FIRMS pipeline and globe rendering.
 */

// ─── Downsampled fire point (used by FIRMS service + globe) ─────────────────

export interface FirePoint {
  lat: number
  lng: number
  frp: number
  brightness: number
  confidence: number
  date: string
  daynight: string
}

// ─── Severity helpers ───────────────────────────────────────────────────────

export type WildfireSeverity = 'Low' | 'Moderate' | 'High' | 'Extreme'

/** Map FRP to a severity label */
export function frpToSeverity(frp: number): WildfireSeverity {
  if (frp > 200) return 'Extreme'
  if (frp > 80) return 'High'
  if (frp > 20) return 'Moderate'
  return 'Low'
}
