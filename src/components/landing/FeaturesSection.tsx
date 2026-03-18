import { useState } from 'react'
import { useLang } from '@/contexts/LangContext'

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-status-ok)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export function FeaturesSection() {
  const { t } = useLang()
  const [tab, setTab] = useState<'architect' | 'client'>('architect')

  const architectFeatures = [
    t.features_arch_1,
    t.features_arch_2,
    t.features_arch_3,
    t.features_arch_4,
    t.features_arch_5,
    t.features_arch_6,
  ]

  const clientFeatures = [
    t.features_cli_1,
    t.features_cli_2,
    t.features_cli_3,
    t.features_cli_4,
    t.features_cli_5,
  ]

  const features = tab === 'architect' ? architectFeatures : clientFeatures

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl lg:text-3xl font-heading font-bold text-primary text-center mb-8">
          {t.features_title}
        </h2>

        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex border border-[var(--color-border)] rounded-lg overflow-hidden">
            <button
              onClick={() => setTab('architect')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === 'architect'
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:text-primary hover:bg-[var(--color-bg-hover)]'
              }`}
            >
              {t.features_tab_architect}
            </button>
            <button
              onClick={() => setTab('client')}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === 'client'
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:text-primary hover:bg-[var(--color-bg-hover)]'
              }`}
            >
              {t.features_tab_client}
            </button>
          </div>
        </div>

        {/* Feature list */}
        <div className="bg-card border border-[var(--color-border)] rounded-xl shadow-card p-8">
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3">
                <CheckIcon />
                <span className="text-base text-primary">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
