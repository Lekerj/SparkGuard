/**
 * InfoPanel — Right-side panel for the Globe Explorer.
 *
 * Shows:
 *   1. Country list (searchable, sortable) when nothing selected
 *   2. Wildfire event detail with region intelligence, conditions, actions when a fire is selected
 */

import { useMemo, useState, useCallback } from 'react'
import {
  Search, ArrowUpDown, MapPin, Flame, Loader2, BarChart3,
  Sun, Moon, ChevronLeft, TreePine, Cloud, Wind, Droplets,
  Thermometer, Download, Bell, FileText, Shield, AlertTriangle,
  Users, Zap, X,
} from 'lucide-react'
import type { CountryFireStats } from '@/types/fireData'
import type { WildfireEvent } from '@/types/wildfireEvent'
import { getRegionIntelligence, getWeatherConditions } from '@/types/wildfireEvent'

// ─── Helpers ────────────────────────────────────────────────────────────────

type SortKey = 'detections' | 'frp' | 'confidence'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function severityBadge(avgFrp: number) {
  if (avgFrp > 200) return { label: 'Extreme', bg: 'bg-red-500/20 text-red-300 border-red-500/30' }
  if (avgFrp > 80) return { label: 'High', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' }
  if (avgFrp > 20) return { label: 'Moderate', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
  return { label: 'Low', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
}

function statusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'predicted': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface InfoPanelProps {
  countries: CountryFireStats[]
  selectedCountry: CountryFireStats | null
  selectedEvent: WildfireEvent | null
  onSelectCountry: (country: string | null) => void
  onClearEvent: () => void
  isLoading: boolean
  isLoadingPoints: boolean
  isMock: boolean
  totalDetections?: number
}

export default function InfoPanel({
  countries,
  selectedCountry,
  selectedEvent,
  onSelectCountry,
  onClearEvent,
  isLoading,
  isLoadingPoints,
  isMock,
  totalDetections = 0,
}: InfoPanelProps) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('detections')
  const [showBrief, setShowBrief] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Filter + sort countries
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return countries
      .filter((c) => !q || c.country.toLowerCase().includes(q))
      .sort((a, b) => {
        if (sortBy === 'detections') return b.detections_count - a.detections_count
        if (sortBy === 'frp') return b.total_frp - a.total_frp
        return b.avg_confidence - a.avg_confidence
      })
  }, [query, sortBy, countries])

  // Actions
  const handleSendAlert = useCallback(() => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const handleExportReport = useCallback(() => {
    const data = selectedEvent || selectedCountry
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sparkguard-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedEvent, selectedCountry])

  // ─── Event detail view ────────────────────────────────────────
  if (selectedEvent) {
    const region = getRegionIntelligence(selectedEvent.lat, selectedEvent.lon, selectedEvent.country)
    const weather = getWeatherConditions(selectedEvent.lat)
    const sev = severityBadge(selectedEvent.intensity)

    return (
      <div className="h-full flex flex-col bg-neutral-900/90 backdrop-blur-sm text-white overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onClearEvent}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColor(selectedEvent.status)}`}>
              {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
            </span>
          </div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Wildfire Event
          </h3>
          <p className="text-xs text-neutral-400">
            {selectedEvent.country || 'Unknown region'} · {selectedEvent.lat.toFixed(3)}°, {selectedEvent.lon.toFixed(3)}°
          </p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 min-h-0">
          {/* Key facts */}
          <div>
            <h4 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Key Facts</h4>
            <div className="grid grid-cols-2 gap-2">
              <FactCard label="Date" value={selectedEvent.startDate} />
              <FactCard label="Intensity" value={`${selectedEvent.intensity.toFixed(1)} MW`} />
              <FactCard label="Confidence" value={`${selectedEvent.confidence}%`} />
              <FactCard label="Severity" value={sev.label} className={sev.bg} />
              {selectedEvent.brightness && (
                <FactCard label="Brightness" value={`${selectedEvent.brightness.toFixed(0)} K`} />
              )}
              <FactCard label="Day/Night" value={selectedEvent.daynight === 'D' ? 'Daytime' : 'Nighttime'} />
            </div>
          </div>

          {/* Region Intelligence */}
          <div>
            <h4 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <TreePine className="w-3 h-3" /> Region Intelligence
            </h4>
            <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-neutral-400">Biome</span><span className="text-white font-medium">{region.biome}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Vegetation</span><span className="text-white text-right max-w-[60%]">{region.vegetation}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Fuel type</span><span className="text-white text-right max-w-[60%]">{region.fuelType}</span></div>
              <div className="flex justify-between"><span className="text-neutral-400">Land cover</span><span className="text-white">{region.landCover}</span></div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Dryness index</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${region.drynessIndex > 60 ? 'bg-red-500' : region.drynessIndex > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${region.drynessIndex}%` }}
                    />
                  </div>
                  <span className="text-white font-mono">{region.drynessIndex}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Protected areas</span>
                <span className="text-emerald-400 text-right max-w-[55%]">{region.protectedAreas.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Population risk</span>
                <span className={`font-medium ${
                  region.populationRisk === 'Critical' ? 'text-red-400' :
                  region.populationRisk === 'High' ? 'text-orange-400' :
                  region.populationRisk === 'Moderate' ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>{region.populationRisk}</span>
              </div>
            </div>
          </div>

          {/* Weather Conditions */}
          <div>
            <h4 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Cloud className="w-3 h-3" /> Conditions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <ConditionCard icon={Thermometer} label="Temperature" value={`${weather.temperature}°C`} color="text-red-400" />
              <ConditionCard icon={Droplets} label="Humidity" value={`${weather.humidity}%`} color="text-blue-400" />
              <ConditionCard icon={Wind} label="Wind" value={`${weather.windSpeed} km/h ${weather.windDirection}`} color="text-cyan-400" />
              <ConditionCard icon={Cloud} label="Precipitation" value={`${weather.precipitation} mm`} color="text-sky-400" />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Actions
            </h4>
            <button
              onClick={() => setShowBrief(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg text-xs font-medium transition-colors border border-orange-500/30"
            >
              <FileText className="w-3.5 h-3.5" /> Generate Responder Brief
            </button>
            <button
              onClick={handleSendAlert}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-medium transition-colors border border-red-500/30"
            >
              <Bell className="w-3.5 h-3.5" /> Send Alert (Mock)
            </button>
            <button
              onClick={handleExportReport}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-xs font-medium transition-colors border border-blue-500/30"
            >
              <Download className="w-3.5 h-3.5" /> Export Report (JSON)
            </button>
          </div>
        </div>

        {/* Toast */}
        {showToast && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-500/90 text-white text-xs px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
            <Bell className="w-4 h-4" />
            Alert sent to response team (mock)
          </div>
        )}

        {/* Brief modal */}
        {showBrief && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-5 max-w-sm w-full max-h-[80%] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  Responder Brief
                </h3>
                <button onClick={() => setShowBrief(false)} className="text-neutral-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs text-neutral-300">
                <p>• <strong>Location:</strong> {selectedEvent.country || 'Unknown'} ({selectedEvent.lat.toFixed(3)}°, {selectedEvent.lon.toFixed(3)}°)</p>
                <p>• <strong>Date:</strong> {selectedEvent.startDate}</p>
                <p>• <strong>Intensity:</strong> {selectedEvent.intensity.toFixed(1)} MW FRP — {sev.label} severity</p>
                <p>• <strong>Confidence:</strong> {selectedEvent.confidence}%</p>
                <p>• <strong>Biome:</strong> {region.biome} — {region.fuelType}</p>
                <p>• <strong>Dryness:</strong> {region.drynessIndex}/100 — {region.drynessIndex > 60 ? 'HIGH RISK of rapid spread' : 'moderate conditions'}</p>
                <p>• <strong>Wind:</strong> {weather.windSpeed} km/h {weather.windDirection} — {weather.windSpeed > 20 ? 'CAUTION: strong winds' : 'manageable'}</p>
                <p>• <strong>Humidity:</strong> {weather.humidity}% — {weather.humidity < 30 ? 'VERY DRY' : 'adequate'}</p>
                <p>• <strong>Population risk:</strong> {region.populationRisk}</p>
                <p>• <strong>Protected areas nearby:</strong> {region.protectedAreas.join(', ')}</p>
                <hr className="border-neutral-700 my-3" />
                <p className="text-neutral-500 italic">This is a mock brief. In production, this would include real-time data from weather APIs, terrain models, and population databases.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Country detail view ──────────────────────────────────────
  if (selectedCountry) {
    const sev = severityBadge(selectedCountry.avg_frp)
    return (
      <div className="h-full flex flex-col bg-neutral-900/90 backdrop-blur-sm text-white overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => onSelectCountry(null)}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3 h-3" /> All countries
            </button>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${sev.bg}`}>
              {sev.label}
            </span>
          </div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            {selectedCountry.country}
            {isLoadingPoints && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
          </h3>
        </div>

        {/* Stats */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          <div className="grid grid-cols-2 gap-2">
            <FactCard label="Detections" value={selectedCountry.detections_count.toLocaleString()} />
            <FactCard label="Total FRP" value={`${formatNumber(selectedCountry.total_frp)} MW`} />
            <FactCard label="Avg FRP" value={`${selectedCountry.avg_frp} MW`} />
            <FactCard label="Avg Confidence" value={`${selectedCountry.avg_confidence}%`} />
            <FactCard label="Max Brightness" value={`${selectedCountry.max_brightness} K`} />
            <FactCard label="Date Range" value={`${selectedCountry.date_range.earliest} → ${selectedCountry.date_range.latest}`} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg p-3 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-[10px] text-neutral-400">Daytime</p>
                <p className="text-sm font-semibold">{formatNumber(selectedCountry.day_count)}</p>
              </div>
            </div>
            <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg p-3 flex items-center gap-2">
              <Moon className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-[10px] text-neutral-400">Nighttime</p>
                <p className="text-sm font-semibold">{formatNumber(selectedCountry.night_count)}</p>
              </div>
            </div>
          </div>

          {/* Bounding box */}
          <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-3">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5">Bounding Box</p>
            <div className="grid grid-cols-2 gap-1 text-xs font-mono text-neutral-300">
              <span>N: {selectedCountry.bbox.max_lat}°</span>
              <span>E: {selectedCountry.bbox.max_lon}°</span>
              <span>S: {selectedCountry.bbox.min_lat}°</span>
              <span>W: {selectedCountry.bbox.min_lon}°</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleExportReport}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-xs font-medium transition-colors border border-blue-500/30"
            >
              <Download className="w-3.5 h-3.5" /> Export Country Data
            </button>
          </div>

          {/* Click hint */}
          <p className="text-[10px] text-neutral-600 text-center pt-2 italic">
            Click a hotspot on the globe to view fire event details
          </p>
        </div>
      </div>
    )
  }

  // ─── Default: country list ────────────────────────────────────
  return (
    <div className="h-full flex flex-col bg-neutral-900/90 backdrop-blur-sm text-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Fire Detections
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
          </h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
            isMock ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            {isMock ? 'Mock data' : 'MODIS 2024'}
          </span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-neutral-800/60 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase">Countries</p>
            <p className="text-sm font-bold">{countries.length}</p>
          </div>
          <div className="bg-neutral-800/60 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase">Detections</p>
            <p className="text-sm font-bold">{formatNumber(totalDetections)}</p>
          </div>
          <div className="bg-neutral-800/60 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase">Year</p>
            <p className="text-sm font-bold">2024</p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country…"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 absolute top-1/2 left-3 -translate-y-1/2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none"
            >
              <option value="detections">Most Detections</option>
              <option value="frp">Highest FRP</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Country list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 min-h-0">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <p className="text-xs text-neutral-500 py-8 text-center">No countries match your search.</p>
        )}
        {filtered.map((c) => {
          const sev = severityBadge(c.avg_frp)
          return (
            <button
              key={c.country}
              onClick={() => onSelectCountry(c.country)}
              className="w-full text-left p-3 rounded-lg border bg-neutral-800/40 border-neutral-700/40 hover:border-neutral-600 hover:bg-neutral-800/70 transition-all group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-white truncate group-hover:text-orange-300 transition-colors">{c.country}</p>
                  <p className="text-[11px] text-neutral-500">{c.detections_count.toLocaleString()} detections</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${sev.bg}`}>
                  {sev.label}
                </span>
              </div>
              <div className="mt-1.5 flex gap-3 text-[10px] text-neutral-500">
                <span className="flex items-center gap-1"><Flame className="w-2.5 h-2.5" /> {formatNumber(c.total_frp)} MW</span>
                <span className="flex items-center gap-1"><BarChart3 className="w-2.5 h-2.5" /> {c.avg_confidence}% conf</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Empty state hint */}
      {!isLoading && !selectedCountry && countries.length > 0 && (
        <div className="px-4 py-3 border-t border-neutral-800 flex-shrink-0">
          <p className="text-[10px] text-neutral-600 text-center italic flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Select a country or click a hotspot on the globe
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function FactCard({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`bg-neutral-800/60 border border-neutral-700/50 rounded-lg p-2.5 ${className}`}>
      <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-semibold text-white mt-0.5">{value}</p>
    </div>
  )
}

function ConditionCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string; color: string
}) {
  return (
    <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg p-2.5 flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
      <div>
        <p className="text-[10px] text-neutral-500">{label}</p>
        <p className="text-xs font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}
