import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent'

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-border text-secondary',
  success: 'bg-status-ok/10 text-status-ok',
  warning: 'bg-status-warning/10 text-status-warning',
  danger: 'bg-status-exceeded/10 text-status-exceeded',
  accent: 'bg-accent/10 text-accent',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
