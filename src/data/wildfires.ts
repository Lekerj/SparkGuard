export type WildfireSeverity = 'Low' | 'Moderate' | 'High' | 'Extreme'

export interface WildfireRecord {
  id: string
  name: string
  region: string
  coordinates: {
    lat: number
    lon: number
  }
  startedAt: string
  updatedAt: string
  severity: WildfireSeverity
  areaBurnedHa?: number
  confidence: number
  source: string
}

export const mockWildfires: WildfireRecord[] = [
  {
    id: 'wf-001',
    name: 'Red Ridge Fire',
    region: 'Northern Sierra, CA',
    coordinates: { lat: 39.615, lon: -120.215 },
    startedAt: '2026-02-06T18:10:00Z',
    updatedAt: '2026-02-07T02:30:00Z',
    severity: 'High',
    areaBurnedHa: 1840,
    confidence: 87,
    source: 'Satellite thermal anomaly (mock)',
  },
  {
    id: 'wf-002',
    name: 'Mesa Creek',
    region: 'Central AZ',
    coordinates: { lat: 34.118, lon: -111.722 },
    startedAt: '2026-02-06T21:05:00Z',
    updatedAt: '2026-02-07T04:10:00Z',
    severity: 'Moderate',
    areaBurnedHa: 420,
    confidence: 78,
    source: 'Multispectral hotspot cluster (mock)',
  },
  {
    id: 'wf-003',
    name: 'Cedar Flats',
    region: 'Western CO',
    coordinates: { lat: 39.102, lon: -107.911 },
    startedAt: '2026-02-07T00:15:00Z',
    updatedAt: '2026-02-07T05:30:00Z',
    severity: 'Low',
    areaBurnedHa: 65,
    confidence: 62,
    source: 'Smoke plume detection (mock)',
  },
  {
    id: 'wf-004',
    name: 'Black Pine',
    region: 'Eastern WA',
    coordinates: { lat: 47.121, lon: -117.312 },
    startedAt: '2026-02-06T15:40:00Z',
    updatedAt: '2026-02-07T03:55:00Z',
    severity: 'Extreme',
    areaBurnedHa: 5310,
    confidence: 92,
    source: 'Thermal anomaly + wind model (mock)',
  },
  {
    id: 'wf-005',
    name: 'Sage Valley',
    region: 'Southern NV',
    coordinates: { lat: 36.095, lon: -115.402 },
    startedAt: '2026-02-06T10:20:00Z',
    updatedAt: '2026-02-06T22:45:00Z',
    severity: 'Moderate',
    areaBurnedHa: 310,
    confidence: 73,
    source: 'Hotspot detection (mock)',
  },
]

export interface WildfireCsvParseResult {
  records: WildfireRecord[]
  errors: string[]
}

export function parseWildfireCsv(csvText: string): WildfireCsvParseResult {
  if (!csvText.trim()) {
    return { records: [], errors: ['CSV is empty'] }
  }

  const lines = csvText.trim().split(/\r?\n/)
  const headers = lines[0]?.split(',').map((h) => h.trim()) || []

  const required = ['id', 'name', 'region', 'lat', 'lon', 'startedAt', 'updatedAt', 'severity', 'confidence', 'source']
  const missing = required.filter((h) => !headers.includes(h))
  if (missing.length > 0) {
    return { records: [], errors: [`Missing required headers: ${missing.join(', ')}`] }
  }

  const records: WildfireRecord[] = []
  const errors: string[] = []

  lines.slice(1).forEach((line, index) => {
    if (!line.trim()) return
    const values = line.split(',').map((v) => v.trim())
    const row = Object.fromEntries(headers.map((h, i) => [h, values[i]]))

    const lat = Number(row.lat)
    const lon = Number(row.lon)
    const confidence = Number(row.confidence)

    if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(confidence)) {
      errors.push(`Row ${index + 2}: invalid lat/lon/confidence`)
      return
    }

    records.push({
      id: row.id,
      name: row.name,
      region: row.region,
      coordinates: { lat, lon },
      startedAt: row.startedAt,
      updatedAt: row.updatedAt,
      severity: (row.severity as WildfireSeverity) || 'Low',
      areaBurnedHa: row.areaBurnedHa ? Number(row.areaBurnedHa) : undefined,
      confidence,
      source: row.source,
    })
  })

  return { records, errors }
}
