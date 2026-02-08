/**
 * GlobeExplorer — Main "Globe Explorer" page.
 *
 * Full-viewport layout:
 *   Left: 3D globe (dominant) — live FIRMS fire detections + perimeters
 *   Right: Info panel (fixed ~420px) — responder view with MET Norway weather
 *   Top-left: Globe controls overlay (time range, perimeters, search)
 */

import { useState, useCallback } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'
import FireGlobe from '@/components/FireGlobe'
import GlobeControls from '@/components/GlobeControls'
import InfoPanel from '@/components/InfoPanel'
import { useFireData } from '@/hooks/useFireData'
import { useFirePerimeters } from '@/hooks/useFirePerimeters'
import type { WildfireEvent } from '@/types/wildfireEvent'
import type { FirePerimeter } from '@/types/firePerimeter'

const TIME_RANGE_LABELS = {
  '24h': '24 hours',
  '48h': '48 hours',
  '7d': '7 days',
} as const

export default function GlobeExplorer() {
  const {
    points,
    totalDetections,
    isLoading,
    error,
    timeRange,
    setTimeRange,
    refresh,
    fetchedAt,
  } = useFireData()

  const {
    perimeters,
    isLoading: isLoadingPerimeters,
    source: perimeterSource,
    setSource: setPerimeterSource,
    showPerimeters,
    totalCount: perimeterCount,
  } = useFirePerimeters()

  const [selectedEvent, setSelectedEvent] = useState<WildfireEvent | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Convert a fire point to a WildfireEvent for the info panel
  const handlePointSelect = useCallback((event: WildfireEvent) => {
    setSelectedEvent(event)
  }, [])

  // Search (simple coordinate jump or placeholder for future geocoding)
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // Handle perimeter polygon click → create WildfireEvent for info panel
  const handlePerimeterClick = useCallback((perimeter: FirePerimeter) => {
    const event: WildfireEvent = {
      id: `perimeter-${perimeter.id}`,
      lat: perimeter.lat,
      lon: perimeter.lng,
      startDate: perimeter.discoveryDate ?? new Date().toISOString().split('T')[0],
      confidence: perimeter.percentContained ?? 50,
      intensity: perimeter.acres / 100, // rough FRP proxy from acres
      country: perimeter.source === 'WFIGS' ? 'United States' : 'Canada',
      region: perimeter.region ?? undefined,
      status: 'active',
      geometry: perimeter.geometry,
    }
    setSelectedEvent(event)
  }, [])

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
            points={points}
            onPointSelect={handlePointSelect}
            perimeters={perimeters}
            showPerimeters={showPerimeters}
            onPerimeterClick={handlePerimeterClick}
            selectedEvent={selectedEvent}
            className="w-full h-full"
          />
        </ErrorBoundary>

        {/* ── Overlay controls (top-left) ────────────────────────── */}
        <GlobeControls
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          totalDetections={totalDetections}
          isLoading={isLoading}
          error={error}
          fetchedAt={fetchedAt}
          onRefresh={refresh}
          perimeterSource={perimeterSource}
          onPerimeterSourceChange={setPerimeterSource}
          perimeterCount={perimeterCount}
          isLoadingPerimeters={isLoadingPerimeters}
        />

        {/* ── Bottom data label ──────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] text-neutral-400 bg-neutral-950/80 backdrop-blur-sm px-3 py-1.5 rounded-full font-mono border border-neutral-800">
            FIRMS VIIRS · {totalDetections.toLocaleString()} detections · {TIME_RANGE_LABELS[timeRange]}
          </span>
        </div>
      </div>

      {/* ── Right info panel ───────────────────────────────────────── */}
      <div className="w-[420px] h-full flex-shrink-0 border-l border-neutral-800">
        <InfoPanel
          selectedEvent={selectedEvent}
          onClearEvent={() => setSelectedEvent(null)}
          totalDetections={totalDetections}
          isLoading={isLoading}
          error={error}
          timeRangeLabel={TIME_RANGE_LABELS[timeRange]}
          fetchedAt={fetchedAt}
        />
      </div>
    </div>
  )
}
