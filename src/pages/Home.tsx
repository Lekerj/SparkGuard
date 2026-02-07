import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Globe2, Users } from 'lucide-react'
import Container from '@/components/layout/Container'
import Globe from '@/components/Globe'
import WildfirePanel from '@/components/WildfirePanel'
import FutureSection from '@/components/FutureSection'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import SectionTitle from '@/components/ui/SectionTitle'
import { useWildfireData } from '@/hooks/useWildfireData'
import type { WildfireRecord } from '@/data/wildfires'

const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function Home() {
  const { records } = useWildfireData()
  const [selected, setSelected] = useState<WildfireRecord | null>(records[0] || null)

  return (
    <motion.div initial="initial" animate="animate">
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(59,130,246,0.15),_transparent_45%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(244,63,94,0.18),_transparent_50%)]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIwLjEiPjxjaXJjbGUgY3g9IjQyIiBjeT0iMzIiIHI9IjEiLz48Y2lyY2xlIGN4PSIxNDUiIGN5PSI3NiIgcj0iMSIvPjxjaXJjbGUgY3g9IjI1MCIgY3k9IjUwIiByPSIxIi8+PGNpcmNsZSBjeD0iMjU1IiBjeT0iMTg2IiByPSIxIi8+PGNpcmNsZSBjeD0iOTAiIGN5PSIyMDAiIHI9IjEiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyNDAiIHI9IjEiLz48Y2lyY2xlIGN4PSIzMCIgY3k9IjI2MCIgcj0iMSIvPjwvZz48L3N2Zz4=')] opacity-60" />
        </div>

        <Container className="relative py-20 lg:py-28">
          <motion.div variants={fadeInUp} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="info">Mission Control</Badge>
              <Badge variant="demo">Mock Data</Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">SafeGuard</h1>
            <p className="text-xl sm:text-2xl text-neutral-200 mb-4">
              Wildfire monitoring, awareness, and actionable insights in one live surface.
            </p>
            <p className="text-neutral-400 mb-8">
              Track emerging wildfire activity, review severity signals, and coordinate response
              from a unified globe + intelligence panel.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#globe" className="inline-flex">
                <Button variant="primary" size="lg" icon={Globe2}>
                  Explore the Globe
                </Button>
              </a>
              <Link to="/team" className="inline-flex">
                <Button
                  variant="outline"
                  size="lg"
                  icon={Users}
                  iconPosition="right"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Meet the Team
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="globe" className="bg-neutral-900 text-white py-16 lg:py-24">
        <Container>
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7">
              <SectionTitle
                title="Active Wildfire Globe"
                subtitle="Drag to explore. Click an incident to populate the briefing panel."
                align="left"
                titleClassName="text-white"
                subtitleClassName="text-neutral-400"
              />
              <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-6">
                <Globe size={420} />
              </div>
              <div className="mt-4 text-xs text-neutral-400">
                Data shown is simulated. Globe visualization is a stylized 3D representation.
              </div>
            </div>

            <div className="lg:col-span-5">
              <WildfirePanel
                records={records}
                selectedId={selected?.id}
                onSelect={(record) => setSelected(record)}
              />
            </div>
          </div>
        </Container>
      </section>

      <FutureSection />
    </motion.div>
  )
}
