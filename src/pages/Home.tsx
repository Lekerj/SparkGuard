import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Play,
  ArrowRight,
  Satellite,
  Brain,
  LayoutDashboard,
  AlertTriangle,
  Database,
  Zap,
  Shield,
  Leaf,
  Heart,
  Lock,
  Eye,
  Clock,
} from 'lucide-react'
import Container from '@/components/layout/Container'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import SectionTitle from '@/components/ui/SectionTitle'
import BeforeAfterSlider from '@/components/BeforeAfterSlider'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const problems = [
  {
    icon: Clock,
    title: 'Delayed Detection',
    description:
      'Fires can spread rapidly before detection systems alert responders, reducing the window for effective intervention.',
  },
  {
    icon: Database,
    title: 'Fragmented Data',
    description:
      'Critical information exists across multiple systems and formats, making it difficult to build a unified operational picture.',
  },
  {
    icon: AlertTriangle,
    title: 'Information Overload',
    description:
      'First responders face overwhelming data streams without clear prioritization or actionable recommendations.',
  },
]

const solutionSteps = [
  { icon: Satellite, title: 'Ingest', description: 'Satellite & sensor data' },
  { icon: Zap, title: 'Analyze', description: 'AI-powered classification' },
  { icon: LayoutDashboard, title: 'Package', description: 'Structured briefs' },
  { icon: ArrowRight, title: 'Distribute', description: 'Multi-channel alerts' },
]

const features = [
  {
    icon: Satellite,
    title: 'Satellite Intelligence',
    description:
      'Ingest and process thermal anomalies, multispectral imagery, and smoke plume detections from satellite sources.',
    badge: 'Core',
  },
  {
    icon: Brain,
    title: 'Decision Support',
    description:
      'AI analyzes patterns and generates severity estimates, spread predictions, and draft recommendations—always advisory.',
    badge: 'AI-Powered',
  },
  {
    icon: LayoutDashboard,
    title: 'Operations Dashboard',
    description:
      'Unified view of incidents, alerts, and dispatched packages with full audit trail and human approval workflows.',
    badge: 'Human-in-loop',
  },
]

const impactItems = [
  {
    icon: Heart,
    title: 'Health & Wellness',
    description:
      'Faster, better-informed response can help protect firefighters and communities from fire-related harm.',
    color: 'text-primary-500',
    bg: 'bg-primary-50',
  },
  {
    icon: Leaf,
    title: 'Sustainability',
    description:
      'Earlier intervention may reduce total burned area, helping preserve ecosystems and reduce emissions.',
    color: 'text-success-500',
    bg: 'bg-success-50',
  },
]

const ethicsItems = [
  {
    icon: Eye,
    title: 'Advisory AI',
    description:
      'All AI outputs are recommendations only. Humans make final dispatch decisions. Low-confidence detections are flagged.',
  },
  {
    icon: Lock,
    title: 'Security & Privacy',
    description:
      'Data handling follows security best practices. No personal data is collected. Location data is operationally scoped.',
  },
  {
    icon: Shield,
    title: 'Retention Controls',
    description:
      'Configurable data retention policies. Audit logs maintained. No data sold to third parties.',
  },
]

export default function Home() {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tNC0xMHYyaC00di0yaDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <Container className="relative py-20 lg:py-32">
          <motion.div
            variants={fadeInUp}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex justify-center gap-2 mb-6">
              <Badge variant="demo">Demo Mode</Badge>
              <Badge variant="advisory">Advisory AI</Badge>
              <Badge variant="info">Human-in-the-loop</Badge>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
              <span className="gradient-text">SparkGuard</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-neutral-300 mb-4 text-balance">
              AI-powered fire prevention and emergency response decision support
            </p>
            
            <p className="text-lg text-neutral-400 mb-8 text-balance">
              Unifying satellite intelligence and actionable guidance for first responders
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/demo">
                <Button variant="primary" size="lg" icon={Play}>
                  View Demo
                </Button>
              </Link>
              <Link to="/product">
                <Button variant="outline" size="lg" icon={ArrowRight} iconPosition="right" className="border-white/30 text-white hover:bg-white/10">
                  How It Works
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>

        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-50 to-transparent" />
      </section>

      {/* Before/After Comparison */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <SectionTitle
            title="From Raw Data to Actionable Intelligence"
            subtitle="See how SparkGuard transforms satellite data into decision-ready information"
            badge={<Badge variant="demo">Simulated Data</Badge>}
          />

          <motion.div
            variants={fadeInUp}
            className="max-w-4xl mx-auto"
          >
            <BeforeAfterSlider
              beforeLabel="Raw Satellite Snapshot (Demo)"
              afterLabel="Analytics Overlay (Demo)"
              className="aspect-video"
              beforeContent={
                <div className="w-full h-full bg-gradient-to-br from-neutral-700 via-neutral-600 to-neutral-800 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Satellite className="w-16 h-16 text-neutral-500 mx-auto mb-4" />
                    <p className="text-neutral-400 text-sm">
                      Placeholder: Raw satellite thermal image
                    </p>
                    <p className="text-neutral-500 text-xs mt-2">
                      Replace with properly licensed imagery
                    </p>
                  </div>
                </div>
              }
              afterContent={
                <div className="w-full h-full bg-gradient-to-br from-secondary-900 via-secondary-800 to-neutral-900 flex items-center justify-center relative">
                  {/* Mock overlay elements */}
                  <div className="absolute inset-0 p-8">
                    {/* Hotspot markers */}
                    <div className="absolute top-1/4 left-1/3 w-8 h-8 rounded-full bg-primary-500/80 animate-pulse flex items-center justify-center">
                      <span className="text-white text-xs font-bold">H1</span>
                    </div>
                    <div className="absolute top-1/3 left-1/2 w-6 h-6 rounded-full bg-primary-500/60 animate-pulse flex items-center justify-center">
                      <span className="text-white text-xs font-bold">H2</span>
                    </div>
                    <div className="absolute top-1/2 left-1/4 w-7 h-7 rounded-full bg-warning-500/70 animate-pulse flex items-center justify-center">
                      <span className="text-white text-xs font-bold">H3</span>
                    </div>
                    
                    {/* Risk zone overlay */}
                    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/3 border-2 border-primary-500/50 rounded-lg bg-primary-500/10" />
                    
                    {/* Info panel */}
                    <div className="absolute bottom-4 right-4 bg-black/80 rounded-lg p-3 text-xs text-white">
                      <p className="font-semibold text-primary-400 mb-1">Risk Summary (Demo)</p>
                      <p>Hotspots: 3 detected</p>
                      <p>Severity: High</p>
                      <p>Confidence: 91%</p>
                    </div>
                  </div>
                  
                  <div className="text-center p-8">
                    <Brain className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <p className="text-secondary-300 text-sm">
                      Placeholder: Analyzed overlay with risk zones
                    </p>
                    <p className="text-secondary-400 text-xs mt-2">
                      Simulated analytics visualization
                    </p>
                  </div>
                </div>
              }
            />
            
            <p className="text-center text-sm text-neutral-500 mt-4">
              ⚠️ Images shown are placeholders for demonstration purposes only.
              Production deployment requires properly licensed satellite imagery.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Problem Section */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <SectionTitle
            title="The Challenge"
            subtitle="Why current approaches fall short in fire emergency response"
          />

          <motion.div
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {problems.map((problem) => {
              const Icon = problem.icon
              return (
                <motion.div key={problem.title} variants={fadeInUp}>
                  <Card hover className="h-full">
                    <div className="w-12 h-12 rounded-lg bg-danger-50 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-danger-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-neutral-600">
                      {problem.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* Solution Overview */}
      <section className="py-20 lg:py-28 bg-neutral-50">
        <Container>
          <SectionTitle
            title="Solution Overview"
            subtitle="A streamlined pipeline from detection to response"
          />

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-4 lg:gap-8 mb-12"
          >
            {solutionSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-2">
                      <Icon className="w-8 h-8 text-primary-500" />
                    </div>
                    <p className="font-semibold text-neutral-900">{step.title}</p>
                    <p className="text-sm text-neutral-500">{step.description}</p>
                  </div>
                  {index < solutionSteps.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-neutral-300 hidden lg:block" />
                  )}
                </div>
              )
            })}
          </motion.div>

          <motion.div variants={fadeInUp} className="text-center">
            <Link to="/product">
              <Button variant="secondary" icon={ArrowRight} iconPosition="right">
                Explore the Full Pipeline
              </Button>
            </Link>
          </motion.div>
        </Container>
      </section>

      {/* Key Features */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <SectionTitle
            title="Key Features"
            subtitle="Built for operational excellence in emergency response"
          />

          <motion.div
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <Card hover className="h-full">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-secondary-50 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-secondary-600" />
                      </div>
                      <Badge variant="info" size="sm">{feature.badge}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-neutral-600">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* Impact & Sustainability */}
      <section className="py-20 lg:py-28 bg-neutral-900 text-white">
        <Container>
          <SectionTitle
            title="Impact & Sustainability"
            subtitle="Technology aligned with human and environmental wellbeing"
          />

          <motion.div
            variants={stagger}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            {impactItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title} variants={fadeInUp}>
                  <div className="bg-neutral-800 rounded-xl p-6 h-full">
                    <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* Ethics & Compliance */}
      <section className="py-20 lg:py-28 bg-white">
        <Container>
          <SectionTitle
            title="Risks, Ethics, Privacy & Compliance"
            subtitle="Responsible AI and transparent operations"
          />

          <motion.div
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {ethicsItems.map((item) => {
              const Icon = item.icon
              return (
                <motion.div key={item.title} variants={fadeInUp}>
                  <Card className="h-full border-2 border-neutral-100">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-neutral-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <Container>
          <motion.div
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to See SparkGuard in Action?
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Explore our interactive demo to see the full pipeline from satellite detection to dispatch.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/demo">
                <Button variant="secondary" size="lg" icon={Play}>
                  Launch Interactive Demo
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="ghost" size="lg" className="text-white border-white/30 hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>
    </motion.div>
  )
}
