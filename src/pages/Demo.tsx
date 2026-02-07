import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Satellite,
  Wind,
  Droplets,
  Mountain,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Mail,
  MessageSquare,
  Webhook,
  FileText,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Flame,
} from 'lucide-react'
import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import IncidentPackagePanel from '@/components/IncidentPackagePanel'
import type { IncidentPackage } from '@/components/IncidentPackagePanel'
import { useToast } from '@/components/ui/ToastProvider'
import {
  scenarioAIncident,
  scenarioAPackage,
  scenarioAHotspots,
  scenarioAWeather,
  scenarioATerrain,
  scenarioAInfrastructure,
  scenarioBIncident,
  scenarioBPackage,
  scenarioBHotspots,
  scenarioBWeather,
  scenarioBTerrain,
  scenarioBInfrastructure,
  mockAlertLog,
  type Incident,
  type AlertLogEntry,
} from '@/data/mockIncidents'

type Scenario = 'A' | 'B'

interface SignalToggle {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  enabled: boolean
}

export default function Demo() {
  const { addToast } = useToast()
  const [scenario, setScenario] = useState<Scenario>('A')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    scenarioAIncident
  )
  const [selectedPackage, setSelectedPackage] = useState<IncidentPackage | null>(
    scenarioAPackage
  )
  const [alertLog, setAlertLog] = useState<AlertLogEntry[]>(mockAlertLog)
  const [isDispatching, setIsDispatching] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const [signals, setSignals] = useState<SignalToggle[]>([
    { id: 'hotspots', label: 'Hotspot Detections', icon: Flame, enabled: true },
    { id: 'wind', label: 'Wind Data', icon: Wind, enabled: true },
    { id: 'humidity', label: 'Humidity', icon: Droplets, enabled: true },
    { id: 'terrain', label: 'Terrain/Slope', icon: Mountain, enabled: true },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building, enabled: true },
  ])

  const currentIncident = scenario === 'A' ? scenarioAIncident : scenarioBIncident
  const currentPackage = scenario === 'A' ? scenarioAPackage : scenarioBPackage
  const currentHotspots = scenario === 'A' ? scenarioAHotspots : scenarioBHotspots
  const currentWeather = scenario === 'A' ? scenarioAWeather : scenarioBWeather
  const currentTerrain = scenario === 'A' ? scenarioATerrain : scenarioBTerrain
  const currentInfrastructure = scenario === 'A' ? scenarioAInfrastructure : scenarioBInfrastructure

  const handleScenarioChange = useCallback((newScenario: Scenario) => {
    setScenario(newScenario)
    const newIncident = newScenario === 'A' ? scenarioAIncident : scenarioBIncident
    const newPackage = newScenario === 'A' ? scenarioAPackage : scenarioBPackage
    setSelectedIncident(newIncident)
    setSelectedPackage(newPackage)
    addToast(`Switched to Scenario ${newScenario}`, 'info')
  }, [addToast])

  const handleToggleSignal = useCallback((id: string) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    )
  }, [])

  const handleSelectIncident = useCallback(() => {
    setSelectedIncident(currentIncident)
    setSelectedPackage(currentPackage)
  }, [currentIncident, currentPackage])

  const handleApproveDispatch = useCallback(async () => {
    setIsDispatching(true)
    
    // Simulate dispatch delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newAlerts: AlertLogEntry[] = [
      {
        id: `alert-${Date.now()}-1`,
        timestamp: new Date().toISOString(),
        channel: 'email',
        status: 'sent',
        recipient: 'fire-dept@example.com',
        incidentId: currentIncident.id,
        message: `Alert dispatched: ${currentIncident.title}`,
      },
      {
        id: `alert-${Date.now()}-2`,
        timestamp: new Date().toISOString(),
        channel: 'sms',
        status: 'sent',
        recipient: '+1-555-DEMO',
        incidentId: currentIncident.id,
        message: 'SMS notification sent',
      },
      {
        id: `alert-${Date.now()}-3`,
        timestamp: new Date().toISOString(),
        channel: 'webhook',
        status: 'sent',
        recipient: 'https://cad.example.com/api',
        incidentId: currentIncident.id,
        message: 'Webhook payload delivered',
      },
    ]

    setAlertLog((prev) => [...newAlerts, ...prev])
    setIsDispatching(false)
    addToast('Incident package dispatched successfully (Demo)', 'success')
  }, [currentIncident, addToast])

  const handleExportBrief = useCallback(() => {
    setShowExportModal(true)
  }, [])

  const handlePrint = useCallback(() => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Incident Brief - ${currentPackage.title}</title>
              <style>
                body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                h1 { color: #171717; border-bottom: 2px solid #f04438; padding-bottom: 10px; }
                h2 { color: #404040; margin-top: 24px; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; margin-right: 8px; }
                .badge-high { background: #fef2f2; color: #b91c1c; }
                .badge-medium { background: #fffbeb; color: #b45309; }
                .badge-low { background: #ecfdf5; color: #047857; }
                .section { margin: 20px 0; padding: 16px; background: #fafafa; border-radius: 8px; }
                .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 16px 0; }
                ul { padding-left: 20px; }
                li { margin: 8px 0; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 12px; color: #737373; }
              </style>
            </head>
            <body>
              ${printContents}
              <div class="footer">
                <p>Generated by SparkGuard (Demo) - ${new Date().toLocaleString()}</p>
                <p><strong>DISCLAIMER:</strong> This is simulated data for demonstration purposes only.</p>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }, [currentPackage])

  const channelIcons = {
    email: Mail,
    sms: MessageSquare,
    webhook: Webhook,
    export: FileText,
  }

  const statusColors = {
    sent: 'success',
    pending: 'warning',
    failed: 'danger',
  } as const

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <div className="bg-neutral-900 text-white py-4 sticky top-16 lg:top-20 z-40">
        <Container>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold">Interactive Demo</h1>
                <Badge variant="demo">Simulated Data</Badge>
              </div>
              <p className="text-sm text-neutral-400">
                Experience the SparkGuard pipeline with mock incident scenarios
              </p>
            </div>

            {/* Scenario Toggle */}
            <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => handleScenarioChange('A')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scenario === 'A'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Scenario A
              </button>
              <button
                onClick={() => handleScenarioChange('B')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  scenario === 'B'
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Scenario B
              </button>
            </div>
          </div>

          {/* Scenario Description */}
          <div className="mt-4 p-3 bg-neutral-800 rounded-lg">
            {scenario === 'A' ? (
              <p className="text-sm text-neutral-300">
                <strong className="text-white">Scenario A:</strong> Wildland-urban interface fire 
                near a residential community. High confidence detection with urgent response 
                recommendations.
              </p>
            ) : (
              <p className="text-sm text-neutral-300">
                <strong className="text-white">Scenario B:</strong> Smoke plume detection in 
                agricultural area with low confidence. Possible permitted burn - requires human 
                verification.
              </p>
            )}
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column: Incoming Signals */}
          <div className="lg:col-span-3 space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Satellite className="w-5 h-5 text-secondary-500" />
                Incoming Signals
              </h2>

              {/* Signal Toggles */}
              <div className="space-y-3 mb-6">
                {signals.map((signal) => {
                  const Icon = signal.icon
                  return (
                    <button
                      key={signal.id}
                      onClick={() => handleToggleSignal(signal.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        signal.enabled
                          ? 'bg-secondary-50 border-secondary-200'
                          : 'bg-neutral-50 border-neutral-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${signal.enabled ? 'text-secondary-600' : 'text-neutral-400'}`} />
                        <span className={`text-sm font-medium ${signal.enabled ? 'text-neutral-900' : 'text-neutral-500'}`}>
                          {signal.label}
                        </span>
                      </div>
                      {signal.enabled ? (
                        <ToggleRight className="w-5 h-5 text-secondary-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Hotspot Data */}
              {signals.find((s) => s.id === 'hotspots')?.enabled && (
                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                    Hotspot Detections (Demo)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {currentHotspots.map((hs) => (
                      <div
                        key={hs.id}
                        className="p-2 bg-neutral-50 rounded text-xs font-mono"
                      >
                        <div className="flex justify-between">
                          <span className="text-neutral-500">{hs.id}</span>
                          <Badge 
                            variant={hs.confidence >= 80 ? 'success' : hs.confidence >= 60 ? 'warning' : 'danger'} 
                            size="sm"
                          >
                            {hs.confidence}%
                          </Badge>
                        </div>
                        <div className="text-neutral-600 mt-1">
                          {hs.lat.toFixed(4)}°, {hs.lon.toFixed(4)}°
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weather Data */}
              {signals.find((s) => s.id === 'wind' || s.id === 'humidity')?.enabled && (
                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                    Weather (Demo)
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-neutral-50 rounded">
                      <span className="text-neutral-500">Wind</span>
                      <p className="font-medium">{currentWeather.windSpeed} {currentWeather.windDirection}</p>
                    </div>
                    <div className="p-2 bg-neutral-50 rounded">
                      <span className="text-neutral-500">Humidity</span>
                      <p className="font-medium">{currentWeather.humidity}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Terrain Data */}
              {signals.find((s) => s.id === 'terrain')?.enabled && (
                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                    Terrain (Demo)
                  </h3>
                  <div className="text-xs p-2 bg-neutral-50 rounded">
                    <p><span className="text-neutral-500">Slope:</span> {currentTerrain.slope}</p>
                    <p><span className="text-neutral-500">Vegetation:</span> {currentTerrain.vegetation}</p>
                  </div>
                </div>
              )}

              {/* Infrastructure Data */}
              {signals.find((s) => s.id === 'infrastructure')?.enabled && (
                <div className="border-t border-neutral-200 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                    Infrastructure (Demo)
                  </h3>
                  <div className="text-xs p-2 bg-neutral-50 rounded">
                    <p><span className="text-neutral-500">Buildings:</span> {currentInfrastructure.nearbyBuildings}</p>
                    <p><span className="text-neutral-500">Nearest:</span> {currentInfrastructure.nearestCommunity}</p>
                    <p><span className="text-neutral-500">Distance:</span> {currentInfrastructure.distanceToCommmunity}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Center Column: Incident Builder */}
          <div className="lg:col-span-4 space-y-4">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                  Incident Builder
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => handleSelectIncident()}
                >
                  Refresh
                </Button>
              </div>

              {/* Incident Card */}
              <motion.button
                onClick={handleSelectIncident}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedIncident?.id === currentIncident.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-neutral-900">
                    {currentIncident.title}
                  </h3>
                  <Badge
                    variant={
                      currentIncident.severity === 'high' || currentIncident.severity === 'critical'
                        ? 'danger'
                        : currentIncident.severity === 'medium'
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                  >
                    {currentIncident.severity.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant={currentIncident.confidence >= 70 ? 'success' : 'warning'} size="sm">
                    Confidence: {currentIncident.confidence}%
                  </Badge>
                  <Badge
                    variant={
                      currentIncident.spreadRisk === 'high'
                        ? 'danger'
                        : currentIncident.spreadRisk === 'medium'
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                  >
                    Spread: {currentIncident.spreadRisk}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Clock className="w-3 h-3" />
                  <span>Detected: {new Date(currentIncident.detectedAt).toLocaleTimeString()}</span>
                </div>

                {currentIncident.confidence < 70 && (
                  <div className="mt-3 p-2 bg-warning-50 rounded flex items-center gap-2 text-xs text-warning-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Low confidence - Human review required</span>
                  </div>
                )}
              </motion.button>

              {/* Status Indicator */}
              <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  {currentIncident.status === 'ready' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-success-500" />
                      <span className="text-success-700 font-medium">Package Ready</span>
                    </>
                  ) : currentIncident.status === 'analyzing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-secondary-500 animate-spin" />
                      <span className="text-secondary-700 font-medium">Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span className="text-neutral-700 font-medium">
                        Status: {currentIncident.status}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Incident Package */}
          <div className="lg:col-span-5">
            <IncidentPackagePanel
              incident={selectedPackage}
              onApprove={handleApproveDispatch}
              onExport={handleExportBrief}
              isLoading={isDispatching}
            />
          </div>
        </div>

        {/* Alert Log */}
        <div className="mt-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-neutral-500" />
                Alert Log (Demo)
              </h2>
              <Badge variant="demo" size="sm">
                {alertLog.length} entries
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-2 px-3 text-neutral-500 font-medium">Time</th>
                    <th className="text-left py-2 px-3 text-neutral-500 font-medium">Channel</th>
                    <th className="text-left py-2 px-3 text-neutral-500 font-medium">Recipient</th>
                    <th className="text-left py-2 px-3 text-neutral-500 font-medium">Message</th>
                    <th className="text-left py-2 px-3 text-neutral-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {alertLog.slice(0, 10).map((entry) => {
                    const ChannelIcon = channelIcons[entry.channel]
                    return (
                      <tr key={entry.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-2 px-3 text-neutral-600 font-mono text-xs">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <ChannelIcon className="w-4 h-4 text-neutral-400" />
                            <span className="capitalize">{entry.channel}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-neutral-600 font-mono text-xs truncate max-w-[200px]">
                          {entry.recipient}
                        </td>
                        <td className="py-2 px-3 text-neutral-600 truncate max-w-[250px]">
                          {entry.message}
                        </td>
                        <td className="py-2 px-3">
                          <Badge variant={statusColors[entry.status]} size="sm">
                            {entry.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </Container>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h2 className="text-lg font-semibold">Export Incident Brief (Demo)</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-1 hover:bg-neutral-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content - Printable Brief */}
              <div className="p-6 overflow-y-auto max-h-[60vh]" ref={printRef}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                  {selectedPackage.title}
                </h1>
                
                <div style={{ marginBottom: '16px' }}>
                  <span className={`badge badge-${selectedPackage.severity === 'high' ? 'high' : selectedPackage.severity === 'medium' ? 'medium' : 'low'}`}>
                    Severity: {selectedPackage.severity.toUpperCase()}
                  </span>
                  <span className={`badge badge-${selectedPackage.spreadRisk === 'high' ? 'high' : selectedPackage.spreadRisk === 'medium' ? 'medium' : 'low'}`}>
                    Spread Risk: {selectedPackage.spreadRisk.toUpperCase()}
                  </span>
                  <span className={`badge badge-${selectedPackage.confidence >= 70 ? 'low' : 'medium'}`}>
                    Confidence: {selectedPackage.confidence}%
                  </span>
                </div>

                {selectedPackage.requiresHumanReview && (
                  <div className="warning">
                    <strong>⚠️ Human Review Required</strong>
                    <p>Confidence below threshold. Manual verification recommended before dispatch.</p>
                  </div>
                )}

                <h2>Location</h2>
                <div className="section">
                  <p><strong>{selectedPackage.location.description}</strong></p>
                  <p>Coordinates: {selectedPackage.location.lat.toFixed(4)}°N, {selectedPackage.location.lon.toFixed(4)}°W</p>
                </div>

                <h2>Weather Conditions</h2>
                <div className="section">
                  <p>Temperature: {selectedPackage.weather.temperature}</p>
                  <p>Humidity: {selectedPackage.weather.humidity}</p>
                  <p>Wind: {selectedPackage.weather.windSpeed} from {selectedPackage.weather.windDirection}</p>
                </div>

                <h2>Recommended Actions (Draft)</h2>
                <ul>
                  {selectedPackage.recommendedActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>

                <h2>Safety Notes</h2>
                <ul>
                  {selectedPackage.safetyNotes.map((note, i) => (
                    <li key={i}>⚠️ {note}</li>
                  ))}
                </ul>

                {selectedPackage.uncertaintyFlags.length > 0 && (
                  <>
                    <h2>Uncertainty Flags</h2>
                    <ul>
                      {selectedPackage.uncertaintyFlags.map((flag, i) => (
                        <li key={i}>• {flag}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-neutral-200 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExportModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handlePrint}>
                  Print / Save as PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
