/**
 * FireDetectionPanel — Right-side data panel for live FIRMS fire detection stats.
 *
 * Displays summary stats from the live NASA FIRMS VIIRS feed, with a
 * time-range selector and real-time breakdown of FRP distributions.
 */

import { useMemo } from 'react'
import { Flame, Loader2, BarChart3, Sun, Moon, RefreshCw, AlertTriangle, Satellite } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { FirePoint } from '@/types/fireData'
import type { FIRMSTimeRange } from '@/services/firms'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

const TIME_RANGE_LABELS: Record<FIRMSTimeRange, string> = {
  '24h': 'Last 24 Hours',
  '48h': 'Last 48 Hours',
  '7d': 'Last 7 Days',
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface FireDetectionPanelProps {
  points: FirePoint[]
  totalDetections: number
  isLoading: boolean
  error: string | null
  timeRange: FIRMSTimeRange
  onTimeRangeChange: (range: FIRMSTimeRange) => void
  onRefresh: () => void
  fetchedAt: string | null
}

export default function FireDetectionPanel({
  points,
  totalDetections,
  isLoading,
  error,
  timeRange,
  onTimeRangeChange,
  onRefresh,
  fetchedAt,
}: FireDetectionPanelProps) {
  // ── Derived stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (points.length === 0) {
      return { avgFrp: 0, maxFrp: 0, avgConf: 0, dayCount: 0, nightCount: 0, highFrp: 0, medFrp: 0, lowFrp: 0 }
    }
    let totalFrp = 0
    let maxFrp = 0
    let totalConf = 0
    let dayCount = 0
    let nightCount = 0
    let highFrp = 0
    let medFrp = 0
    let lowFrp = 0

    for (const p of points) {
      totalFrp += p.frp
      totalConf += p.confidence
      if (p.frp > maxFrp) maxFrp = p.frp
      if (p.daynight === 'D') dayCount++
      else nightCount++
      if (p.frp > 80) highFrp++
      else if (p.frp > 20) medFrp++
      else lowFrp++
    }

    return {
      avgFrp: Math.round(totalFrp / points.length),
      maxFrp: Math.round(maxFrp),
      avgConf: Math.round(totalConf / points.length),
      dayCount,
      nightCount,
      highFrp,
      medFrp,
      lowFrp,
    }
  }, [points])

  return (
    <Card className="bg-neutral-900/70 border-neutral-700 text-white h-full flex flex-col">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary-400" />
          Live Fire Detections
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-secondary-400" />}
        </h3>
        <Badge variant="success" size="sm">
          <Satellite className="w-3 h-3 mr-1 inline" />
          VIIRS Live
        </Badge>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────── */}
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Time range selector ──────────────────────────────────────── */}
      <div className="flex gap-1 mb-4">
        {(['24h', '48h', '7d'] as FIRMSTimeRange[]).map((r) => (
          <button
            key={r}
            onClick={() => onTimeRangeChange(r)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              timeRange === r
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
            }`}
          >
            {r === '24h' ? '24 h' : r === '48h' ? '48 h' : '7 d'}
          </button>
        ))}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-2 py-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Summary bar ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-neutral-800/70 rounded-lg p-2 text-center">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Detections</p>
          <p className="text-sm font-bold text-white">{formatNumber(totalDetections)}</p>
        </div>
        <div className="bg-neutral-800/70 rounded-lg p-2 text-center">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Avg FRP</p>
          <p className="text-sm font-bold text-white">{stats.avgFrp} MW</p>
        </div>
        <div className="bg-neutral-800/70 rounded-lg p-2 text-center">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Max FRP</p>
          <p className="text-sm font-bold text-white">{formatNumber(stats.maxFrp)} MW</p>
        </div>
      </div>

      {/* ── FRP Distribution ─────────────────────────────────────────── */}
      <div className="mb-4">
        <p className="text-xs text-neutral-400 uppercase tracking-wide mb-2">FRP Distribution</p>
        <div className="space-y-1.5">
          <FrpBar label="High (>80 MW)" count={stats.highFrp} total={totalDetections} color="bg-red-500" />
          <FrpBar label="Moderate (20–80 MW)" count={stats.medFrp} total={totalDetections} color="bg-amber-500" />
          <FrpBar label="Low (<20 MW)" count={stats.lowFrp} total={totalDetections} color="bg-green-500" />
        </div>
      </div>

      {/* ── Day / Night split ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-neutral-800/70 rounded-lg p-3 flex items-center gap-3">
          <Sun className="w-5 h-5 text-amber-400" />
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Day</p>
            <p className="text-sm font-bold text-white">{formatNumber(stats.dayCount)}</p>
          </div>
        </div>
        <div className="bg-neutral-800/70 rounded-lg p-3 flex items-center gap-3">
          <Moon className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Night</p>
            <p className="text-sm font-bold text-white">{formatNumber(stats.nightCount)}</p>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-neutral-800/70 rounded-lg p-2">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Avg Confidence</p>
          <p className="text-sm font-bold text-white flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            {stats.avgConf}%
          </p>
        </div>
        <div className="bg-neutral-800/70 rounded-lg p-2">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Time Range</p>
          <p className="text-sm font-bold text-white">{TIME_RANGE_LABELS[timeRange]}</p>
        </div>
      </div>

      {/* ── Data source info ─────────────────────────────────────────── */}
      <div className="mt-auto pt-3 border-t border-neutral-700/50">
        <p className="text-[10px] text-neutral-500 leading-relaxed">
          Live data from NASA FIRMS — VIIRS SNPP NRT satellite.
          {fetchedAt && (
            <> Updated {new Date(fetchedAt).toLocaleTimeString()}.</>
          )}
        </p>
      </div>
    </Card>
  )
}

// ─── FRP Distribution Bar ───────────────────────────────────────────────────

function FrpBar({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="flex items-center justify-between text-[11px] mb-0.5">
          <span className="text-neutral-300">{label}</span>
          <span className="text-neutral-400">{formatNumber(count)} ({pct}%)</span>
        </div>
        <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  )
}
