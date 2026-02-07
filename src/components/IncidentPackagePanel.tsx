import { motion } from 'framer-motion'
import {
  MapPin,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  FileText,
  Send,
  Printer,
} from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface IncidentPackage {
  id: string
  title: string
  location: {
    lat: number
    lon: number
    description: string
  }
  weather: {
    temperature: string
    humidity: string
    windSpeed: string
    windDirection: string
  }
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  spreadRisk: 'low' | 'medium' | 'high'
  recommendedActions: string[]
  safetyNotes: string[]
  uncertaintyFlags: string[]
  requiresHumanReview: boolean
  generatedAt: string
}

interface IncidentPackagePanelProps {
  incident: IncidentPackage | null
  onApprove?: () => void
  onExport?: () => void
  isLoading?: boolean
}

const severityColors = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
  critical: 'danger',
} as const

const spreadRiskColors = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
} as const

export default function IncidentPackagePanel({
  incident,
  onApprove,
  onExport,
  isLoading,
}: IncidentPackagePanelProps) {
  if (!incident) {
    return (
      <Card className="h-full flex items-center justify-center">
        <div className="text-center text-neutral-500 py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No incident selected</p>
          <p className="text-sm">Select an incident to view the generated package</p>
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full"
    >
      <Card padding="none" className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900">
                {incident.title}
              </h3>
              <p className="text-sm text-neutral-500 flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5" />
                Generated: {incident.generatedAt}
              </p>
            </div>
            <Badge variant="demo" size="sm">
              Demo Data
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={severityColors[incident.severity]}>
              Severity: {incident.severity.toUpperCase()}
            </Badge>
            <Badge variant={spreadRiskColors[incident.spreadRisk]}>
              Spread Risk: {incident.spreadRisk.toUpperCase()}
            </Badge>
            <Badge variant={incident.confidence >= 70 ? 'success' : 'warning'}>
              Confidence: {incident.confidence}%
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Human Review Warning */}
          {incident.requiresHumanReview && (
            <div className="bg-warning-50 border border-warning-500/30 rounded-lg p-4 flex items-start gap-3">
              <User className="w-5 h-5 text-warning-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning-700">Human Review Required</p>
                <p className="text-sm text-warning-600 mt-1">
                  Confidence below threshold. Manual verification recommended before dispatch.
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          <section>
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Context
            </h4>
            <div className="bg-neutral-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-neutral-900 mb-1">
                {incident.location.description}
              </p>
              <p className="text-neutral-600 font-mono text-xs">
                {incident.location.lat.toFixed(4)}°N, {incident.location.lon.toFixed(4)}°W
              </p>
            </div>
          </section>

          {/* Weather */}
          <section>
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Weather Snapshot
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Temperature', value: incident.weather.temperature },
                { label: 'Humidity', value: incident.weather.humidity },
                { label: 'Wind Speed', value: incident.weather.windSpeed },
                { label: 'Wind Direction', value: incident.weather.windDirection },
              ].map((item) => (
                <div key={item.label} className="bg-neutral-50 rounded-lg p-3">
                  <p className="text-xs text-neutral-500">{item.label}</p>
                  <p className="font-medium text-neutral-900">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Actions */}
          <section>
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Recommended Actions (Draft)
            </h4>
            <ul className="space-y-2">
              {incident.recommendedActions.map((action, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-neutral-700"
                >
                  <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0 text-xs font-medium">
                    {index + 1}
                  </span>
                  {action}
                </li>
              ))}
            </ul>
          </section>

          {/* Safety Notes */}
          <section>
            <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Safety Notes
            </h4>
            <ul className="space-y-2">
              {incident.safetyNotes.map((note, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-neutral-700 bg-danger-50 rounded-lg p-2"
                >
                  <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
                  {note}
                </li>
              ))}
            </ul>
          </section>

          {/* Uncertainty Flags */}
          {incident.uncertaintyFlags.length > 0 && (
            <section>
              <h4 className="text-sm font-semibold text-neutral-700 uppercase tracking-wider mb-3">
                Uncertainty Flags
              </h4>
              <div className="flex flex-wrap gap-2">
                {incident.uncertaintyFlags.map((flag, index) => (
                  <Badge key={index} variant="warning" size="sm">
                    {flag}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 space-y-2">
          <Button
            variant="primary"
            className="w-full"
            icon={Send}
            onClick={onApprove}
            isLoading={isLoading}
          >
            Approve & Dispatch (Demo)
          </Button>
          <Button
            variant="outline"
            className="w-full"
            icon={Printer}
            onClick={onExport}
          >
            Export Brief (Demo)
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}

export type { IncidentPackage }
