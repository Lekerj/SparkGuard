/**
 * InfoPanel — Right-side panel for the Globe Explorer.
 *
 * Shows:
 *   1. Live detection summary when nothing selected
 *   2. Wildfire event detail with MET Norway weather, wind data, and responder view
 */

import { useMemo, useState, useCallback, useEffect } from 'react'
import {
  Search, MapPin, Flame, Loader2,
  ChevronLeft, TreePine, Cloud, Wind, Droplets,
  Thermometer, Download, Bell, FileText, Shield,
  Zap, X, Compass, Gauge,
} from 'lucide-react'
import type { WildfireEvent } from '@/types/wildfireEvent'
import { getRegionIntelligence } from '@/types/wildfireEvent'
import {
  fetchWeather,
  degreesToCompass,
  type WeatherNowAndForecast,
} from '@/services/weatherMetNo'

// ─── Helpers ────────────────────────────────────────────────────────────────

function severityBadge(avgFrp: number) {
  if (avgFrp > 200) return { label: 'Extreme', bg: 'bg-red-500/20 text-red-300 border-red-500/30' }
  if (avgFrp > 80) return { label: 'High', bg: 'bg-orange-500/20 text-orange-300 border-orange-500/30' }
  if (avgFrp > 20) return { label: 'Moderate', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' }
  return { label: 'Low', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
}

// ─── Component ──────────────────────────────────────────────────────────────

interface InfoPanelProps {
  selectedEvent: WildfireEvent | null
  onClearEvent: () => void
  totalDetections: number
  isLoading: boolean
  error: string | null
  timeRangeLabel: string
  fetchedAt: string | null
}

export default function InfoPanel({
  selectedEvent,
  onClearEvent,
  totalDetections,
  isLoading,
  error,
  timeRangeLabel,
  fetchedAt,
}: InfoPanelProps) {
  const [showBrief, setShowBrief] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [weather, setWeather] = useState<WeatherNowAndForecast | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)

  // Actions
  const handleSendAlert = useCallback(() => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const handleExportReport = useCallback(() => {
    if (!selectedEvent) return
    const blob = new Blob([JSON.stringify(selectedEvent, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sparkguard-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [selectedEvent])

  // Load MET Norway weather when event is selected
  useEffect(() => {
    let cancelled = false

    if (!selectedEvent) {
      setWeather(null)
      setWeatherError(null)
      setWeatherLoading(false)
      return () => { cancelled = true }
    }

    const loadWeather = async () => {
      setWeatherLoading(true)
      setWeatherError(null)
      try {
        const data = await fetchWeather(selectedEvent.lat, selectedEvent.lon)
        if (!cancelled) setWeather(data)
      } catch (err) {
        if (!cancelled) {
          setWeatherError((err as Error).message)
        }
      } finally {
        if (!cancelled) setWeatherLoading(false)
      }
    }

    loadWeather()
    return () => { cancelled = true }
  }, [selectedEvent])

  // ─── Event detail view (Responder View) ───────────────────────
  if (selectedEvent) {
    const region = getRegionIntelligence(selectedEvent.lat, selectedEvent.lon, selectedEvent.country)
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
            <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-red-500/20 text-red-400 border-red-500/30">
              Active
            </span>
          </div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Fire Detection
          </h3>
          <p className="text-xs text-neutral-400">
            {selectedEvent.lat.toFixed(3)}°, {selectedEvent.lon.toFixed(3)}°
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

          {/* Weather — MET Norway Responder View */}
          <div>
            <h4 className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Cloud className="w-3 h-3" /> Live Weather (MET Norway)
              {weatherLoading && <Loader2 className="w-3 h-3 animate-spin text-blue-400 ml-1" />}
            </h4>

            {weatherError && !weather && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-[10px] text-red-300 mb-2">
                ⚠️ Weather unavailable: {weatherError}
              </div>
            )}

            {weather && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <ConditionCard icon={Thermometer} label="Temperature" value={`${weather.current.temperature.toFixed(1)}°C`} color="text-red-400" />
                  <ConditionCard icon={Droplets} label="Humidity" value={`${weather.current.humidity.toFixed(0)}%`} color="text-blue-400" />
                  <ConditionCard icon={Wind} label="Wind" value={`${weather.current.windSpeed.toFixed(1)} m/s`} color="text-cyan-400" />
                  <ConditionCard icon={Compass} label="Direction" value={degreesToCompass(weather.current.windDirection)} color="text-teal-400" />
                  <ConditionCard icon={Gauge} label="Gusts" value={`${weather.current.windGust.toFixed(1)} m/s`} color="text-orange-400" />
                  <ConditionCard icon={Cloud} label="Precip" value={`${weather.current.precipitation.toFixed(1)} mm/h`} color="text-sky-400" />
                </div>

                {/* Wind Risk Assessment */}
                <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg p-3 mt-2">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Wind className="w-3 h-3" /> Wind Risk
                  </p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Wind speed</span>
                      <span className={`font-medium ${
                        weather.current.windSpeed > 15 ? 'text-red-400' :
                        weather.current.windSpeed > 8 ? 'text-orange-400' :
                        'text-emerald-400'
                      }`}>
                        {weather.current.windSpeed > 15 ? '⚠️ DANGEROUS' :
                         weather.current.windSpeed > 8 ? 'Caution' : 'Manageable'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Humidity</span>
                      <span className={`font-medium ${
                        weather.current.humidity < 25 ? 'text-red-400' :
                        weather.current.humidity < 40 ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                        {weather.current.humidity < 25 ? '⚠️ VERY DRY' :
                         weather.current.humidity < 40 ? 'Dry' : 'Adequate'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 24h Forecast Summary */}
                {weather.forecast24h.length > 0 && (
                  <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-3 mt-2">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">24h Forecast</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {weather.forecast24h
                        .filter((_, i) => i % 3 === 0)  // show every 3 hours
                        .map((entry, i) => {
                          const hour = new Date(entry.time).getHours()
                          return (
                            <div key={i} className="flex items-center justify-between text-[10px]">
                              <span className="text-neutral-500 font-mono w-10">{String(hour).padStart(2, '0')}:00</span>
                              <span className="text-white">{entry.temperature.toFixed(0)}°C</span>
                              <span className="text-cyan-400">{entry.windSpeed.toFixed(0)} m/s {degreesToCompass(entry.windDirection)}</span>
                              <span className="text-sky-400">{entry.precipitation.toFixed(1)} mm</span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                )}
              </>
            )}

            {!weather && !weatherLoading && !weatherError && (
              <p className="text-[10px] text-neutral-600 italic">Select a fire to load weather…</p>
            )}
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
                <p>• <strong>Location:</strong> {selectedEvent.lat.toFixed(3)}°, {selectedEvent.lon.toFixed(3)}°</p>
                <p>• <strong>Date:</strong> {selectedEvent.startDate}</p>
                <p>• <strong>Intensity:</strong> {selectedEvent.intensity.toFixed(1)} MW FRP — {sev.label} severity</p>
                <p>• <strong>Confidence:</strong> {selectedEvent.confidence}%</p>
                <p>• <strong>Biome:</strong> {region.biome} — {region.fuelType}</p>
                <p>• <strong>Dryness:</strong> {region.drynessIndex}/100 — {region.drynessIndex > 60 ? 'HIGH RISK of rapid spread' : 'moderate conditions'}</p>
                {weather && (
                  <>
                    <p>• <strong>Wind:</strong> {weather.current.windSpeed.toFixed(1)} m/s {degreesToCompass(weather.current.windDirection)} — {weather.current.windSpeed > 10 ? 'CAUTION: strong winds' : 'manageable'}</p>
                    <p>• <strong>Gusts:</strong> up to {weather.current.windGust.toFixed(1)} m/s</p>
                    <p>• <strong>Humidity:</strong> {weather.current.humidity.toFixed(0)}% — {weather.current.humidity < 30 ? 'VERY DRY' : 'adequate'}</p>
                    <p>• <strong>Temperature:</strong> {weather.current.temperature.toFixed(1)}°C</p>
                  </>
                )}
                {!weather && (
                  <p>• <strong>Weather:</strong> Unable to load live conditions</p>
                )}
                <p>• <strong>Population risk:</strong> {region.populationRisk}</p>
                <p>• <strong>Protected areas nearby:</strong> {region.protectedAreas.join(', ')}</p>
                <hr className="border-neutral-700 my-3" />
                <p className="text-neutral-500 italic">Brief generated with live MET Norway weather data + VIIRS satellite detection.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Default: Live detection summary ──────────────────────────
  return (
    <div className="h-full flex flex-col bg-neutral-900/90 backdrop-blur-sm text-white overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            Live Detections
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full border font-medium bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
            NASA FIRMS
          </span>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-neutral-800/60 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase">Detections</p>
            <p className="text-sm font-bold">{totalDetections.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-800/60 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase">Source</p>
            <p className="text-sm font-bold">VIIRS</p>
          </div>
          <div className="bg-neutral-800/60 rounded-lg p-2 text-center">
            <p className="text-[9px] text-neutral-500 uppercase">Range</p>
            <p className="text-sm font-bold">{timeRangeLabel}</p>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Data source info */}
        <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-3">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider mb-2">Data Sources</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-neutral-300">NASA FIRMS VIIRS — fire hotspots</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-neutral-300">WFIGS — US fire perimeters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-neutral-300">CWFIS — Canada fire perimeters</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span className="text-neutral-300">MET Norway — weather forecasts</span>
            </div>
          </div>
        </div>

        {fetchedAt && (
          <p className="text-[10px] text-neutral-600 text-center">
            Last updated: {new Date(fetchedAt).toLocaleString()}
          </p>
        )}

        {/* Hint */}
        <div className="pt-4">
          <p className="text-[10px] text-neutral-600 text-center italic flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            Click a hotspot on the globe to view fire details + live weather
          </p>
        </div>
      </div>
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
