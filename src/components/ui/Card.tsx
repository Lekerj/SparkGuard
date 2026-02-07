import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function Card({
  children,
  className = '',
  hover = false,
  padding = 'md',
}: CardProps) {
  const baseClasses = `
    bg-white rounded-xl border border-neutral-200
    ${paddings[padding]}
    ${hover ? 'card-shadow hover:card-shadow-hover transition-shadow duration-200' : 'card-shadow'}
    ${className}
  `

  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        className={baseClasses}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={baseClasses}>{children}</div>
}
