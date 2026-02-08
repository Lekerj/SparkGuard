/**
 * FireGlobe — Interactive 3D Earth globe showing fire detection hotspots.
 *
 * Uses react-globe.gl (Three.js) with high-quality NASA Blue Marble textures.
 * Points are rendered from preprocessed per-country JSON data.
 * Globe auto-rotates until user interacts. Selecting a country zooms to it.
 *
 * The globe fills its parent container completely (must have explicit height).
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import GlobeGL from 'react-globe.gl'
import type { CountryFireStats, FirePoint } from '@/types/fireData'
import type { WildfireEvent } from '@/types/wildfireEvent'

// ─── Point data shape for react-globe.gl ────────────────────────────────────

interface GlobePoint {
  lat: number
  lng: number
  color: string
  radius: number
  altitude: number
  label: string
  // original data for event selection
  _frp: number
  _brightness: number
  _confidence: number
  _date: string
  _daynight: string
  _country?: string
  _isCountryCenter?: boolean
}

// ─── Color by FRP ───────────────────────────────────────────────────────────

function frpColor(frp: number): string {
  if (frp > 200) return '#dc2626'
  if (frp > 80) return '#ef4444'
  if (frp > 20) return '#f59e0b'
  return '#22c55e'
}

function frpRadius(frp: number): number {
  if (frp > 200) return 0.45
  if (frp > 80) return 0.35
  if (frp > 20) return 0.25
  return 0.18
}

// ─── Texture URLs — use CDN directly for reliability ────────────────────────

const TEXTURES = {
  globe: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  bump: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
  background: 'https://unpkg.com/three-globe/example/img/night-sky.png',
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface FireGlobeProps {
  points: FirePoint[]
  countries: CountryFireStats[]
  focusCountry: CountryFireStats | null
  onCountryClick?: (country: string) => void
  onPointSelect?: (event: WildfireEvent) => void
  dateRange?: [string, string]
  statusFilter?: string
  className?: string
}

/** Assign a status to a fire detection based on its date relative to 'now' (2024-12-31). */
function inferStatus(date: string): 'historical' | 'active' | 'predicted' {
  // We treat Q4 2024 as "active", everything before as "historical",
  // and any detection with very high FRP in Dec as potentially "predicted" spread risk.
  const month = parseInt(date.split('-')[1] ?? '1', 10)
  if (month >= 11) return 'active'
  if (month >= 9) return 'predicted'
  return 'historical'
}

export default function FireGlobe({
  points,
  countries,
  focusCountry,
  onCountryClick,
  onPointSelect,
  dateRange,
  statusFilter,
  className = '',
}: FireGlobeProps) {
  const globeRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [globeReady, setGlobeReady] = useState(false)

  // ── Responsive sizing — fills entire container ────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Immediate measure
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      setDimensions({ width: rect.width, height: rect.height })
    }

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) {
        setDimensions({ width, height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ── Auto-rotate + controls ────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const globe = globeRef.current
        if (!globe || typeof globe.controls !== 'function') return
        const controls = globe.controls()
        if (controls) {
          controls.autoRotate = true
          controls.autoRotateSpeed = 0.3
          controls.enableZoom = true
          controls.minDistance = 120
          controls.maxDistance = 800
          controls.enableDamping = true
          controls.dampingFactor = 0.1
        }
      } catch { /* globe not ready */ }
    }, 800)
    return () => clearTimeout(timer)
  }, [dimensions])

  // ── Zoom to focused country ───────────────────────────────────────────
  useEffect(() => {
    if (!focusCountry || !globeRef.current) return
    try {
      const { center, bbox } = focusCountry
      const latSpan = bbox.max_lat - bbox.min_lat
      const lonSpan = bbox.max_lon - bbox.min_lon
      const span = Math.max(latSpan, lonSpan)
      const altitude = Math.min(Math.max(span / 30, 0.8), 3.5)

      globeRef.current.pointOfView(
        { lat: center.lat, lng: center.lon, altitude },
        1000,
      )

      // Pause auto-rotate when viewing a country
      try {
        const controls = globeRef.current.controls()
        if (controls) controls.autoRotate = false
      } catch { /* */ }
    } catch { /* scene not ready */ }
  }, [focusCountry])

  // ── Build point data ──────────────────────────────────────────────────
  const pointsData: GlobePoint[] = useMemo(() => {
    if (points.length > 0) {
      // Apply date range filter
      let filtered = points
      if (dateRange) {
        const [start, end] = dateRange
        filtered = filtered.filter(p => p.date >= start && p.date <= end)
      }
      // Apply status filter
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter(p => inferStatus(p.date) === statusFilter)
      }
      return filtered.map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        color: frpColor(p.frp),
        radius: frpRadius(p.frp),
        altitude: 0.008,
        label: `<div style="background:rgba(0,0,0,0.85);padding:8px 12px;border-radius:8px;font-size:11px;color:white;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(8px);min-width:160px">
          <div style="font-weight:600;margin-bottom:4px;color:#f97066">🔥 Fire Detection</div>
          <div>FRP: <b>${p.frp} MW</b></div>
          <div>Date: ${p.date}</div>
          <div>Confidence: ${p.confidence}%</div>
          <div>Brightness: ${p.brightness} K</div>
          <div style="color:#888;margin-top:4px;font-size:10px">${p.lat.toFixed(3)}°, ${p.lng.toFixed(3)}°</div>
        </div>`,
        _frp: p.frp,
        _brightness: p.brightness,
        _confidence: p.confidence,
        _date: p.date,
        _daynight: p.daynight,
        _country: focusCountry?.country,
      }))
    }

    // Country center markers
    return countries
      .filter((c) => c.detections_count > 50)
      .map((c) => ({
        lat: c.center.lat,
        lng: c.center.lon,
        color: frpColor(c.avg_frp),
        radius: Math.min(0.3 + Math.log10(c.detections_count) * 0.12, 1.0),
        altitude: 0.005,
        label: `<div style="background:rgba(0,0,0,0.85);padding:8px 12px;border-radius:8px;font-size:11px;color:white;border:1px solid rgba(255,255,255,0.1);min-width:140px">
          <div style="font-weight:600;margin-bottom:4px">${c.country}</div>
          <div>${c.detections_count.toLocaleString()} detections</div>
          <div>Avg FRP: ${c.avg_frp} MW</div>
          <div style="color:#888;margin-top:2px;font-size:10px">Click to explore</div>
        </div>`,
        _frp: c.avg_frp,
        _brightness: c.max_brightness,
        _confidence: c.avg_confidence,
        _date: c.date_range.earliest,
        _daynight: 'D',
        _country: c.country,
        _isCountryCenter: true,
      }))
  }, [points, countries, focusCountry, dateRange, statusFilter])

  // ── Selection ring ────────────────────────────────────────────────────
  const ringsData = useMemo(() => {
    if (!focusCountry) return []
    return [{
      lat: focusCountry.center.lat,
      lng: focusCountry.center.lon,
      maxR: 5,
      propagationSpeed: 2,
      repeatPeriod: 1500,
    }]
  }, [focusCountry])

  // ── Click handler ─────────────────────────────────────────────────────
  const handlePointClick = useCallback(
    (point: object) => {
      const p = point as GlobePoint

      if (p._isCountryCenter) {
        // Click on country center → zoom to country
        if (p._country) onCountryClick?.(p._country)
        return
      }

      // Click on fire point → create a WildfireEvent and notify parent
      if (onPointSelect) {
        const event: WildfireEvent = {
          id: `fire-${p.lat}-${p.lng}-${Date.now()}`,
          lat: p.lat,
          lon: p.lng,
          startDate: p._date,
          confidence: p._confidence,
          intensity: p._frp,
          brightness: p._brightness,
          country: p._country,
          status: inferStatus(p._date),
          daynight: p._daynight as 'D' | 'N',
        }
        onPointSelect(event)
      }

      // Fly to the clicked point
      try {
        globeRef.current?.pointOfView(
          { lat: p.lat, lng: p.lng, altitude: 0.6 },
          800,
        )
      } catch { /* */ }
    },
    [countries, onCountryClick, onPointSelect],
  )

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: '100%', height: '100%', minHeight: 400 }}
      role="img"
      aria-label="Interactive 3D globe showing fire detection hotspots"
    >
      {/* Loading overlay — shows until globe fires onGlobeReady */}
      {!globeReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-neutral-400 font-medium">Loading 3D Globe…</p>
            <p className="text-xs text-neutral-600 mt-1">Downloading Earth textures</p>
          </div>
        </div>
      )}

      {dimensions.width > 0 && dimensions.height > 0 && (
        <GlobeGL
          ref={globeRef}
          width={dimensions.width}
          height={dimensions.height}
          globeImageUrl={TEXTURES.globe}
          bumpImageUrl={TEXTURES.bump}
          backgroundImageUrl={TEXTURES.background}
          showAtmosphere={true}
          atmosphereColor="#4da6ff"
          atmosphereAltitude={0.2}
          animateIn={true}
          onGlobeReady={() => setGlobeReady(true)}
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="radius"
          pointAltitude="altitude"
          pointLabel="label"
          onPointClick={handlePointClick}
          ringsData={ringsData}
          ringColor={() => '#f97066'}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
        />
      )}
    </div>
  )
}
