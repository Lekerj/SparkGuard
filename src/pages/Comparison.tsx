/**
 * Comparison — Satellite imagery before/after comparison page.
 *
 * Features:
 *   - Side-by-side or slider comparison of raw vs processed imagery
 *   - Detections & metrics panel
 *   - Mock sensor readout cards
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Flame, Thermometer, Wind, Eye, Scan,
  Radio, Gauge, CloudRain, ArrowRight, Layers,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { PLACEHOLDER_RAW, PLACEHOLDER_PROCESSED } from '@/data/placeholderImagery'

// ─── Mock detection data ────────────────────────────────────────────────────

const mockDetections = [
  { id: 'FIRE_01', lat: -12.95, lon: -56.80, confidence: 94, tempK: 487, smokeDir: 'NE', frp: 142.3, status: 'Active' },
  { id: 'FIRE_02', lat: -13.12, lon: -56.42, confidence: 78, tempK: 412, smokeDir: 'E', frp: 67.8, status: 'Active' },
  { id: 'FIRE_03', lat: -12.78, lon: -57.01, confidence: 62, tempK: 365, smokeDir: 'N', frp: 23.1, status: 'Cooling' },
  { id: 'FIRE_04', lat: -13.45, lon: -56.15, confidence: 45, tempK: 340, smokeDir: 'NW', frp: 11.4, status: 'Smoldering' },
]

const mockSensors = [
  { name: 'Thermal IR', icon: Thermometer, value: '487 K', status: 'active', detail: 'Band 21 (3.9μm)' },
  { name: 'SWIR', icon: Scan, value: '0.82 W/m²', status: 'active', detail: 'Band 7 (2.1μm)' },
  { name: 'Gas/Particulate', icon: Wind, value: 'PM2.5: 285 μg/m³', status: 'warning', detail: 'Estimated from AOD' },
  { name: 'Visible', icon: Eye, value: 'Smoke detected', status: 'active', detail: 'RGB composite' },
  { name: 'Radiometer', icon: Radio, value: '142.3 MW', status: 'active', detail: 'FRP (Band 21+22)' },
  { name: 'Atmospheric', icon: Gauge, value: 'AOD: 2.4', status: 'warning', detail: 'MODIS Aerosol' },
]

// ─── Component ──────────────────────────────────────────────────────────────

export default function Comparison() {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [showSensors, setShowSensors] = useState(true)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPos(pct)
  }, [])

  const handleMouseDown = useCallback(() => setIsDragging(true), [])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => handleMove(e.clientX)
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, handleMove])

  useEffect(() => {
    if (!isDragging) return
    const onTouch = (e: TouchEvent) => handleMove(e.touches[0].clientX)
    const onEnd = () => setIsDragging(false)
    window.addEventListener('touchmove', onTouch)
    window.addEventListener('touchend', onEnd)
    return () => {
      window.removeEventListener('touchmove', onTouch)
      window.removeEventListener('touchend', onEnd)
    }
  }, [isDragging, handleMove])

  return (
    <div className="flex h-full w-full overflow-hidden bg-neutral-950 text-white">
      {/* ── Main comparison area ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Satellite Imagery Comparison</h2>
              <p className="text-xs text-neutral-400">Raw capture vs. SparkGuard CV pipeline output</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className="bg-neutral-800 px-2.5 py-1 rounded-full">MODIS Terra</span>
            <span className="bg-neutral-800 px-2.5 py-1 rounded-full">2024-08-15 14:32 UTC</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">Processed ✓</span>
          </div>
        </div>

        {/* Slider comparison view */}
        <div className="flex-1 relative overflow-hidden" ref={containerRef}>
          {/* Before (raw) — full width background */}
          <img
            src={PLACEHOLDER_RAW}
            alt="Raw satellite capture"
            className="absolute inset-0 w-full h-full object-cover select-none"
            draggable={false}
          />

          {/* After (processed) — clipped to slider position */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${sliderPos}%` }}
          >
            <img
              src={PLACEHOLDER_PROCESSED}
              alt="Processed imagery with detections"
              className="absolute inset-0 w-full h-full object-cover select-none"
              style={{ minWidth: containerRef.current?.offsetWidth ?? '100%' }}
              draggable={false}
            />
          </div>

          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 cursor-col-resize z-10 group"
            style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          >
            {/* Line */}
            <div className="w-0.5 h-full bg-white/70 group-hover:bg-white transition-colors mx-auto" />
            {/* Handle knob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-neutral-900/90 border-2 border-white/80 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ArrowRight className="w-3.5 h-3.5 text-white -rotate-180" />
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Labels */}
          <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-sm text-xs text-neutral-300 px-3 py-1.5 rounded-full border border-neutral-700 font-mono">
            RAW CAPTURE
          </div>
          <div className="absolute top-4 right-4 bg-emerald-900/80 backdrop-blur-sm text-xs text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-700 font-mono">
            CV PROCESSED
          </div>
        </div>
      </div>

      {/* ── Right panel: Detections + Sensors ────────────────────── */}
      <div className="w-[380px] flex-shrink-0 border-l border-neutral-800 bg-neutral-900/50 overflow-y-auto">
        {/* Detections header */}
        <div className="p-4 border-b border-neutral-800">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-400" />
            Detections & Metrics
          </h3>
          <p className="text-xs text-neutral-500">{mockDetections.length} hotspots identified by CV pipeline</p>
        </div>

        {/* Detection cards */}
        <div className="p-3 space-y-2 border-b border-neutral-800">
          {mockDetections.map((d) => (
            <div
              key={d.id}
              className="bg-neutral-800/60 border border-neutral-700/60 rounded-lg p-3 hover:border-neutral-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-white">{d.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  d.status === 'Active' ? 'bg-red-500/20 text-red-400' :
                  d.status === 'Cooling' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-neutral-700 text-neutral-400'
                }`}>
                  {d.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Confidence</span>
                  <span className={`font-medium ${d.confidence > 80 ? 'text-emerald-400' : d.confidence > 60 ? 'text-amber-400' : 'text-neutral-300'}`}>
                    {d.confidence}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Temp</span>
                  <span className="font-medium text-red-300">{d.tempK} K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">FRP</span>
                  <span className="font-medium text-orange-300">{d.frp} MW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Smoke</span>
                  <span className="font-medium text-blue-300">→ {d.smokeDir}</span>
                </div>
                <div className="col-span-2 flex justify-between">
                  <span className="text-neutral-500">Coordinates</span>
                  <span className="font-mono text-neutral-300">{d.lat.toFixed(3)}, {d.lon.toFixed(3)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sensors section */}
        <div className="p-4">
          <button
            onClick={() => setShowSensors(!showSensors)}
            className="flex items-center justify-between w-full text-sm font-semibold mb-3 hover:text-neutral-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              Sensor Readouts
            </span>
            {showSensors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSensors && (
            <div className="grid grid-cols-2 gap-2">
              {mockSensors.map((sensor) => {
                const Icon = sensor.icon
                return (
                  <div
                    key={sensor.name}
                    className="bg-neutral-800/60 border border-neutral-700/50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-3.5 h-3.5 ${
                        sensor.status === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      }`} />
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wide">{sensor.name}</span>
                    </div>
                    <p className="text-sm font-semibold text-white mb-0.5">{sensor.value}</p>
                    <p className="text-[10px] text-neutral-500">{sensor.detail}</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        sensor.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className="text-[9px] text-neutral-500 uppercase">
                        {sensor.status === 'warning' ? 'Elevated' : 'Nominal'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pipeline info */}
        <div className="p-4 border-t border-neutral-800">
          <div className="bg-neutral-800/40 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-neutral-300 mb-2">Pipeline Info</h4>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Model</span>
                <span className="text-neutral-300 font-mono">YOLOv8-fire + SAM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Inference time</span>
                <span className="text-neutral-300">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Resolution</span>
                <span className="text-neutral-300">1km → 250m (super-res)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Satellite</span>
                <span className="text-neutral-300">Terra / MODIS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">CubeSat feed</span>
                <span className="text-amber-400 italic">Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
