/**
 * FireDetectionPanel — Right-side data panel for fire detection stats.
 *
 * Displays a searchable, sortable list of countries from the preprocessed
 * country_fire_stats_2024.json. Selecting a country shows detail stats and
 * triggers the globe to zoom + load that country's points.
 */

import { useMemo, useState } from 'react'
import { Search, ArrowUpDown, MapPin, Flame, Loader2, BarChart3, Sun, Moon, ChevronLeft } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { CountryFireStats } from '@/types/fireData'

// ─── Helpers ────────────────────────────────────────────────────────────────

type SortKey = 'detections' | 'frp' | 'confidence'

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function severityFromFrp(avgFrp: number): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (avgFrp > 80) return { label: 'High', variant: 'danger' }
  if (avgFrp > 20) return { label: 'Moderate', variant: 'warning' }
  return { label: 'Low', variant: 'success' }
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface FireDetectionPanelProps {
  countries: CountryFireStats[]
  selectedCountry: CountryFireStats | null
  onSelectCountry: (country: string | null) => void
  isMock: boolean
  isLoading: boolean
  isLoadingPoints: boolean
  totalDetections?: number
}

export default function FireDetectionPanel({
  countries,
  selectedCountry,
  onSelectCountry,
  isMock,
  isLoading,
  isLoadingPoints,
  totalDetections = 0,
}: FireDetectionPanelProps) {
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('detections')

  // ── Filter + sort ─────────────────────────────────────────────────────
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

  return (
    <Card className="bg-neutral-900/70 border-neutral-700 text-white h-full flex flex-col">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary-400" />
          Fire Detections
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-secondary-400" />}
        </h3>
        <Badge variant={isMock ? 'demo' : 'success'} size="sm">
          {isMock ? 'Mock data' : 'MODIS 2024'}
        </Badge>
      </div>

      {/* ── Summary bar ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-neutral-800/70 rounded-lg p-2 text-center">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Countries</p>
          <p className="text-sm font-bold text-white">{countries.length}</p>
        </div>
        <div className="bg-neutral-800/70 rounded-lg p-2 text-center">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Detections</p>
          <p className="text-sm font-bold text-white">{formatNumber(totalDetections)}</p>
        </div>
        <div className="bg-neutral-800/70 rounded-lg p-2 text-center">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Year</p>
          <p className="text-sm font-bold text-white">2024</p>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country…"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="relative">
          <ArrowUpDown className="w-4 h-4 text-neutral-400 absolute top-1/2 left-3 -translate-y-1/2" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
          >
            <option value="detections">Most Detections</option>
            <option value="frp">Highest FRP</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
      </div>

      {/* ── Selected country detail ──────────────────────────────────── */}
      {selectedCountry && (
        <CountryDetail
          country={selectedCountry}
          isLoadingPoints={isLoadingPoints}
          onBack={() => onSelectCountry(null)}
        />
      )}

      {/* ── Country list ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin min-h-0 max-h-[340px]">
        {filtered.length === 0 && !isLoading && (
          <p className="text-sm text-neutral-500 py-6 text-center">No countries match your search.</p>
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-secondary-400" />
          </div>
        )}
        {filtered.map((c) => {
          const sev = severityFromFrp(c.avg_frp)
          const isSelected = selectedCountry?.country === c.country
          return (
            <button
              key={c.country}
              onClick={() => onSelectCountry(c.country)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'bg-primary-500/15 border-primary-400'
                  : 'bg-neutral-800/60 border-neutral-700/60 hover:border-neutral-500'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{c.country}</p>
                  <p className="text-xs text-neutral-400">
                    {c.detections_count.toLocaleString()} detections
                  </p>
                </div>
                <Badge variant={sev.variant} size="sm">{sev.label}</Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-neutral-400">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {formatNumber(c.total_frp)} MW
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  {c.avg_confidence}% conf
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

// ─── Country detail sub-component ───────────────────────────────────────────

function CountryDetail({
  country,
  isLoadingPoints,
  onBack,
}: {
  country: CountryFireStats
  isLoadingPoints: boolean
  onBack: () => void
}) {
  const sev = severityFromFrp(country.avg_frp)

  return (
    <div className="mb-3 border border-neutral-700 rounded-lg bg-neutral-800/50 p-3">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3 h-3" />
          Back
        </button>
        <Badge variant={sev.variant} size="sm">{sev.label} Avg FRP</Badge>
      </div>

      <h4 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary-400" />
        {country.country}
        {isLoadingPoints && <Loader2 className="w-3 h-3 animate-spin text-secondary-400" />}
      </h4>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <Stat label="Detections" value={country.detections_count.toLocaleString()} />
        <Stat label="Total FRP" value={`${formatNumber(country.total_frp)} MW`} />
        <Stat label="Avg FRP" value={`${country.avg_frp} MW`} />
        <Stat label="Avg Confidence" value={`${country.avg_confidence}%`} />
        <Stat label="Max Brightness" value={`${country.max_brightness} K`} />
        <Stat label="Date Range" value={`${country.date_range.earliest} → ${country.date_range.latest}`} />
        <div className="bg-neutral-800 rounded p-2 flex items-center gap-2">
          <Sun className="w-3 h-3 text-amber-400" />
          <div>
            <p className="text-neutral-400">Day</p>
            <p className="font-medium text-white">{formatNumber(country.day_count)}</p>
          </div>
        </div>
        <div className="bg-neutral-800 rounded p-2 flex items-center gap-2">
          <Moon className="w-3 h-3 text-blue-400" />
          <div>
            <p className="text-neutral-400">Night</p>
            <p className="font-medium text-white">{formatNumber(country.night_count)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-800 rounded p-2">
      <p className="text-neutral-400">{label}</p>
      <p className="font-medium text-white">{value}</p>
    </div>
  )
}
