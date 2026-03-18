import type { ReactNode } from 'react'

interface AddonCardProps {
  icon: ReactNode
  title: string
  description: string
  price: string
}

export function AddonCard({ icon, title, description, price }: AddonCardProps) {
  return (
    <div className="bg-card border border-[var(--color-border)] p-5 shadow-card hover:shadow-card-hover hover:border-[var(--color-border-hover)] transition-all duration-150" style={{ borderRadius: 'var(--radius-lg)' }}>
      <div className="text-accent mb-3">{icon}</div>
      <h4 className="text-[15px] font-bold text-primary mb-1">{title}</h4>
      <p className="text-[13px] text-secondary mb-3">{description}</p>
      <p className="text-lg font-bold text-accent mb-3">{price}</p>
      <button className="text-sm font-medium text-accent border border-accent/30 rounded-lg px-4 py-1.5 hover:bg-accent/5 transition-colors">
        Agregar
      </button>
    </div>
  )
}
