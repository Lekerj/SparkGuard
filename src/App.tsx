import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Team from '@/pages/Team'

const pageTitles: Record<string, string> = {
  '/': 'SparkGuard — Fire Detection Monitoring',
  '/team': 'Team | SparkGuard',
}

function App() {
  const location = useLocation()

  useEffect(() => {
    const title = pageTitles[location.pathname] || pageTitles['/']
    document.title = title
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/team" element={<Team />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  )
}

export default App
