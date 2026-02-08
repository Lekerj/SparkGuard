/**
 * GlobeExplorer — Main "Globe Explorer" page.
 *
 * Full-viewport layout:
 *   Left: 3D globe (dominant)
 *   Right: Info panel (fixed ~420px)
 *   Top-left: Globe controls overlay (time slider, toggles, search)
 */

import { useState, useCallback } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'
import FireGlobe from '@/components/FireGlobe'
import GlobeControls from '@/components/GlobeControls'
import InfoPanel from '@/components/InfoPanel'
import { useFireData } from '@/hooks/useFireData'
import type { WildfireEvent } from '@/types/wildfireEvent'

export default function GlobeExplorer() {
  const {
    countries,
    summary,
    selectedCountry,
    selectedPoints,
    isLoading,
    isLoadingPoints,
    isMock,
    selectCountry,
  } = useFireData()

  const [selectedEvent, setSelectedEvent] = useState<WildfireEvent | null>(null)
  const [dateRange, setDateRange] = useState<[string, string]>(['2024-01-01', '2024-12-31'])
  const [statusFilter, setStatusFilter] = useState<'all' | 'historical' | 'active' | 'predicted'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Convert a fire point to a WildfireEvent for the info panel
  const handlePointSelect = useCallback((event: WildfireEvent) => {
    setSelectedEvent(event)
  }, [])

  // Handle country click from globe or panel
  const handleCountrySelect = useCallback((countryName: string | null) => {
    selectCountry(countryName)
    if (!countryName) setSelectedEvent(null)
  }, [selectCountry])

  // Search/jump to location
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    const q = query.toLowerCase().trim()
    if (!q) return

    // Try matching a country
    const match = countries.find(c =>
      c.country.toLowerCase().includes(q)
    )
    if (match) {
      handleCountrySelect(match.country)
    }
  }, [countries, handleCountrySelect])

  return (
    <div className="flex h-full w-full overflow-hidden bg-neutral-950">
      {/* ── Globe area (fills remaining space) ─────────────────────── */}
      <div className="flex-1 relative min-w-0">
        <ErrorBoundary
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-neutral-950">
              <div className="text-center p-8">
                <p className="text-red-400 font-semibold mb-2 text-lg">Globe failed to load</p>
                <p className="text-neutral-400 text-sm">WebGL may not be supported in this browser.</p>
                <p className="text-neutral-500 text-xs mt-2">Try Chrome, Firefox, or Edge with hardware acceleration enabled.</p>
              </div>
            </div>
          }
        >
          <FireGlobe
            points={selectedPoints}
            countries={countries}
            focusCountry={selectedCountry}
            onCountryClick={handleCountrySelect}
            onPointSelect={handlePointSelect}
            dateRange={dateRange}
            statusFilter={statusFilter}
            className="w-full h-full"
          />
        </ErrorBoundary>

        {/* ── Overlay controls (top-left) ────────────────────────── */}
        <GlobeControls
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          totalCountries={countries.length}
          totalDetections={summary?.total_detections ?? 0}
          isMock={isMock}
          isLoading={isLoading}
        />

        {/* ── Bottom data label ──────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] text-neutral-400 bg-neutral-950/80 backdrop-blur-sm px-3 py-1.5 rounded-full font-mono border border-neutral-800">
            {isMock ? 'MOCK DATA' : 'MODIS 2024'} · {selectedPoints.length > 0 ? selectedPoints.length.toLocaleString() + ' pts' : countries.length + ' countries'}
          </span>
        </div>
      </div>

      {/* ── Right info panel ───────────────────────────────────────── */}
      <div className="w-[420px] h-full flex-shrink-0 border-l border-neutral-800">
        <InfoPanel
          countries={countries}
          selectedCountry={selectedCountry}
          selectedEvent={selectedEvent}
          onSelectCountry={handleCountrySelect}
          onClearEvent={() => setSelectedEvent(null)}
          isLoading={isLoading}
          isLoadingPoints={isLoadingPoints}
          isMock={isMock}
          totalDetections={summary?.total_detections}
        />
      </div>
    </div>
  )
}
