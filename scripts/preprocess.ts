#!/usr/bin/env tsx
/**
 * SparkGuard — Data Preprocessing Pipeline
 *
 * Reads country-level MODIS CSV fire detection files from a source directory
 * (either extracted CSVs or a ZIP), aggregates per-country stats, and produces
 * optimized JSON outputs that the browser can lazy-load.
 *
 * Outputs (written to /public/data/):
 *   • country_fire_stats_2024.json  — per-country summary stats
 *   • points/<Country>.json         — downsampled detection points per country
 *
 * Usage:
 *   npx tsx scripts/preprocess.ts                          # auto-detect
 *   npx tsx scripts/preprocess.ts --source ~/Downloads/2024 # explicit dir
 *   npx tsx scripts/preprocess.ts --source data/2024.zip    # from ZIP
 *
 * Performance strategy:
 *   • Streams CSVs line-by-line (no full file in memory)
 *   • Caps points per country at MAX_POINTS_PER_COUNTRY (default 2000)
 *   • Uses reservoir sampling for uniform downsampling + keeps top-N by FRP
 */

import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, createReadStream } from 'node:fs'
import { join, basename, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import type {
  CountryFireStats,
  CountryFireStatsFile,
  CountryPointsFile,
  FirePoint,
} from './types.js'

// ─── Configuration ──────────────────────────────────────────────────────────

const MAX_POINTS_PER_COUNTRY = 2000
const TOP_FRP_COUNT = 500 // keep the top-N hottest detections guaranteed
const YEAR = 2024

// ─── CLI arg parsing ────────────────────────────────────────────────────────

function getSourcePath(): string {
  const args = process.argv.slice(2)
  const srcIdx = args.indexOf('--source')
  if (srcIdx !== -1 && args[srcIdx + 1]) {
    return resolve(args[srcIdx + 1])
  }

  // Auto-detect common locations
  const candidates = [
    resolve('data/2024'),
    resolve('../2024'),                       // sibling to repo
    join(process.env.HOME || '~', 'Downloads/2024'),
  ]

  for (const c of candidates) {
    if (existsSync(c)) {
      console.log(`  ✓ Auto-detected CSV source: ${c}`)
      return c
    }
  }

  // Check for ZIP
  const zipCandidates = [
    resolve('data/2024.zip'),
    join(process.env.HOME || '~', 'Downloads/2024.zip'),
  ]
  for (const z of zipCandidates) {
    if (existsSync(z)) {
      console.log(`  ✓ Found ZIP: ${z}`)
      return z
    }
  }

  console.error(
    '\n❌ Could not find 2024 CSV source directory.\n' +
    'Place the extracted "2024/" folder (or 2024.zip) at one of:\n' +
    '  • <repo>/data/2024/\n' +
    '  • ~/Downloads/2024/\n' +
    'Or pass --source <path>\n'
  )
  process.exit(1)
}

// ─── CSV line parser ────────────────────────────────────────────────────────

function parseRow(line: string, headers: string[]): Record<string, string> | null {
  // Simple CSV split (our data has no quoted commas)
  const values = line.split(',')
  if (values.length < headers.length) return null
  const row: Record<string, string> = {}
  for (let i = 0; i < headers.length; i++) {
    row[headers[i]] = (values[i] || '').trim()
  }
  return row
}

// ─── Reservoir sampling ─────────────────────────────────────────────────────

function reservoirSample<T>(reservoir: T[], item: T, totalSeen: number, maxSize: number): void {
  if (reservoir.length < maxSize) {
    reservoir.push(item)
  } else {
    const j = Math.floor(Math.random() * totalSeen)
    if (j < maxSize) {
      reservoir[j] = item
    }
  }
}

// ─── Process a single CSV file ─────────────────────────────────────────────

async function processCountryCsv(filePath: string, countryName: string): Promise<{
  stats: CountryFireStats
  points: CountryPointsFile
}> {
  const sampledPoints: FirePoint[] = []
  const topByFrp: FirePoint[] = []

  let totalDetections = 0
  let totalFrp = 0
  let totalConfidence = 0
  let maxBrightness = 0
  let dayCount = 0
  let nightCount = 0
  let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
  let earliest = '9999-99-99', latest = '0000-00-00'

  const reservoirMax = MAX_POINTS_PER_COUNTRY - TOP_FRP_COUNT

  let headers: string[] = []

  const rl = createInterface({
    input: createReadStream(filePath, { encoding: 'utf-8' }),
    crlfDelay: Infinity,
  })

  for await (const line of rl) {
    if (!headers.length) {
      headers = line.split(',').map(h => h.trim().toLowerCase())
      continue
    }

    const row = parseRow(line, headers)
    if (!row) continue

    const lat = parseFloat(row.latitude)
    const lon = parseFloat(row.longitude)
    const confidence = parseInt(row.confidence, 10)
    const frp = parseFloat(row.frp) || 0
    const brightness = parseFloat(row.brightness) || 0
    const date = row.acq_date || ''
    const daynight = row.daynight || 'D'

    if (isNaN(lat) || isNaN(lon)) continue

    totalDetections++
    totalFrp += frp
    totalConfidence += (isNaN(confidence) ? 0 : confidence)
    if (brightness > maxBrightness) maxBrightness = brightness
    if (daynight === 'D') dayCount++; else nightCount++
    if (lat < minLat) minLat = lat
    if (lat > maxLat) maxLat = lat
    if (lon < minLon) minLon = lon
    if (lon > maxLon) maxLon = lon
    if (date < earliest) earliest = date
    if (date > latest) latest = date

    const point: FirePoint = {
      lat: Math.round(lat * 1000) / 1000,
      lng: Math.round(lon * 1000) / 1000,
      frp: Math.round(frp * 10) / 10,
      brightness: Math.round(brightness * 10) / 10,
      confidence,
      date,
      daynight,
    }

    // Reservoir sampling for uniform distribution
    reservoirSample(sampledPoints, point, totalDetections, reservoirMax)

    // Keep top-N by FRP (using a simple sorted insert for streaming)
    if (topByFrp.length < TOP_FRP_COUNT) {
      topByFrp.push(point)
      if (topByFrp.length === TOP_FRP_COUNT) {
        topByFrp.sort((a, b) => a.frp - b.frp)
      }
    } else if (frp > topByFrp[0].frp) {
      topByFrp[0] = point
      // Re-sort to keep the minimum at index 0
      topByFrp.sort((a, b) => a.frp - b.frp)
    }
  }

  // Merge top-FRP + reservoir, deduplicate by lat/lng
  const seen = new Set<string>()
  const merged: FirePoint[] = []
  for (const p of [...topByFrp, ...sampledPoints]) {
    const key = `${p.lat},${p.lng}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(p)
    }
  }

  // Cap at MAX_POINTS_PER_COUNTRY
  const finalPoints = merged.slice(0, MAX_POINTS_PER_COUNTRY)

  const stats: CountryFireStats = {
    country: countryName,
    detections_count: totalDetections,
    total_frp: Math.round(totalFrp * 10) / 10,
    avg_frp: totalDetections > 0 ? Math.round((totalFrp / totalDetections) * 10) / 10 : 0,
    avg_confidence: totalDetections > 0 ? Math.round(totalConfidence / totalDetections) : 0,
    max_brightness: Math.round(maxBrightness * 10) / 10,
    day_count: dayCount,
    night_count: nightCount,
    date_range: { earliest, latest },
    bbox: {
      min_lat: Math.round(minLat * 1000) / 1000,
      max_lat: Math.round(maxLat * 1000) / 1000,
      min_lon: Math.round(minLon * 1000) / 1000,
      max_lon: Math.round(maxLon * 1000) / 1000,
    },
    center: {
      lat: Math.round(((minLat + maxLat) / 2) * 1000) / 1000,
      lon: Math.round(((minLon + maxLon) / 2) * 1000) / 1000,
    },
  }

  return {
    stats,
    points: {
      country: countryName,
      total_raw: totalDetections,
      sampled: finalPoints.length,
      points: finalPoints,
    },
  }
}

// ─── Extract country name from filename ─────────────────────────────────────

function countryFromFilename(filename: string): string {
  // "modis_2024_Saint_Kitts_and_Nevis.csv" → "Saint Kitts and Nevis"
  return basename(filename, '.csv')
    .replace(/^modis_\d{4}_/, '')
    .replace(/_/g, ' ')
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🔥 SparkGuard Data Preprocessing Pipeline')
  console.log('─'.repeat(50))

  const sourcePath = getSourcePath()

  // Handle ZIP vs directory
  let csvDir = sourcePath
  if (sourcePath.endsWith('.zip')) {
    console.log('  📦 ZIP detected — please extract it first.')
    console.log(`     Run: unzip "${sourcePath}" -d data/`)
    process.exit(1)
  }

  if (!existsSync(csvDir)) {
    console.error(`  ❌ Source directory not found: ${csvDir}`)
    process.exit(1)
  }

  // Find all CSV files
  const csvFiles = readdirSync(csvDir)
    .filter(f => f.endsWith('.csv') && f.startsWith('modis_'))
    .sort()

  if (csvFiles.length === 0) {
    console.error(`  ❌ No MODIS CSV files found in ${csvDir}`)
    process.exit(1)
  }

  console.log(`  📂 Source: ${csvDir}`)
  console.log(`  📊 Found ${csvFiles.length} country CSV files`)
  console.log(`  📝 Max points/country: ${MAX_POINTS_PER_COUNTRY}`)
  console.log('')

  // Create output directories
  const outputBase = resolve('public/data')
  const pointsDir = join(outputBase, 'points')
  mkdirSync(pointsDir, { recursive: true })

  const allStats: CountryFireStats[] = []
  let totalDetections = 0
  let processed = 0

  for (const file of csvFiles) {
    const countryName = countryFromFilename(file)
    const filePath = join(csvDir, file)

    process.stdout.write(`  [${++processed}/${csvFiles.length}] ${countryName.padEnd(35)}`)

    try {
      const { stats, points } = await processCountryCsv(filePath, countryName)

      if (stats.detections_count > 0) {
        allStats.push(stats)
        totalDetections += stats.detections_count

        // Write per-country points JSON
        const safeFilename = countryName.replace(/ /g, '_')
        writeFileSync(
          join(pointsDir, `${safeFilename}.json`),
          JSON.stringify(points)
        )

        console.log(`✓  ${stats.detections_count.toLocaleString().padStart(8)} detections → ${points.sampled} pts`)
      } else {
        console.log('–  (no detections)')
      }
    } catch (err) {
      console.log(`✗  Error: ${(err as Error).message}`)
    }
  }

  // Sort by detections_count descending
  allStats.sort((a, b) => b.detections_count - a.detections_count)

  // Write summary stats JSON
  const summary: CountryFireStatsFile = {
    generated_at: new Date().toISOString(),
    year: YEAR,
    total_countries: allStats.length,
    total_detections: totalDetections,
    countries: allStats,
  }

  writeFileSync(
    join(outputBase, 'country_fire_stats_2024.json'),
    JSON.stringify(summary, null, 2)
  )

  console.log('')
  console.log('─'.repeat(50))
  console.log(`  ✅ Done! Processed ${allStats.length} countries, ${totalDetections.toLocaleString()} total detections.`)
  console.log(`  📁 Stats:  public/data/country_fire_stats_2024.json`)
  console.log(`  📁 Points: public/data/points/<Country>.json`)
  console.log('')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
