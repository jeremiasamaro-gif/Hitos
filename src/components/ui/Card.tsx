import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-card rounded-xl border border-border shadow-card p-6 ${className}`}>
      {children}
    </div>
  )
}
