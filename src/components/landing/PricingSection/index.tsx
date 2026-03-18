import { useLang } from '@/contexts/LangContext'
import { ArchitectPricing } from './ArchitectPricing'
import { ClientPricing } from './ClientPricing'

export function PricingSection() {
  const { t } = useLang()

  return (
    <section id="pricing" className="py-20 px-4 bg-[var(--color-bg-alt)]" style={{ zIndex: 1, position: 'relative' }}>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary text-center mb-12">
          {t.pricing_title}
        </h2>
        <ArchitectPricing />
        <ClientPricing />
      </div>
    </section>
  )
}
