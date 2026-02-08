/**
 * useFireData — primary data hook for SparkGuard.
 *
 * Loads the preprocessed country stats on mount.
 * Provides methods to select a country and lazy-load its points.
 */

import { useCallback, useEffect, useState } from 'react'
import type { CountryFireStats, CountryFireStatsFile, FirePoint } from '@/types/fireData'
import { fetchCountryStats, fetchCountryPoints } from '@/data/fireDataService'

export interface UseFireDataResult {
  /** All country stats (sorted by detections_count desc) */
  countries: CountryFireStats[]
  /** Summary metadata */
  summary: CountryFireStatsFile | null
  /** Currently selected country (or null) */
  selectedCountry: CountryFireStats | null
  /** Points for the selected country (lazy-loaded) */
  selectedPoints: FirePoint[]
  /** Is the initial stats load in progress? */
  isLoading: boolean
  /** Are the selected country's points loading? */
  isLoadingPoints: boolean
  /** True if using mock fallback data */
  isMock: boolean
  /** Select a country by name */
  selectCountry: (countryName: string | null) => void
}

export function useFireData(): UseFireDataResult {
  const [summary, setSummary] = useState<CountryFireStatsFile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)

  const [selectedCountry, setSelectedCountry] = useState<CountryFireStats | null>(null)
  const [selectedPoints, setSelectedPoints] = useState<FirePoint[]>([])
  const [isLoadingPoints, setIsLoadingPoints] = useState(false)

  // Load stats on mount
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetchCountryStats()
      .then((data) => {
        if (cancelled) return
        setSummary(data)
        // Detect mock: mock has exactly 6 countries with Brazil first
        setIsMock(data.total_countries <= 6 && data.countries[0]?.country === 'Brazil')
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load fire stats:', err)
        setIsMock(true)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  // Select a country and load its points
  const selectCountry = useCallback(
    (countryName: string | null) => {
      if (!countryName || !summary) {
        setSelectedCountry(null)
        setSelectedPoints([])
        return
      }

      const found = summary.countries.find((c) => c.country === countryName) ?? null
      setSelectedCountry(found)

      if (!found) {
        setSelectedPoints([])
        return
      }

      setIsLoadingPoints(true)
      fetchCountryPoints(countryName)
        .then((data) => setSelectedPoints(data.points))
        .catch(() => setSelectedPoints([]))
        .finally(() => setIsLoadingPoints(false))
    },
    [summary],
  )

  return {
    countries: summary?.countries ?? [],
    summary,
    selectedCountry,
    selectedPoints,
    isLoading,
    isLoadingPoints,
    isMock,
    selectCountry,
  }
}
