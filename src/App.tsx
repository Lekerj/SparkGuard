import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ToastProvider } from '@/components/ui/ToastProvider'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'
import Product from '@/pages/Product'
import Data from '@/pages/Data'
import Demo from '@/pages/Demo'
import Team from '@/pages/Team'
import Contact from '@/pages/Contact'

const pageTitles: Record<string, string> = {
  '/': 'SparkGuard - AI-Powered Fire Prevention & Emergency Response',
  '/product': 'Product & How It Works | SparkGuard',
  '/data': 'Data Sources & Integrations | SparkGuard',
  '/demo': 'Interactive Demo | SparkGuard',
  '/team': 'Our Team | SparkGuard',
  '/contact': 'Contact Us | SparkGuard',
}

function App() {
  const location = useLocation()

  useEffect(() => {
    const title = pageTitles[location.pathname] || pageTitles['/']
    document.title = title
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <ToastProvider>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/data" element={<Data />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </ToastProvider>
  )
}

export default App
