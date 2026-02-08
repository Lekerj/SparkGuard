import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import GlobeExplorer from '@/pages/GlobeExplorer'
import Comparison from '@/pages/Comparison'
import Team from '@/pages/Team'

const pageTitles: Record<string, string> = {
  '/': 'SparkGuard — Globe Explorer',
  '/comparison': 'Imagery Comparison | SparkGuard',
  '/team': 'Team | SparkGuard',
}

function App() {
  const location = useLocation()

  useEffect(() => {
    const title = pageTitles[location.pathname] || pageTitles['/']
    document.title = title
  }, [location.pathname])

  return (
    <AppLayout>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<GlobeExplorer />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </AppLayout>
  )
}

export default App
