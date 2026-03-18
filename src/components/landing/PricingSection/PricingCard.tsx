const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const CrossIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

interface PricingCardProps {
  planName: string
  price: string
  priceNote: string
  description: string
  features: Array<{ text: string; included: boolean }>
  ctaLabel: string
  ctaAction: () => void
  highlighted?: boolean
  badge?: string
}

export function PricingCard({
  planName,
  price,
  priceNote,
  description,
  features,
  ctaLabel,
  ctaAction,
  highlighted,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={`relative bg-card rounded-xl p-6 flex flex-col transition-all duration-150 ${
        highlighted
          ? 'border-2 border-accent shadow-card-hover'
          : 'border border-[var(--color-border)] shadow-card hover:shadow-card-hover hover:border-[var(--color-border-hover)]'
      }`}
    >
      {badge && (
        <span
          className="absolute left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-medium px-3.5 py-1 rounded-full"
          style={{ top: '-14px' }}
        >
          {badge}
        </span>
      )}
      <h3 className="text-sm font-bold text-secondary tracking-wider mb-1">{planName}</h3>
      <p className="text-2xl font-bold text-primary mb-0.5">{price}</p>
      <p className="text-[11px] text-[var(--color-text-muted)] mb-1">{priceNote}</p>
      <p className="text-sm text-secondary mb-5">{description}</p>
      <ul className="space-y-2.5 flex-1 mb-6">
        {features.map((f) => (
          <li key={f.text} className={`flex items-start gap-2 text-sm ${f.included ? 'text-primary' : 'text-[var(--color-text-muted)]'}`}>
            {f.included ? <CheckIcon /> : <CrossIcon />}
            {f.text}
          </li>
        ))}
      </ul>
      <button
        onClick={ctaAction}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
          highlighted
            ? 'bg-accent text-white hover:bg-accent-dark'
            : 'border border-[var(--color-border)] text-primary hover:bg-[var(--color-bg-hover)]'
        }`}
      >
        {ctaLabel}
      </button>
    </div>
  )
}
