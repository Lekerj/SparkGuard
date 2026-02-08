/**
 * SparkGuard — WFIGS US fire perimeter service adapter.
 *
 * Thin re-export wrapper around the existing perimeterService.
 * Adds bbox-aware filtering if needed.
 */

import type { FirePerimeter, FirePerimetersResult } from '@/types/firePerimeter'
import { fetchWFIGSPerimeters as fetchAll } from '@/data/perimeterService'
import type { BBox } from './cache'

/**
 * Fetch US fire perimeters from WFIGS.
 * Optionally filter by bounding box (client-side, since ArcGIS REST already
 * returns all current perimeters which is a manageable count).
 */
export async function fetchUSPerimeters(bbox?: BBox): Promise<FirePerimetersResult> {
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
