import { Link } from 'react-router-dom'
import { Flame, Shield, Github, Linkedin, Twitter, Mail } from 'lucide-react'
import Container from './Container'
import Badge from '@/components/ui/Badge'

const footerLinks = {
  product: [
    { label: 'How It Works', to: '/product' },
    { label: 'Data Sources', to: '/data' },
    { label: 'Interactive Demo', to: '/demo' },
  ],
  company: [
    { label: 'Team', to: '/team' },
    { label: 'Contact', to: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
}

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
              aria-label="SparkGuard - Home"
            >
              <div className="relative w-8 h-8">
                <Shield className="w-8 h-8 text-secondary-400" />
                <Flame className="w-4 h-4 text-primary-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(40%+3px)]" />
              </div>
              <span className="text-xl font-bold">SparkGuard</span>
            </Link>
            <p className="text-sm text-neutral-400 mb-4">
              AI-powered fire prevention and emergency response decision support.
              Unifying satellite intelligence and actionable guidance for first responders.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="demo" size="sm">Demo Mode</Badge>
              <Badge variant="advisory" size="sm">Advisory AI</Badge>
              <Badge variant="info" size="sm">Human-in-the-loop</Badge>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
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

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
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
              href="mailto:contact@sparkguard.example"
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-4"
            >
              <Mail className="w-4 h-4" />
              contact@sparkguard.example
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
              <a
                href="#"
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Twitter (Placeholder)"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} SparkGuard. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-neutral-800/50 rounded-lg">
          <p className="text-xs text-neutral-500 text-center">
            <strong>Disclaimer:</strong> SparkGuard provides advisory information only.
            All AI outputs require human review and approval. Satellite imagery and data shown
            are simulated for demonstration purposes. No real-time integrations or partnerships
            are claimed. Images are placeholders and must be replaced with properly licensed assets
            for production use.
          </p>
        </div>
      </Container>
    </footer>
  )
}
