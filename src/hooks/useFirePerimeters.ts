/**
 * useFirePerimeters — hook for loading US (WFIGS) and Canada (CWFIS) fire perimeters.
 *
 * Provides toggleable sources, loading state, and the combined perimeter list.
 * Perimeters include GeoJSON polygons suitable for rendering on the globe.
 */

import { useCallback, useEffect, useState, useRef } from 'react'
import type { FirePerimeter, FirePerimetersResult } from '@/types/firePerimeter'
import {
  fetchWFIGSPerimeters,
  fetchCWFISPerimeters,
  fetchAllPerimeters,
} from '@/data/perimeterService'

export type PerimeterSource = 'all' | 'WFIGS' | 'CWFIS' | 'none'

export interface UseFirePerimetersResult {
  /** Current perimeters (filtered by active source) */
  perimeters: FirePerimeter[]
  /** Is a fetch in progress? */
  isLoading: boolean
  /** Most recent error message, or null */
  error: string | null
  /** Currently active source filter */
  source: PerimeterSource
  /** Switch the source (triggers a new fetch if needed) */
  setSource: (source: PerimeterSource) => void
  /** Manually refresh data */
  refresh: () => void
  /** Total perimeter count across both sources */
  totalCount: number
  /** ISO timestamp of last successful fetch */
  fetchedAt: string | null
  /** Show perimeter polygons on the globe */
  showPerimeters: boolean
  /** Toggle polygon visibility */
  setShowPerimeters: (show: boolean) => void
}

export function useFirePerimeters(): UseFirePerimetersResult {
  const [data, setData] = useState<FirePerimetersResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSourceState] = useState<PerimeterSource>('none')
  const [showPerimeters, setShowPerimeters] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const doFetch = useCallback(async (src: PerimeterSource) => {
    if (src === 'none') {
      setData(null)
      return
    }

    // Cancel any in-flight fetch
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setIsLoading(true)
    setError(null)

    try {
      let result: FirePerimetersResult

      if (src === 'all') {
        result = await fetchAllPerimeters()
      } else if (src === 'WFIGS') {
        result = await fetchWFIGSPerimeters()
      } else {
        result = await fetchCWFISPerimeters()
      }

      if (!controller.signal.aborted) {
        setData(result)
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        const msg = (err as Error).message || 'Failed to fetch perimeters'
        setError(msg)
        console.warn('⚠️  useFirePerimeters error:', msg)
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [])

  // Fetch when source changes (and it's not 'none')
  const setSource = useCallback((src: PerimeterSource) => {
    setSourceState(src)
    if (src !== 'none') {
      setShowPerimeters(true)
    } else {
      setShowPerimeters(false)
    }
  }, [])

  useEffect(() => {
    doFetch(source)
    return () => {
      abortRef.current?.abort()
    }
  }, [source, doFetch])

  const refresh = useCallback(() => {
    doFetch(source)
  }, [source, doFetch])

  return {
    perimeters: data?.perimeters ?? [],
    isLoading,
    error,
    source,
    setSource,
    refresh,
    totalCount: data?.totalCount ?? 0,
    fetchedAt: data?.fetchedAt ?? null,
    showPerimeters,
    setShowPerimeters,
  }
}
