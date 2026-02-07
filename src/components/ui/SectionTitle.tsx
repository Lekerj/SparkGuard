import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SectionTitleProps {
  title: string
  subtitle?: string
  badge?: ReactNode
  align?: 'left' | 'center'
  className?: string
}

export default function SectionTitle({
  title,
  subtitle,
  badge,
  align = 'center',
  className = '',
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`
        mb-12
        ${align === 'center' ? 'text-center' : 'text-left'}
        ${className}
      `}
    >
      {badge && <div className="mb-4">{badge}</div>}
      <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4 text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto text-balance">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
