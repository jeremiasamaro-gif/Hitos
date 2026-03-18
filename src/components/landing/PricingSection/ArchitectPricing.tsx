import { useLang } from '@/contexts/LangContext'
import { AddonCard } from './AddonCard'

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

const UserPlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
)

const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
  </svg>
)

export function ArchitectPricing() {
  const { t } = useLang()

  const scrollToRegister = () => {
    document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const features = [
    t.pricing_arch_f1 || 'Hasta 10 proyectos activos',
    t.pricing_arch_f2 || 'Clientes ilimitados por proyecto',
    t.pricing_arch_f3 || 'Importación Excel/CSV',
    t.pricing_arch_f4 || 'Export PDF profesional',
    t.pricing_arch_f5 || 'Alertas automáticas de desfasajes',
    t.pricing_arch_f6 || 'Análisis de rubros excedidos',
    t.pricing_arch_f7 || 'PNL completo con comparativa de períodos',
  ]

  return (
    <div>
      <h3 className="text-xl font-bold text-primary text-center mb-2">
        {t.pricing_arch_title || 'Para el arquitecto'}
      </h3>
      <p className="text-sm text-secondary text-center mb-8">
        {t.pricing_arch_sub || 'Gratis siempre. Crecé con addons cuando lo necesitás.'}
      </p>

      {/* Main free plan card */}
      <div className="max-w-[560px] mx-auto bg-card border border-[var(--color-border)] rounded-xl p-8 shadow-card mb-10">
        <div className="flex justify-center mb-4">
          <span className="text-[11px] font-medium px-3 py-1 rounded-full" style={{ background: '#EEF2FF', color: 'var(--color-accent)' }}>
            {t.pricing_arch_badge || 'SIEMPRE GRATIS'}
          </span>
        </div>
        <p className="text-4xl font-bold text-primary text-center mb-1">$0 / mes</p>
        <p className="text-sm text-secondary text-center mb-6">
          {t.pricing_arch_limit || 'Hasta 10 proyectos activos simultáneos'}
        </p>
        <ul className="space-y-3 mb-6">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-primary">
              <CheckIcon />
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={scrollToRegister}
          className="w-full bg-accent text-white py-3 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          {t.pricing_free_cta || 'Empezar gratis'}
        </button>
        <p className="text-[11px] text-[var(--color-text-muted)] text-center mt-3">
          {t.pricing_arch_note || 'Sin tarjeta de crédito. Sin vencimiento.'}
        </p>
      </div>

      {/* Addons */}
      <h4 className="text-lg font-bold text-primary text-center mb-2">
        {t.pricing_addons_title || 'Addons disponibles'}
      </h4>
      <p className="text-sm text-secondary text-center mb-6">
        {t.pricing_addons_sub || 'Sumá lo que necesitás, cancelás cuando querés.'}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
        <AddonCard
          icon={<PlusIcon />}
          title={t.pricing_addon_1_title || '+5 proyectos activos'}
          description={t.pricing_addon_1_desc || 'Superaste los 10 proyectos simultáneos'}
          price="$4 USD/mes"
        />
        <AddonCard
          icon={<UserPlusIcon />}
          title={t.pricing_addon_2_title || 'Arquitecto adicional'}
          description={t.pricing_addon_2_desc || 'Para estudios con más de un profesional'}
          price="$6 USD/mes"
        />
        <AddonCard
          icon={<GridIcon />}
          title={t.pricing_addon_3_title || 'Dashboard consolidado'}
          description={t.pricing_addon_3_desc || 'Todos tus proyectos en una sola vista'}
          price="$5 USD/mes"
        />
      </div>
    </div>
  )
}
