/**
 * Home page — Hero + Globe + Fire Detection Panel + Future Section.
 *
 * All fire data comes from the local preprocessed pipeline (no API keys).
 */

import { motion } from 'framer-motion'
import { Globe2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from '@/components/layout/Container'
import ErrorBoundary from '@/components/ErrorBoundary'
import FireGlobe from '@/components/FireGlobe'
import FireDetectionPanel from '@/components/FireDetectionPanel'
import FutureSection from '@/components/FutureSection'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import SectionTitle from '@/components/ui/SectionTitle'
import { useFireData } from '@/hooks/useFireData'

const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
}

export default function Home() {
  const {
    countries,
    summary,
    selectedCountry,
    selectedPoints,
    isLoading,
    isLoadingPoints,
    isMock,
    selectCountry,
  } = useFireData()

  return (
    <motion.div initial="initial" animate="animate">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-neutral-950 text-white">
        {/* Background layers */}
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
              <Badge variant={isMock ? 'demo' : 'success'}>
                {isMock ? 'Mock Data' : 'MODIS 2024 — Local Pipeline'}
              </Badge>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">SparkGuard</h1>
            <p className="text-xl sm:text-2xl text-neutral-200 mb-4">
              Fire detection monitoring and global awareness from satellite data.
            </p>
            <p className="text-neutral-400 mb-8">
              Explore {summary ? summary.total_detections.toLocaleString() : '—'} MODIS fire
              detections across {summary ? summary.total_countries : '—'} countries, preprocessed
              from local CSV data with zero external API dependencies.
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

      {/* ═══════════════════════════════════════════════════════════════
          GLOBE + DATA PANEL
      ═══════════════════════════════════════════════════════════════ */}
      <section id="globe" className="bg-neutral-900 text-white py-16 lg:py-24">
        <Container>
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Globe (left) */}
            <div className="lg:col-span-7">
              <SectionTitle
                title="Global Fire Detections"
                subtitle="Drag to explore · Click a hotspot or select a country from the panel"
                align="left"
                titleClassName="text-white"
                subtitleClassName="text-neutral-400"
              />
              <div className="bg-neutral-950/60 border border-neutral-800 rounded-2xl p-2 sm:p-4">
                <ErrorBoundary
                  fallback={
                    <div className="w-full aspect-square max-h-[560px] flex items-center justify-center bg-neutral-950 rounded-xl border border-neutral-800">
                      <div className="text-center p-8">
                        <p className="text-red-400 font-semibold mb-2">Globe failed to load</p>
                        <p className="text-neutral-400 text-sm">WebGL may not be supported.</p>
                      </div>
                    </div>
                  }
                >
                  <FireGlobe
                    points={selectedPoints}
                    countries={countries}
                    focusCountry={selectedCountry}
                    onCountryClick={selectCountry}
                  />
                </ErrorBoundary>
              </div>
            </div>

            {/* Panel (right) */}
            <div className="lg:col-span-5">
              <FireDetectionPanel
                countries={countries}
                selectedCountry={selectedCountry}
                onSelectCountry={selectCountry}
                isMock={isMock}
                isLoading={isLoading}
                isLoadingPoints={isLoadingPoints}
                totalDetections={summary?.total_detections}
              />
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FUTURE SECTION PLACEHOLDER
      ═══════════════════════════════════════════════════════════════ */}
      <FutureSection />
    </motion.div>
  )
}
