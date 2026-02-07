import { motion } from 'framer-motion'
import {
  Satellite,
  ThermometerSun,
  Wind,
  Mountain,
  Building,
  Cloud,
  ArrowRight,
  Mail,
  MessageSquare,
  Webhook,
  FileText,
  CheckCircle,
  Info,
} from 'lucide-react'
import Container from '@/components/layout/Container'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const dataTypes = [
  {
    icon: ThermometerSun,
    title: 'Thermal Anomalies / Hotspots',
    description: 'Point detections from satellite thermal sensors indicating potential fire activity.',
    format: 'GeoJSON, CSV',
  },
  {
    icon: Satellite,
    title: 'Multispectral Imagery',
    description: 'Multiple spectral bands enabling vegetation stress analysis and burn scar detection.',
    format: 'GeoTIFF, Cloud-optimized',
  },
  {
    icon: Cloud,
    title: 'Smoke Plume Detection',
    description: 'Visual and algorithmic detection of smoke columns from satellite visible bands.',
    format: 'Vector polygons, confidence scores',
  },
  {
    icon: Wind,
    title: 'Meteorological Layers',
    description: 'Wind speed/direction, temperature, humidity, and forecast data for spread modeling.',
    format: 'GRIB2, NetCDF, API',
  },
  {
    icon: Mountain,
    title: 'Terrain & Slope',
    description: 'Digital elevation models and derived slope data affecting fire behavior.',
    format: 'DEM rasters, vector contours',
  },
  {
    icon: Building,
    title: 'Infrastructure Proximity',
    description: 'Roads, structures, power lines, and populated areas for risk assessment.',
    format: 'Vector layers, OSM extracts',
  },
]

const compatibleSources = [
  {
    name: 'NASA FIRMS',
    type: 'Hotspot Detections',
    description: 'Fire Information for Resource Management System - near real-time thermal anomaly data.',
    note: 'Public data source',
  },
  {
    name: 'Sentinel-2 Imagery',
    type: 'Multispectral',
    description: 'ESA Copernicus program satellite imagery with 10m resolution and multiple spectral bands.',
    note: 'Public data source',
  },
  {
    name: 'VIIRS/MODIS-style Detections',
    type: 'Thermal Anomalies',
    description: 'Thermal hotspot detection algorithms from various polar-orbiting satellite sensors.',
    note: 'Generic data format',
  },
  {
    name: 'Commercial CubeSat Providers',
    type: 'High-frequency Imagery',
    description: 'Higher temporal resolution imagery from commercial small satellite constellations.',
    note: 'Not endorsement - generic compatibility',
  },
]

const integrationOutputs = [
  {
    icon: Mail,
    title: 'Email Alerts',
    description: 'Formatted incident summaries delivered to configured recipient lists.',
    details: 'HTML templates, PDF attachments',
  },
  {
    icon: MessageSquare,
    title: 'SMS Alerts',
    description: 'Concise text notifications for critical incidents.',
    details: 'Twilio/generic gateway compatible',
  },
  {
    icon: Webhook,
    title: 'Webhook Dispatch',
    description: 'Structured JSON payloads to external systems (CAD, dispatch, etc.).',
    details: 'REST API, customizable schemas',
  },
  {
    icon: FileText,
    title: 'Exportable Brief',
    description: 'Print-ready incident packages for offline use.',
    details: 'HTML → PDF, structured format',
  },
]

export default function Data() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Hero */}
      <section className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white py-20 lg:py-28">
        <Container>
          <motion.div variants={fadeInUp} className="max-w-3xl mx-auto text-center">
            <Badge variant="demo" className="mb-4">Data Architecture</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Data Sources & Integrations
            </h1>
            <p className="text-xl text-neutral-300">
              SparkGuard is designed to ingest, process, and distribute fire intelligence 
              from multiple data sources through a flexible integration architecture.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Compatible Data Types */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <SectionTitle
            title="Compatible Data Types"
            subtitle="SparkGuard can process the following data categories"
          />

          <motion.div
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {dataTypes.map((type) => {
              const Icon = type.icon
              return (
                <motion.div key={type.title} variants={fadeInUp}>
                  <Card hover className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-secondary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {type.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mb-2">
                          {type.description}
                        </p>
                        <Badge variant="default" size="sm">{type.format}</Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* Example Compatible Sources */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <SectionTitle
            title="Example Compatible Sources"
            subtitle="SparkGuard is designed to be compatible with these data providers"
            badge={
              <Badge variant="info">
                <Info className="w-3 h-3 mr-1" />
                Not endorsements or partnerships
              </Badge>
            }
          />

          <motion.div variants={fadeInUp} className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {compatibleSources.map((source, index) => (
                <Card key={source.name} className="border-l-4 border-l-secondary-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-neutral-900">
                          {source.name}
                        </h3>
                        <Badge variant="default" size="sm">{source.type}</Badge>
                      </div>
                      <p className="text-sm text-neutral-600">
                        {source.description}
                      </p>
                    </div>
                    <Badge variant="info" size="sm" className="self-start sm:self-center whitespace-nowrap">
                      {source.note}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-4 bg-neutral-100 rounded-lg">
              <p className="text-sm text-neutral-600 text-center">
                <strong>Note:</strong> The sources listed above are examples of compatible data formats 
                and providers. SparkGuard does not have partnerships or integrations with these 
                providers unless explicitly stated. Users are responsible for obtaining appropriate 
                data licenses.
              </p>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Integration Outputs */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <SectionTitle
            title="Integration Outputs"
            subtitle="Distribute alerts and incident packages through multiple channels"
          />

          <motion.div
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {integrationOutputs.map((output) => {
              const Icon = output.icon
              return (
                <motion.div key={output.title} variants={fadeInUp}>
                  <Card hover className="h-full">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900 mb-1">
                          {output.title}
                        </h3>
                        <p className="text-sm text-neutral-600 mb-2">
                          {output.description}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {output.details}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* Integration Diagram */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <SectionTitle
            title="Integration Architecture"
            subtitle="SparkGuard fits into existing emergency response infrastructure"
            badge={<Badge variant="demo">Conceptual Diagram</Badge>}
          />

          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              {/* Diagram */}
              <div className="p-8 bg-gradient-to-br from-neutral-50 to-neutral-100">
                <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
                  {/* Left: Data Sources */}
                  <div className="flex flex-col gap-2 text-center">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                      Data Sources
                    </div>
                    <div className="space-y-2">
                      <div className="px-3 py-2 bg-neutral-200 rounded text-sm">Satellite Feeds</div>
                      <div className="px-3 py-2 bg-neutral-200 rounded text-sm">Weather APIs</div>
                      <div className="px-3 py-2 bg-neutral-200 rounded text-sm">Terrain Data</div>
                    </div>
                  </div>

                  <ArrowRight className="w-6 h-6 text-neutral-400 rotate-90 lg:rotate-0" />

                  {/* Center: SparkGuard */}
                  <div className="flex flex-col items-center">
                    <div className="px-8 py-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white text-center shadow-lg">
                      <Satellite className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-bold text-lg">SparkGuard</div>
                      <div className="text-sm text-primary-100">Processing Engine</div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                      <span className="text-sm text-neutral-600">Human Approval</span>
                    </div>
                  </div>

                  <ArrowRight className="w-6 h-6 text-neutral-400 rotate-90 lg:rotate-0" />

                  {/* Right: Outputs */}
                  <div className="flex flex-col gap-2 text-center">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                      Distribution
                    </div>
                    <div className="space-y-2">
                      <div className="px-3 py-2 bg-primary-100 text-primary-700 rounded text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </div>
                      <div className="px-3 py-2 bg-primary-100 text-primary-700 rounded text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> SMS
                      </div>
                      <div className="px-3 py-2 bg-primary-100 text-primary-700 rounded text-sm flex items-center gap-2">
                        <Webhook className="w-4 h-4" /> Webhook
                      </div>
                      <div className="px-3 py-2 bg-primary-100 text-primary-700 rounded text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Export
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-6 h-6 text-neutral-400 rotate-90 lg:rotate-0" />

                  {/* Far Right: Existing Systems */}
                  <div className="flex flex-col gap-2 text-center">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">
                      Responder Systems
                    </div>
                    <div className="space-y-2">
                      <div className="px-3 py-2 bg-secondary-100 text-secondary-700 rounded text-sm">CAD Systems</div>
                      <div className="px-3 py-2 bg-secondary-100 text-secondary-700 rounded text-sm">Dispatch Centers</div>
                      <div className="px-3 py-2 bg-secondary-100 text-secondary-700 rounded text-sm">Field Teams</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Caption */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-200">
                <p className="text-sm text-neutral-600 text-center">
                  SparkGuard acts as an intelligence layer between satellite data sources and 
                  existing emergency response infrastructure, requiring human approval before dispatch.
                </p>
              </div>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-neutral-900 text-white">
        <Container>
          <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              See Data Flow in Action
            </h2>
            <p className="text-lg text-neutral-300 mb-8">
              Our interactive demo shows simulated data flowing through the entire pipeline.
            </p>
            <a href="/demo">
              <Badge variant="primary" className="text-base px-6 py-3 cursor-pointer hover:bg-primary-700 transition-colors">
                Try the Interactive Demo →
              </Badge>
            </a>
          </motion.div>
        </Container>
      </section>
    </motion.div>
  )
}
