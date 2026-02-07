import { Link } from 'react-router-dom'
import { Flame, Shield, Github, Linkedin, Mail } from 'lucide-react'
import Container from './Container'

const footerLinks = [
  { label: 'Home', to: '/' },
  { label: 'Team', to: '/team' },
]

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300" role="contentinfo">
      <Container className="py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2 text-white mb-4"
              aria-label="SafeGuard - Home"
            >
              <div className="relative w-8 h-8">
                <Shield className="w-8 h-8 text-secondary-400" />
                <Flame className="w-4 h-4 text-primary-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(40%+3px)]" />
              </div>
              <span className="text-xl font-bold">SafeGuard</span>
            </Link>
            <p className="text-sm text-neutral-400 mb-4">
              Wildfire monitoring, awareness, and decision support for response teams.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-neutral-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <a
              href="mailto:contact@safeguard.example"
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-4"
            >
              <Mail className="w-4 h-4" />
              contact@safeguard.example
            </a>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="GitHub (Placeholder)"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="LinkedIn (Placeholder)"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} SafeGuard. All rights reserved.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-neutral-800/50 rounded-lg">
          <p className="text-xs text-neutral-500 text-center">
            <strong>Disclaimer:</strong> SafeGuard provides advisory information only.
            Data shown is simulated for demonstration purposes. No real-time integrations or
            partnerships are claimed. Images are placeholders and must be replaced with properly
            licensed assets for production use.
          </p>
        </div>
      </Container>
    </footer>
  )
}
