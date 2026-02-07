import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Download,
  Layers,
  Cpu,
  FileJson,
  CheckCircle,
  AlertTriangle,
  User,
  Satellite,
  Cloud,
  Mountain,
  Building,
  Brain,
  Send,
} from 'lucide-react'
import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import JSONSnippet from '@/components/ui/JSONSnippet'
import Pipeline from '@/components/Pipeline'
import { pipelineArtifacts } from '@/data/mockIncidents'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const pipelineSteps = [
  {
    id: 'ingest',
    title: 'Ingest',
    description: 'Receive satellite data feeds including thermal anomalies, hotspot detections, and imagery.',
    icon: Download,
    artifact: pipelineArtifacts.ingest,
  },
  {
    id: 'normalize',
    title: 'Normalize',
    description: 'Standardize data formats, coordinate systems, timestamps, and remove duplicates.',
    icon: Layers,
    artifact: pipelineArtifacts.normalize,
  },
  {
    id: 'enrich',
    title: 'Enrich',
    description: 'Attach contextual data: weather, terrain, infrastructure proximity, historical patterns.',
    icon: FileJson,
    artifact: pipelineArtifacts.enrich,
  },
  {
    id: 'analyze',
    title: 'Analyze',
    description: 'Run AI models to classify severity, estimate spread risk, and generate confidence scores.',
    icon: Cpu,
    artifact: pipelineArtifacts.analyze,
  },
  {
    id: 'decide',
    title: 'Decide',
    description: 'Generate recommendations and resource suggestions. Flag low-confidence for human review.',
    icon: Brain,
    artifact: pipelineArtifacts.decide,
  },
  {
    id: 'dispatch',
    title: 'Dispatch',
    description: 'Distribute alerts via configured channels. Generate exportable incident packages.',
    icon: Send,
    artifact: pipelineArtifacts.dispatch,
  },
]

const aiFeatures = [
  {
    icon: CheckCircle,
    title: 'Human Approval Required',
    description: 'No automated dispatch without human confirmation. All AI outputs are advisory.',
    color: 'text-success-500',
  },
  {
    icon: AlertTriangle,
    title: 'Low-Confidence Flagging',
    description: 'Detections below confidence thresholds are clearly marked for additional review.',
    color: 'text-warning-500',
  },
  {
    icon: User,
    title: 'Audit Trail',
    description: 'Every decision is logged with timestamps, responsible party, and rationale.',
    color: 'text-secondary-500',
  },
]

const dataTypes = [
  { icon: Satellite, label: 'Thermal anomalies & hotspots' },
  { icon: Cloud, label: 'Multispectral imagery' },
  { icon: Cloud, label: 'Smoke plume detection' },
  { icon: Cloud, label: 'Weather layers (wind, humidity)' },
  { icon: Mountain, label: 'Terrain & slope data' },
  { icon: Building, label: 'Infrastructure proximity' },
]

export default function Product() {
  const [activeStep, setActiveStep] = useState(0)

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
            <Badge variant="demo" className="mb-4">Product Overview</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              How SparkGuard Works
            </h1>
            <p className="text-xl text-neutral-300 mb-8">
              A six-step pipeline that transforms raw satellite data into actionable 
              incident packages for first responders.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Pipeline Section */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <SectionTitle
            title="The SparkGuard Pipeline"
            subtitle="Click any step to see the data artifact at that stage"
          />

          <motion.div variants={fadeInUp} className="mb-12">
            <Pipeline
              steps={pipelineSteps}
              activeStep={activeStep}
              onStepClick={setActiveStep}
              orientation="horizontal"
            />
          </motion.div>

          {/* Active Step Detail */}
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-2 gap-8"
          >
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                  {(() => {
                    const Icon = pipelineSteps[activeStep].icon
                    return <Icon className="w-5 h-5 text-primary-600" />
                  })()}
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Step {activeStep + 1}</p>
                  <h3 className="font-semibold text-neutral-900">
                    {pipelineSteps[activeStep].title}
                  </h3>
                </div>
              </div>
              <p className="text-neutral-600 mb-4">
                {pipelineSteps[activeStep].description}
              </p>
              
              {activeStep === 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-neutral-700">Compatible input types:</p>
                  <div className="flex flex-wrap gap-2">
                    {dataTypes.map((type) => (
                      <Badge key={type.label} variant="default" size="sm">
                        {type.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card padding="none">
              <JSONSnippet
                data={pipelineSteps[activeStep].artifact!}
                title={`${pipelineSteps[activeStep].id}_artifact.json (Demo)`}
                defaultExpanded={true}
              />
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* AI Decision Support */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <SectionTitle
            title="AI Decision Support"
            subtitle="Intelligent assistance with human oversight at every step"
            badge={<Badge variant="advisory">Advisory AI Only</Badge>}
          />

          <motion.div variants={fadeInUp} className="max-w-3xl mx-auto mb-12">
            <Card className="bg-secondary-50 border-secondary-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-secondary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    The Role of AI in SparkGuard
                  </h3>
                  <p className="text-neutral-700">
                    SparkGuard's AI capabilities are designed as decision <strong>support</strong>, 
                    not decision <strong>makers</strong>. The system analyzes patterns, generates 
                    predictions, and drafts recommendations—but every critical action requires 
                    human approval. This ensures accountability and allows responders to apply 
                    their on-ground expertise.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
            className="grid md:grid-cols-3 gap-8"
          >
            {aiFeatures.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <Card hover className="h-full text-center">
                    <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                      <Icon className={`w-7 h-7 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* Confidence Levels */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <SectionTitle
            title="Confidence & Uncertainty"
            subtitle="Clear visual indicators help operators prioritize and verify"
          />

          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
            <Card>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-success-50">
                  <div className="text-3xl font-bold text-success-700 mb-2">≥80%</div>
                  <Badge variant="success" className="mb-2">High Confidence</Badge>
                  <p className="text-sm text-success-700">
                    Eligible for streamlined approval workflow
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning-50">
                  <div className="text-3xl font-bold text-warning-700 mb-2">50-79%</div>
                  <Badge variant="warning" className="mb-2">Medium Confidence</Badge>
                  <p className="text-sm text-warning-700">
                    Requires additional verification steps
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-danger-50">
                  <div className="text-3xl font-bold text-danger-700 mb-2">&lt;50%</div>
                  <Badge variant="danger" className="mb-2">Low Confidence</Badge>
                  <p className="text-sm text-danger-700">
                    Flagged for human review, additional data requested
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white">
        <Container>
          <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Experience the Pipeline
            </h2>
            <p className="text-lg text-secondary-100 mb-8">
              Try our interactive demo to see real (simulated) data flow through each stage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.href = '/demo'}
              >
                Launch Demo
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white border-white/30 hover:bg-white/10"
                onClick={() => window.location.href = '/data'}
              >
                View Data Sources
              </Button>
            </div>
          </motion.div>
        </Container>
      </section>
    </motion.div>
  )
}
