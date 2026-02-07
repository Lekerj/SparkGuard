import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Download, Play, Flame, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Container from './Container'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/product', label: 'Product' },
  { to: '/data', label: 'Data Sources' },
  { to: '/demo', label: 'Demo' },
  { to: '/team', label: 'Team' },
  { to: '/contact', label: 'Contact' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
        }
      `}
      role="banner"
    >
      <Container>
        <nav
          className="flex items-center justify-between h-16 lg:h-20"
          role="navigation"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-neutral-900 hover:text-primary-600 transition-colors"
            aria-label="SparkGuard - Home"
          >
            <div className="relative w-8 h-8">
              <Shield className="w-8 h-8 text-secondary-600" />
              <Flame className="w-4 h-4 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(40%+3px)]" />
            </div>
            <span className="text-xl font-bold">SparkGuard</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }
                `}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Badge variant="demo" size="sm">
              Demo Mode
            </Badge>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => alert('Placeholder: Download Pitch Deck')}
            >
              Pitch Deck
            </Button>
            <Link to="/demo">
              <Button variant="primary" size="sm" icon={Play}>
                View Demo
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </nav>
      </Container>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-neutral-200 shadow-lg"
          >
            <Container className="py-4">
              <div className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) => `
                      px-4 py-3 rounded-lg text-base font-medium transition-colors
                      ${isActive
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }
                    `}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-col gap-2">
                <Button
                  variant="outline"
                  icon={Download}
                  onClick={() => alert('Placeholder: Download Pitch Deck')}
                  className="w-full justify-center"
                >
                  Download Pitch Deck
                </Button>
                <Link to="/demo" className="w-full">
                  <Button variant="primary" icon={Play} className="w-full justify-center">
                    View Demo
                  </Button>
                </Link>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
