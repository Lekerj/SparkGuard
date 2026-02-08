/**
 * GlobeControls — Overlay controls positioned on top of the globe.
 *
 * Includes:
 *   - Time range slider
 *   - Status filter toggles (Historical / Active / Predictions)
 *   - Location search
 *   - Stats summary
 */

import { useState } from 'react'
import {
  Search, Calendar, Flame, History, AlertTriangle,
  Brain, Loader2, X, MapPin,
} from 'lucide-react'

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

interface GlobeControlsProps {
  dateRange: [string, string]
  onDateRangeChange: (range: [string, string]) => void
  statusFilter: 'all' | 'historical' | 'active' | 'predicted'
  onStatusFilterChange: (filter: 'all' | 'historical' | 'active' | 'predicted') => void
  searchQuery: string
  onSearch: (query: string) => void
  totalCountries: number
  totalDetections: number
  isMock: boolean
  isLoading: boolean
}

export default function GlobeControls({
  dateRange,
  onDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearch,
  totalCountries,
  totalDetections,
  isMock,
  isLoading,
}: GlobeControlsProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery)
  const [expanded, setExpanded] = useState(true)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(localQuery)
  }

  // Month labels for the slider
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  // Convert date to month index (0-11)
  const startMonth = parseInt(dateRange[0].split('-')[1]) - 1
  const endMonth = parseInt(dateRange[1].split('-')[1]) - 1

  const handleStartChange = (val: number) => {
    const m = Math.max(0, Math.min(val, endMonth))
    const monthStr = String(m + 1).padStart(2, '0')
    onDateRangeChange([`2024-${monthStr}-01`, dateRange[1]])
  }

  const handleEndChange = (val: number) => {
    const m = Math.max(startMonth, Math.min(val, 11))
    const monthStr = String(m + 1).padStart(2, '0')
    const lastDay = new Date(2024, m + 1, 0).getDate()
    onDateRangeChange([dateRange[0], `2024-${monthStr}-${lastDay}`])
  }

  const statusButtons = [
    { key: 'all' as const, label: 'All', icon: Flame, color: 'text-white' },
    { key: 'historical' as const, label: 'Historical', icon: History, color: 'text-blue-400' },
    { key: 'active' as const, label: 'Active', icon: AlertTriangle, color: 'text-red-400' },
    { key: 'predicted' as const, label: 'Predicted', icon: Brain, color: 'text-purple-400' },
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
              {isLoading ? 'Loading…' : `${totalCountries} Countries · ${formatNum(totalDetections)}`}
            </span>
            {isLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400" />}
          </div>
          {isMock && (
            <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">MOCK</span>
          )}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3 border-t border-neutral-800">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="mt-3 relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search country or coordinates…"
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

            {/* Status filter */}
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Filter
              </p>
              <div className="grid grid-cols-4 gap-1">
                {statusButtons.map((btn) => {
                  const Icon = btn.icon
                  const isActive = statusFilter === btn.key
                  return (
                    <button
                      key={btn.key}
                      onClick={() => onStatusFilterChange(btn.key)}
                      className={`flex flex-col items-center gap-0.5 py-1.5 px-1 rounded-lg text-[10px] transition-all ${
                        isActive
                          ? 'bg-neutral-700/80 text-white ring-1 ring-neutral-600'
                          : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                      }`}
                    >
                      <Icon className={`w-3 h-3 ${isActive ? btn.color : ''}`} />
                      {btn.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time range */}
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Time Range — 2024
              </p>
              <div className="space-y-2">
                {/* Start slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-500 w-8">From</span>
                  <input
                    type="range"
                    min={0}
                    max={11}
                    value={startMonth}
                    onChange={(e) => handleStartChange(parseInt(e.target.value))}
                    className="flex-1 h-1 accent-blue-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-white font-mono w-8">{months[startMonth]}</span>
                </div>
                {/* End slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-500 w-8">To</span>
                  <input
                    type="range"
                    min={0}
                    max={11}
                    value={endMonth}
                    onChange={(e) => handleEndChange(parseInt(e.target.value))}
                    className="flex-1 h-1 accent-orange-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-white font-mono w-8">{months[endMonth]}</span>
                </div>
              </div>
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
          </div>
        )}
      </div>
    </div>
  )
}
