/**
 * useFireData — primary data hook for SparkGuard.
 *
 * NOW fetches live fire detections from NASA FIRMS instead of static JSON.
 * Provides time range selection (24h / 48h / 7d) and auto-refresh.
 */

import { useCallback, useEffect, useState, useRef } from 'react'
import type { FirePoint } from '@/types/fireData'
import { fetchLiveDetections, type FIRMSResult } from '@/data/fireDataService'
import type { FIRMSTimeRange } from '@/services/firms'

export interface UseFireDataResult {
  /** All live fire detection points */
  points: FirePoint[]
  /** Total detection count */
  totalDetections: number
  /** Is the data loading? */
  isLoading: boolean
  /** Error message, if any */
  error: string | null
  /** Current time range */
  timeRange: FIRMSTimeRange
  /** Change the time range */
  setTimeRange: (range: FIRMSTimeRange) => void
  /** Manually refresh */
  refresh: () => void
  /** ISO timestamp of last fetch */
  fetchedAt: string | null
}

export function useFireData(): UseFireDataResult {
  const [result, setResult] = useState<FIRMSResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<FIRMSTimeRange>('24h')
  const abortRef = useRef(false)

  const doFetch = useCallback(async (range: FIRMSTimeRange) => {
    abortRef.current = false
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchLiveDetections(range)
      if (!abortRef.current) {
        setResult(data)
      }
    } catch (err) {
      if (!abortRef.current) {
        const msg = (err as Error).message || 'Failed to fetch fire data'
        setError(msg)
        console.error('FIRMS fetch error:', msg)
      }
    } finally {
      if (!abortRef.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Fetch on mount and when time range changes
  useEffect(() => {
    doFetch(timeRange)
    return () => { abortRef.current = true }
  }, [timeRange, doFetch])

  const handleSetTimeRange = useCallback((range: FIRMSTimeRange) => {
    setTimeRange(range)
  }, [])

  const refresh = useCallback(() => {
    doFetch(timeRange)
  }, [timeRange, doFetch])

  return {
    points: result?.points ?? [],
    totalDetections: result?.totalCount ?? 0,
    isLoading,
    error,
    timeRange,
    setTimeRange: handleSetTimeRange,
    refresh,
    fetchedAt: result?.fetchedAt ?? null,
  }
}
