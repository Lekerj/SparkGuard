import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'demo' | 'advisory'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  default: 'bg-neutral-100 text-neutral-700 border-neutral-200',
  success: 'bg-success-50 text-success-700 border-success-500/30',
  warning: 'bg-warning-50 text-warning-700 border-warning-500/30',
  danger: 'bg-danger-50 text-danger-700 border-danger-500/30',
  info: 'bg-secondary-50 text-secondary-700 border-secondary-500/30',
  demo: 'bg-purple-50 text-purple-700 border-purple-500/30',
  advisory: 'bg-amber-50 text-amber-700 border-amber-500/30',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
