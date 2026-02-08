/**
 * FireGlobe — Interactive 3D Earth globe showing fire detection hotspots.
 *
 * Uses react-globe.gl (Three.js) with local textures (no external tile APIs).
 * Points are rendered from preprocessed per-country JSON data.
 * Globe auto-rotates until user interacts. Selecting a country zooms to it.
 *
 * Texture setup:
 *   Place earth texture images in public/assets/textures/:
 *     • earth-blue-marble.jpg   (2K–4K NASA Blue Marble day map, public domain)
 *     • earth-topology.png      (optional bump map)
 *     • night-sky.png           (star background)
 *
 *   Free sources:
 *     • NASA Visible Earth: https://visibleearth.nasa.gov/collection/1484/blue-marble
 *     • three-globe examples:  https://unpkg.com/three-globe/example/img/
 *
 *   If textures are missing, the globe renders with default colors (still functional).
 */

import { useRef, useEffect, useState, useMemo, lazy, Suspense, useCallback } from 'react'
import type { CountryFireStats, FirePoint } from '@/types/fireData'

const GlobeGL = lazy(() => import('react-globe.gl'))

// ─── Point data shape for react-globe.gl ────────────────────────────────────

interface GlobePoint {
  lat: number
  lng: number
  color: string
  radius: number
  altitude: number
  label: string
}

// ─── Color by FRP ───────────────────────────────────────────────────────────

function frpColor(frp: number): string {
  if (frp > 200) return '#dc2626' // red-600
  if (frp > 80) return '#ef4444'  // red-500
  if (frp > 20) return '#f59e0b'  // amber-500
  return '#22c55e'                // green-500
}

function frpRadius(frp: number): number {
  if (frp > 200) return 0.5
  if (frp > 80) return 0.38
  if (frp > 20) return 0.28
  return 0.2
}

// ─── Texture path helpers ───────────────────────────────────────────────────

const LOCAL_TEXTURES = {
  globe: '/assets/textures/earth-blue-marble.jpg',
  bump: '/assets/textures/earth-topology.png',
  background: '/assets/textures/night-sky.png',
}

// Fallback to unpkg CDN textures (Three.js examples, no API key needed)
const FALLBACK_TEXTURES = {
  globe: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  bump: '//unpkg.com/three-globe/example/img/earth-topology.png',
  background: '//unpkg.com/three-globe/example/img/night-sky.png',
}

function useTextureUrl(local: string, fallback: string): string {
  const [url, setUrl] = useState(local)

  useEffect(() => {
    // Check if local texture exists
    fetch(local, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) setUrl(fallback)
      })
      .catch(() => setUrl(fallback))
  }, [local, fallback])

  return url
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface FireGlobeProps {
  /** Fire detection points to render on globe */
  points: FirePoint[]
  /** All country stats — used to render country-center markers when no country is selected */
  countries: CountryFireStats[]
  /** Currently focused country (zooms globe to it) */
  focusCountry: CountryFireStats | null
  /** Called when a country center marker is clicked */
  onCountryClick?: (country: string) => void
  className?: string
}

export default function FireGlobe({
  points,
  countries,
  focusCountry,
  onCountryClick,
  className = '',
}: FireGlobeProps) {
  const globeRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const globeUrl = useTextureUrl(LOCAL_TEXTURES.globe, FALLBACK_TEXTURES.globe)
  const bumpUrl = useTextureUrl(LOCAL_TEXTURES.bump, FALLBACK_TEXTURES.bump)
  const bgUrl = useTextureUrl(LOCAL_TEXTURES.background, FALLBACK_TEXTURES.background)

  // ── Responsive sizing ─────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ── Auto-rotate ───────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const globe = globeRef.current
        if (!globe || typeof globe.controls !== 'function') return
        const controls = globe.controls()
        if (controls) {
          controls.autoRotate = true
          controls.autoRotateSpeed = 0.35
          controls.enableZoom = true
          controls.minDistance = 180
          controls.maxDistance = 600
        }
      } catch { /* not ready yet */ }
    }, 600)
    return () => clearTimeout(timer)
  }, [dimensions])

  // ── Zoom to focused country ───────────────────────────────────────────
  useEffect(() => {
    if (!focusCountry || !globeRef.current) return
    try {
      const { center, bbox } = focusCountry
      // Compute altitude from bbox size
      const latSpan = bbox.max_lat - bbox.min_lat
      const lonSpan = bbox.max_lon - bbox.min_lon
      const span = Math.max(latSpan, lonSpan)
      const altitude = Math.min(Math.max(span / 30, 0.8), 3.5)

      globeRef.current.pointOfView(
        { lat: center.lat, lng: center.lon, altitude },
        900,
      )
    } catch { /* scene not ready */ }
  }, [focusCountry])

  // ── Build point data ──────────────────────────────────────────────────
  const pointsData: GlobePoint[] = useMemo(() => {
    if (points.length > 0) {
      // Render actual fire detection points
      return points.map((p) => ({
        lat: p.lat,
        lng: p.lng,
        color: frpColor(p.frp),
        radius: frpRadius(p.frp),
        altitude: 0.01,
        label: `FRP: ${p.frp} MW | ${p.date} | Conf: ${p.confidence}%`,
      }))
    }

    // No specific country selected — show country centers as aggregate markers
    return countries
      .filter((c) => c.detections_count > 100)
      .map((c) => ({
        lat: c.center.lat,
        lng: c.center.lon,
        color: frpColor(c.avg_frp),
        radius: Math.min(0.3 + Math.log10(c.detections_count) * 0.15, 1.2),
        altitude: 0.01,
        label: `${c.country}: ${c.detections_count.toLocaleString()} detections`,
      }))
  }, [points, countries])

  // ── Selection ring ────────────────────────────────────────────────────
  const ringsData = useMemo(() => {
    if (!focusCountry) return []
    return [{
      lat: focusCountry.center.lat,
      lng: focusCountry.center.lon,
      maxR: 5,
      propagationSpeed: 2,
      repeatPeriod: 1200,
    }]
  }, [focusCountry])

  // ── Click handler ─────────────────────────────────────────────────────
  const handlePointClick = useCallback(
    (point: object) => {
      const p = point as GlobePoint
      // Try to match a country by label
      if (p.label.includes(':')) {
        const countryName = p.label.split(':')[0]
        const match = countries.find((c) => c.country === countryName)
        if (match) {
          onCountryClick?.(match.country)
        }
      }
    },
    [countries, onCountryClick],
  )

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-square max-h-[560px] ${className}`}
      role="img"
      aria-label="Interactive 3D globe showing fire detection hotspots"
    >
      {dimensions.width > 0 && (
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-neutral-950 rounded-xl">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-neutral-400">Initializing globe…</p>
              </div>
            </div>
          }
        >
          <GlobeGL
            ref={globeRef}
            width={dimensions.width}
            height={dimensions.height}
            globeImageUrl={globeUrl}
            bumpImageUrl={bumpUrl}
            backgroundImageUrl={bgUrl}
            atmosphereColor="#38bdf8"
            atmosphereAltitude={0.18}
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
        </Suspense>
      )}

      {/* Overlay — data source label */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
        <span className="text-[10px] text-neutral-400 bg-neutral-950/70 px-2 py-1 rounded font-mono">
          MODIS 2024 · {pointsData.length.toLocaleString()} pts
        </span>
      </div>

      {/* FRP legend */}
      <div className="absolute top-3 right-3 bg-neutral-950/70 rounded-lg p-2 pointer-events-none">
        <p className="text-[9px] text-neutral-400 font-mono mb-1">FRP (MW)</p>
        <div className="flex flex-col gap-0.5 text-[9px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" />&gt;200</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />80–200</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />20–80</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />&lt;20</span>
        </div>
      </div>
    </div>
  )
}
