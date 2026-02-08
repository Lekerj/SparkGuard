/**
 * GlobeControls — Overlay controls positioned on top of the globe.
 *
 * Updated for live FIRMS data:
 *   - Time range selector (24h / 48h / 7d) instead of 2024 month sliders
 *   - Fire perimeter toggles (US / Canada / Both)
 *   - Search + FRP legend
 */

import { useState } from 'react'
import {
  Search, Clock, Flame, Loader2, X, MapPin, Layers,
  RefreshCw,
} from 'lucide-react'
import type { PerimeterSource } from '@/hooks/useFirePerimeters'
import type { FIRMSTimeRange } from '@/services/firms'

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

interface GlobeControlsProps {
  /** Current FIRMS time range */
  timeRange: FIRMSTimeRange
  onTimeRangeChange: (range: FIRMSTimeRange) => void
  searchQuery: string
  onSearch: (query: string) => void
  totalDetections: number
  isLoading: boolean
  error: string | null
  fetchedAt: string | null
  onRefresh: () => void
  /** Fire perimeter controls */
  perimeterSource: PerimeterSource
  onPerimeterSourceChange: (source: PerimeterSource) => void
  perimeterCount: number
  isLoadingPerimeters: boolean
}

export default function GlobeControls({
  timeRange,
  onTimeRangeChange,
  searchQuery,
  onSearch,
  totalDetections,
  isLoading,
  error,
  fetchedAt,
  onRefresh,
  perimeterSource,
  onPerimeterSourceChange,
  perimeterCount,
  isLoadingPerimeters,
}: GlobeControlsProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [expanded, setExpanded] = useState(true)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localQuery)
  }

  const timeRangeButtons: { key: FIRMSTimeRange; label: string }[] = [
    { key: '24h', label: '24h' },
    { key: '48h', label: '48h' },
    { key: '7d', label: '7 days' },
  ]

  return (
    <div className="absolute top-4 left-4 z-20 pointer-events-auto">
      {/* Compact header always visible */}
      <div
        className="bg-neutral-900/90 backdrop-blur-md rounded-xl border border-neutral-700/60 shadow-2xl overflow-hidden"
        style={{ width: expanded ? 320 : 'auto' }}
      >
        {/* Toggle bar */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-800/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-white">
              {isLoading ? 'Loading…' : `${formatNum(totalDetections)} Detections`}
            </span>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
          </div>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full">
            LIVE · VIIRS
          </span>
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-neutral-800">
            {/* Error banner */}
            {error && (
              <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-[10px] text-red-300">
                ⚠️ {error}
              </div>
            )}

            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="mt-3 relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search coordinates…"
                className="w-full bg-neutral-800/80 border border-neutral-700 rounded-lg pl-8 pr-8 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => { setLocalQuery(''); onSearch('') }}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>

            {/* Time range */}
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Time Range (FIRMS)
              </p>
              <div className="grid grid-cols-3 gap-1">
                {timeRangeButtons.map((btn) => {
                  const isActive = timeRange === btn.key
                  return (
                    <button
                      key={btn.key}
                      onClick={() => onTimeRangeChange(btn.key)}
                      className={`py-1.5 px-1 rounded-lg text-[10px] transition-all ${
                        isActive
                          ? 'bg-orange-500/20 text-orange-300 ring-1 ring-orange-500/50'
                          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Refresh + timestamp */}
            <div className="flex items-center justify-between">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {fetchedAt && (
                <span className="text-[9px] text-neutral-600 font-mono">
                  {new Date(fetchedAt).toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Legend */}
            <div className="pt-1 border-t border-neutral-800">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5">FRP Legend (MW)</p>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" /> &gt;200</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> 80–200</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 20–80</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> &lt;20</span>
              </div>
            </div>

            {/* Fire Perimeters */}
            <div className="pt-1 border-t border-neutral-800">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Fire Perimeters
                {isLoadingPerimeters && <Loader2 className="w-3 h-3 animate-spin text-blue-400 ml-1" />}
                {perimeterCount > 0 && (
                  <span className="ml-auto text-neutral-400">{perimeterCount}</span>
                )}
              </p>
              <div className="grid grid-cols-4 gap-1">
                {([
                  { key: 'none' as PerimeterSource, label: 'Off' },
                  { key: 'WFIGS' as PerimeterSource, label: 'US' },
                  { key: 'CWFIS' as PerimeterSource, label: 'Canada' },
                  { key: 'all' as PerimeterSource, label: 'Both' },
                ]).map((btn) => {
                  const isActive = perimeterSource === btn.key
                  return (
                    <button
                      key={btn.key}
                      onClick={() => onPerimeterSourceChange(btn.key)}
                      className={`py-1.5 px-1 rounded-lg text-[10px] transition-all ${
                        isActive
                          ? 'bg-neutral-700/80 text-white ring-1 ring-neutral-600'
                          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  )
                })}
              </div>
              {perimeterSource !== 'none' && (
                <div className="flex items-center gap-3 text-[10px] mt-1.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-red-500/50 border border-red-500" /> US (WFIGS)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-blue-500/50 border border-blue-500" /> CA (CWFIS)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
