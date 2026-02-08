/**
 * FireGlobe — Interactive 3D Earth globe showing live fire detection hotspots.
 *
 * Uses react-globe.gl (Three.js) with high-quality NASA Blue Marble textures.
 * Points are rendered from live NASA FIRMS VIIRS data.
 * Perimeter polygons from WFIGS (US) and CWFIS (Canada).
 *
 * The globe fills its parent container completely (must have explicit height).
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import GlobeGL from 'react-globe.gl'
import type { FirePoint } from '@/types/fireData'
import type { WildfireEvent } from '@/types/wildfireEvent'
import type { FirePerimeter } from '@/types/firePerimeter'

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
}

// ─── Color by FRP — brighter, more visible colors ──────────────────────────

function frpColor(frp: number): string {
  if (frp > 200) return 'rgba(255, 60, 40, 0.95)'    // intense red
  if (frp > 80)  return 'rgba(255, 120, 30, 0.90)'   // orange
  if (frp > 20)  return 'rgba(255, 200, 50, 0.85)'   // amber/yellow
  return 'rgba(100, 220, 100, 0.80)'                  // green
}

function frpRadius(frp: number): number {
  if (frp > 200) return 0.55
  if (frp > 80) return 0.42
  if (frp > 20) return 0.30
  return 0.20
}

// ─── Texture URLs — use CDN directly for reliability ────────────────────────

const TEXTURES = {
  globe: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  bump: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
  background: 'https://unpkg.com/three-globe/example/img/night-sky.png',
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface FireGlobeProps {
  /** Live FIRMS fire detection points */
  points: FirePoint[]
  onPointSelect?: (event: WildfireEvent) => void
  className?: string
  /** Fire perimeter polygons to render on the globe */
  perimeters?: FirePerimeter[]
  /** Whether to show perimeter polygons */
  showPerimeters?: boolean
  /** Callback when a perimeter polygon is clicked */
  onPerimeterClick?: (perimeter: FirePerimeter) => void
  /** Currently selected event — used for selection indicator + stopping rotation */
  selectedEvent?: WildfireEvent | null
}

export default function FireGlobe({
  points,
  onPointSelect,
  className = '',
  perimeters = [],
  showPerimeters = false,
  onPerimeterClick,
  selectedEvent = null,
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

  // ── Stop rotation when a point is selected, resume when cleared ────────
  useEffect(() => {
    try {
      const globe = globeRef.current
      if (!globe || typeof globe.controls !== 'function') return
      const controls = globe.controls()
      if (controls) {
        controls.autoRotate = !selectedEvent
      }
    } catch { /* globe not ready */ }
  }, [selectedEvent])

  // ── Build point data from live FIRMS detections ───────────────────────
  const pointsData: GlobePoint[] = useMemo(() => {
    return points.map((p) => ({
      lat: p.lat,
      lng: p.lng,
      color: frpColor(p.frp),
      radius: frpRadius(p.frp),
      altitude: 0.012,
      label: `<div style="background:rgba(0,0,0,0.88);padding:10px 14px;border-radius:10px;font-size:11px;color:white;border:1px solid rgba(255,120,50,0.4);backdrop-filter:blur(12px);min-width:170px;box-shadow:0 4px 20px rgba(0,0,0,0.4)">
        <div style="font-weight:700;margin-bottom:6px;color:#ff6b3d;font-size:12px">🔥 Fire Detection</div>
        <div style="margin-bottom:2px">FRP: <b style="color:#ff9040">${p.frp.toFixed(1)} MW</b></div>
        <div style="margin-bottom:2px">Date: ${p.date}</div>
        <div style="margin-bottom:2px">Confidence: ${p.confidence}%</div>
        <div style="margin-bottom:2px">Brightness: ${p.brightness.toFixed(0)} K</div>
        <div style="margin-bottom:2px">${p.daynight === 'D' ? '☀️ Daytime' : '🌙 Nighttime'}</div>
        <div style="color:#888;margin-top:6px;font-size:10px;border-top:1px solid rgba(255,255,255,0.1);padding-top:4px">${p.lat.toFixed(3)}°, ${p.lng.toFixed(3)}°</div>
      </div>`,
      _frp: p.frp,
      _brightness: p.brightness,
      _confidence: p.confidence,
      _date: p.date,
      _daynight: p.daynight,
    }))
  }, [points])

  // ── Pulsing rings on high-FRP fires for visual impact ─────────────────
  const ringsData = useMemo(() => {
    return points
      .filter((p) => p.frp > 50)
      .slice(0, 80)               // cap at 80 rings for performance
      .map((p) => ({
        lat: p.lat,
        lng: p.lng,
        maxR: p.frp > 200 ? 3 : p.frp > 80 ? 2 : 1.2,
        propagationSpeed: p.frp > 200 ? 2 : 1.5,
        repeatPeriod: p.frp > 200 ? 800 : 1200,
        _frp: p.frp,
      }))
  }, [points])

  // ── Selection indicator — bright ring on the selected point ───────────
  const selectionRingData = useMemo(() => {
    if (!selectedEvent) return []
    return [{
      lat: selectedEvent.lat,
      lng: selectedEvent.lon,
      maxR: 4,
      propagationSpeed: 3,
      repeatPeriod: 600,
      _frp: -1, // sentinel for selection ring color
    }]
  }, [selectedEvent])

  // Merge pulsing FRP rings + selection indicator ring
  const allRingsData = useMemo(() => {
    return [...ringsData, ...selectionRingData]
  }, [ringsData, selectionRingData])

  // ── Selected point highlight — renders a larger bright point on top ────
  const selectedPointData = useMemo(() => {
    if (!selectedEvent) return []
    return [{
      lat: selectedEvent.lat,
      lng: selectedEvent.lon,
      color: 'rgba(255, 255, 255, 1)',
      radius: 0.7,
      altitude: 0.018,
      label: '',
      _frp: 0,
      _brightness: 0,
      _confidence: 0,
      _date: '',
      _daynight: '',
    }]
  }, [selectedEvent])

  // Merge all point layers: fire points + selection highlight
  const allPointsData = useMemo(() => {
    return [...pointsData, ...selectedPointData]
  }, [pointsData, selectedPointData])

  // ── Click handler ─────────────────────────────────────────────────────
  const handlePointClick = useCallback(
    (point: object) => {
      const p = point as GlobePoint

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
          status: 'active',
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
    [onPointSelect],
  )

  // ── Perimeter polygon data ────────────────────────────────────────────
  const polygonsData = useMemo(() => {
    if (!showPerimeters || perimeters.length === 0) return []
    return perimeters.map((p) => ({
      geometry: p.geometry,
      _perimeter: p,
    }))
  }, [perimeters, showPerimeters])

  const handlePolygonClick = useCallback(
    (polygon: object) => {
      const d = polygon as { _perimeter: FirePerimeter }
      if (!d._perimeter) return
      onPerimeterClick?.(d._perimeter)

      // Fly to the perimeter
      try {
        globeRef.current?.pointOfView(
          { lat: d._perimeter.lat, lng: d._perimeter.lng, altitude: 1.0 },
          800,
        )
      } catch { /* */ }
    },
    [onPerimeterClick],
  )

  const polygonCapColor = useCallback(
    (d: object) => {
      const peri = (d as { _perimeter: FirePerimeter })._perimeter
      if (!peri) return 'rgba(255, 100, 50, 0.25)'
      // Color by source
      return peri.source === 'WFIGS'
        ? 'rgba(239, 68, 68, 0.30)'   // red for US
        : 'rgba(59, 130, 246, 0.30)'  // blue for Canada
    },
    [],
  )

  const polygonSideColor = useCallback(
    (d: object) => {
      const peri = (d as { _perimeter: FirePerimeter })._perimeter
      return peri?.source === 'WFIGS'
        ? 'rgba(239, 68, 68, 0.15)'
        : 'rgba(59, 130, 246, 0.15)'
    },
    [],
  )

  const polygonStrokeColor = useCallback(
    (d: object) => {
      const peri = (d as { _perimeter: FirePerimeter })._perimeter
      return peri?.source === 'WFIGS'
        ? 'rgba(239, 68, 68, 0.8)'
        : 'rgba(59, 130, 246, 0.8)'
    },
    [],
  )

  const polygonLabel = useCallback(
    (d: object) => {
      const peri = (d as { _perimeter: FirePerimeter })._perimeter
      if (!peri) return ''
      const contained = peri.percentContained != null ? `${peri.percentContained}%` : 'N/A'
      return `<div style="background:rgba(0,0,0,0.88);padding:8px 12px;border-radius:8px;font-size:11px;color:white;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(8px);min-width:180px">
        <div style="font-weight:600;margin-bottom:4px;color:${peri.source === 'WFIGS' ? '#f87171' : '#60a5fa'}">
          🔥 ${peri.name}
        </div>
        <div>Source: <b>${peri.source === 'WFIGS' ? 'US (WFIGS)' : 'Canada (CWFIS)'}</b></div>
        <div>Area: <b>${peri.acres.toLocaleString(undefined, { maximumFractionDigits: 0 })} acres</b></div>
        <div>Contained: <b>${contained}</b></div>
        ${peri.region ? `<div>Region: ${peri.region}</div>` : ''}
        ${peri.discoveryDate ? `<div>Discovered: ${peri.discoveryDate}</div>` : ''}
        <div style="color:#888;margin-top:4px;font-size:10px">${peri.lat.toFixed(3)}°, ${peri.lng.toFixed(3)}°</div>
      </div>`
    },
    [],
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
          pointsData={allPointsData}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="radius"
          pointAltitude="altitude"
          pointLabel="label"
          onPointClick={handlePointClick}
          ringsData={allRingsData}
          ringColor={(d: object) => {
            const frp = (d as { _frp: number })._frp ?? 50
            if (frp === -1) return 'rgba(100, 180, 255, 0.9)' // selection ring — bright blue
            if (frp > 200) return 'rgba(255, 60, 40, 0.7)'
            if (frp > 80) return 'rgba(255, 140, 40, 0.5)'
            return 'rgba(255, 200, 80, 0.4)'
          }}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"
          // ── Perimeter polygons ─────────────────────────────────
          polygonsData={polygonsData}
          polygonGeoJsonGeometry="geometry"
          polygonCapColor={polygonCapColor}
          polygonSideColor={polygonSideColor}
          polygonStrokeColor={polygonStrokeColor}
          polygonAltitude={0.005}
          polygonCapCurvatureResolution={6}
          polygonLabel={polygonLabel}
          polygonsTransitionDuration={400}
          onPolygonClick={handlePolygonClick}
        />
      )}
    </div>
  )
}
