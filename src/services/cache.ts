/**
 * SparkGuard — Generic TTL cache with bbox+time-bucket keying.
 *
 * Used by all service adapters to avoid redundant network calls.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>()
  private ttl: number

  constructor(ttlMs: number) {
    this.ttl = ttlMs
  }

  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key)
      return null
    }
    return entry.data
  }

  set(key: string, data: T): void {
    this.store.set(key, { data, timestamp: Date.now() })
  }

  clear(): void {
    this.store.clear()
  }

  /** Build a cache key from bbox + time range */
  static bboxKey(bbox: BBox, timeRange: string): string {
    const b = `${bbox.south.toFixed(1)},${bbox.west.toFixed(1)},${bbox.north.toFixed(1)},${bbox.east.toFixed(1)}`
    return `${b}|${timeRange}`
  }
}

/** Bounding box for spatial queries */
export interface BBox {
  south: number
  west: number
  north: number
  east: number
}

/** Get the full-world bounding box */
export const WORLD_BBOX: BBox = {
  south: -90,
  west: -180,
  north: 90,
  east: 180,
}
