/**
 * AppLayout — Full-viewport layout with a slim top navigation bar.
 *
 * The content area fills 100vh minus the nav bar height (48px).
 * No scrolling on the main layout — individual pages manage their own overflow.
 */

import { ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Flame, Shield, Globe2, Layers, Users, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_HEIGHT = 48

const navLinks = [
  { to: '/', label: 'Globe Explorer', icon: Globe2 },
  { to: '/comparison', label: 'Comparison', icon: Layers },
  { to: '/team', label: 'Team', icon: Users },
]

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-950">
      {/* ── Top nav bar ──────────────────────────────────────────── */}
      <nav
        className="flex-shrink-0 flex items-center justify-between px-4 border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm z-50"
        style={{ height: NAV_HEIGHT }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity">
          <div className="relative w-6 h-6">
            <Shield className="w-6 h-6 text-blue-400" />
            <Flame className="w-3 h-3 text-orange-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(40%+2px)]" />
          </div>
          <span className="text-sm font-bold tracking-tight">SparkGuard</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${isActive
                    ? 'text-white bg-neutral-800'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </NavLink>
            )
          })}
        </div>

        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="sm:hidden text-neutral-400 hover:text-white p-1"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="sm:hidden absolute top-12 left-0 right-0 bg-neutral-900 border-b border-neutral-800 z-40 py-2 px-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.to
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${
                  isActive ? 'text-white bg-neutral-800' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            )
          })}
        </div>
      )}

      {/* ── Content area — fills remaining height ────────────────── */}
      <main
        className="flex-1 overflow-hidden"
        style={{ height: `calc(100vh - ${NAV_HEIGHT}px)` }}
      >
        {children}
      </main>
    </div>
  )
}
