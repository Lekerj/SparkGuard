import type { IncidentPackage } from '@/components/IncidentPackagePanel'

export interface HotspotDetection {
  id: string
  lat: number
  lon: number
  timestamp: string
  confidence: number
  source: string
}

export interface WeatherData {
  windSpeed: string
  windDirection: string
  humidity: string
  temperature: string
}

export interface TerrainData {
  slope: string
  vegetation: string
  elevation: string
}

export interface InfrastructureData {
  nearbyRoads: number
  nearbyBuildings: number
  nearestCommunity: string
  distanceToCommmunity: string
}

export interface Incident {
  id: string
  title: string
  status: 'new' | 'analyzing' | 'ready' | 'dispatched'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  spreadRisk: 'low' | 'medium' | 'high'
  detectedAt: string
  hotspots: HotspotDetection[]
  weather: WeatherData
  terrain: TerrainData
  infrastructure: InfrastructureData
}

// Scenario A: Wildland interface fire near community
export const scenarioAHotspots: HotspotDetection[] = [
  {
    id: 'hs-001',
    lat: 34.0522,
    lon: -118.2437,
    timestamp: '2024-08-15T14:32:00Z',
    confidence: 92,
    source: 'Thermal Anomaly Detection (Demo)',
  },
  {
    id: 'hs-002',
    lat: 34.0518,
    lon: -118.2441,
    timestamp: '2024-08-15T14:35:00Z',
    confidence: 88,
    source: 'Thermal Anomaly Detection (Demo)',
  },
  {
    id: 'hs-003',
    lat: 34.0525,
    lon: -118.2432,
    timestamp: '2024-08-15T14:38:00Z',
    confidence: 95,
    source: 'Multispectral Analysis (Demo)',
  },
]

export const scenarioAWeather: WeatherData = {
  windSpeed: '25 mph',
  windDirection: 'NE',
  humidity: '15%',
  temperature: '98°F',
}

export const scenarioATerrain: TerrainData = {
  slope: '18° (Moderate)',
  vegetation: 'Dry chaparral, high fuel load',
  elevation: '1,250 ft',
}

export const scenarioAInfrastructure: InfrastructureData = {
  nearbyRoads: 3,
  nearbyBuildings: 47,
  nearestCommunity: 'Oak Valley Estates',
  distanceToCommmunity: '0.8 miles',
}

export const scenarioAIncident: Incident = {
  id: 'inc-a-001',
  title: 'Wildland-Urban Interface Fire - Oak Valley',
  status: 'ready',
  severity: 'high',
  confidence: 91,
  spreadRisk: 'high',
  detectedAt: '2024-08-15T14:32:00Z',
  hotspots: scenarioAHotspots,
  weather: scenarioAWeather,
  terrain: scenarioATerrain,
  infrastructure: scenarioAInfrastructure,
}

export const scenarioAPackage: IncidentPackage = {
  id: 'pkg-a-001',
  title: 'Wildland-Urban Interface Fire - Oak Valley',
  location: {
    lat: 34.0522,
    lon: -118.2437,
    description: 'Oak Valley foothills, 0.8 miles from Oak Valley Estates residential area',
  },
  weather: {
    temperature: '98°F',
    humidity: '15%',
    windSpeed: '25 mph',
    windDirection: 'NE (toward community)',
  },
  severity: 'high',
  confidence: 91,
  spreadRisk: 'high',
  recommendedActions: [
    'Dispatch aerial reconnaissance for visual confirmation',
    'Alert Oak Valley Estates community (47 structures at risk)',
    'Position engine companies on Ridgeline Road for structure protection',
    'Request additional air tanker support for perimeter control',
    'Establish evacuation routes via Highway 18 (eastbound)',
  ],
  safetyNotes: [
    'Wind direction shifting NE - monitor for spot fires ahead of main front',
    'Low humidity (15%) increases ember transport risk',
    'Steep terrain on west flank may limit ground access',
    'Power lines along Oak Valley Road - coordinate with utility company',
  ],
  uncertaintyFlags: [],
  requiresHumanReview: false,
  generatedAt: '2024-08-15T14:45:00Z',
}

// Scenario B: Smoke plume + hotspot cluster with low confidence
export const scenarioBHotspots: HotspotDetection[] = [
  {
    id: 'hs-b-001',
    lat: 36.7783,
    lon: -119.4179,
    timestamp: '2024-08-15T16:12:00Z',
    confidence: 62,
    source: 'Smoke Plume Detection (Demo)',
  },
  {
    id: 'hs-b-002',
    lat: 36.7791,
    lon: -119.4185,
    timestamp: '2024-08-15T16:15:00Z',
    confidence: 58,
    source: 'Thermal Anomaly Detection (Demo)',
  },
]

export const scenarioBWeather: WeatherData = {
  windSpeed: '8 mph',
  windDirection: 'W',
  humidity: '42%',
  temperature: '82°F',
}

export const scenarioBTerrain: TerrainData = {
  slope: '5° (Gentle)',
  vegetation: 'Agricultural / grassland mix',
  elevation: '340 ft',
}

export const scenarioBInfrastructure: InfrastructureData = {
  nearbyRoads: 5,
  nearbyBuildings: 12,
  nearestCommunity: 'Central Valley Agricultural District',
  distanceToCommmunity: '2.1 miles',
}

export const scenarioBIncident: Incident = {
  id: 'inc-b-001',
  title: 'Smoke Plume Detection - Agricultural Area',
  status: 'analyzing',
  severity: 'medium',
  confidence: 58,
  spreadRisk: 'low',
  detectedAt: '2024-08-15T16:12:00Z',
  hotspots: scenarioBHotspots,
  weather: scenarioBWeather,
  terrain: scenarioBTerrain,
  infrastructure: scenarioBInfrastructure,
}

export const scenarioBPackage: IncidentPackage = {
  id: 'pkg-b-001',
  title: 'Smoke Plume Detection - Agricultural Area',
  location: {
    lat: 36.7783,
    lon: -119.4179,
    description: 'Central Valley agricultural zone, 2.1 miles from nearest residential structures',
  },
  weather: {
    temperature: '82°F',
    humidity: '42%',
    windSpeed: '8 mph',
    windDirection: 'W',
  },
  severity: 'medium',
  confidence: 58,
  spreadRisk: 'low',
  recommendedActions: [
    'Dispatch ground unit for visual verification',
    'Check agricultural burn permit status for area',
    'Monitor for 30 minutes before escalation decision',
    'Prepare notification to nearby farm operators',
  ],
  safetyNotes: [
    'Possible permitted agricultural burn - verify before response',
    'Industrial facility 1.2 miles east - rule out industrial source',
    'Low wind and moderate humidity reduce immediate spread risk',
  ],
  uncertaintyFlags: [
    'Low confidence detection (58%)',
    'Possible agricultural burn',
    'Industrial source not ruled out',
    'Incomplete thermal signature',
  ],
  requiresHumanReview: true,
  generatedAt: '2024-08-15T16:20:00Z',
}

// Alert log entries
export interface AlertLogEntry {
  id: string
  timestamp: string
  channel: 'email' | 'sms' | 'webhook' | 'export'
  status: 'sent' | 'pending' | 'failed'
  recipient: string
  incidentId: string
  message: string
}

export const mockAlertLog: AlertLogEntry[] = [
  {
    id: 'alert-001',
    timestamp: '2024-08-15T14:47:00Z',
    channel: 'email',
    status: 'sent',
    recipient: 'oak-valley-fd@example.com',
    incidentId: 'inc-a-001',
    message: 'High Priority: WUI Fire Alert - Oak Valley',
  },
  {
    id: 'alert-002',
    timestamp: '2024-08-15T14:47:15Z',
    channel: 'sms',
    status: 'sent',
    recipient: '+1-555-0123',
    incidentId: 'inc-a-001',
    message: 'ALERT: Fire detected near Oak Valley Estates. Check email for details.',
  },
  {
    id: 'alert-003',
    timestamp: '2024-08-15T14:47:30Z',
    channel: 'webhook',
    status: 'sent',
    recipient: 'https://cad.example.com/api/incidents',
    incidentId: 'inc-a-001',
    message: 'Incident package dispatched to CAD system',
  },
]

// Pipeline artifacts
export const pipelineArtifacts = {
  ingest: {
    source: 'thermal_anomaly_feed',
    timestamp: '2024-08-15T14:32:00Z',
    raw_detections: 3,
    format: 'GeoJSON',
    status: 'received',
  },
  normalize: {
    detections_processed: 3,
    coordinate_system: 'WGS84',
    time_standardized: 'UTC',
    duplicates_removed: 0,
    schema_version: '2.1',
  },
  enrich: {
    weather_attached: true,
    terrain_attached: true,
    infrastructure_attached: true,
    historical_fires_nearby: 2,
    vegetation_index: 0.82,
  },
  analyze: {
    model_version: 'v3.2.1',
    confidence_score: 0.91,
    severity_classification: 'high',
    spread_prediction: 'high',
    estimated_acres: '5-15',
  },
  decide: {
    recommended_response: 'immediate',
    resource_suggestion: ['engine_company', 'air_tanker', 'evacuation_team'],
    human_review_required: false,
    auto_dispatch_eligible: true,
  },
  dispatch: {
    channels_configured: ['email', 'sms', 'webhook'],
    recipients: 3,
    package_format: 'structured_brief',
    export_available: true,
  },
}
