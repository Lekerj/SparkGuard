/**
 * SparkGuard — CWFIS Canada fire perimeter service adapter.
 *
 * Thin re-export wrapper around the existing perimeterService.
 * Adds bbox-aware filtering if needed.
 */

import type { FirePerimeter, FirePerimetersResult } from '@/types/firePerimeter'
import { fetchCWFISPerimeters as fetchAll } from '@/data/perimeterService'
import type { BBox } from './cache'

/**
 * Fetch Canadian fire perimeters from CWFIS.
 * Optionally filter by bounding box (client-side).
 */
export async function fetchCanadaPerimeters(bbox?: BBox): Promise<FirePerimetersResult> {
  const result = await fetchAll()

  if (!bbox) return result

  const filtered = result.perimeters.filter((p) =>
    p.lat >= bbox.south &&
    p.lat <= bbox.north &&
    p.lng >= bbox.west &&
    p.lng <= bbox.east,
  )

  return {
    ...result,
    perimeters: filtered,
    totalCount: filtered.length,
  }
}

export type { FirePerimeter, FirePerimetersResult }
