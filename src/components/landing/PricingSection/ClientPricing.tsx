import { useLang } from '@/contexts/LangContext'
import { PricingCard } from './PricingCard'

export function ClientPricing() {
  const { t } = useLang()

  const scrollToRegister = () => {
    document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      {/* Separator */}
      <div className="flex items-center gap-4 my-14 max-w-3xl mx-auto">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-sm text-[var(--color-text-muted)] font-medium shrink-0">
          {t.pricing_cli_separator || 'Para el cliente'}
        </span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <h3 className="text-xl font-bold text-primary text-center mb-2">
        {t.pricing_cli_title || 'Para el cliente'}
      </h3>
      <p className="text-sm text-secondary text-center mb-8">
        {t.pricing_cli_sub || 'Pagá según el nivel de visibilidad que necesitás.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <PricingCard
          planName={t.pricing_cli_basic || 'BÁSICO'}
          price={t.pricing_cli_basic_price || 'Gratis'}
          priceNote={t.pricing_cli_basic_note || 'Siempre gratis'}
          description={t.pricing_cli_basic_desc || 'Para estar al tanto'}
          features={[
            { text: t.pricing_cli_b_f1 || 'Resumen general del proyecto', included: true },
            { text: t.pricing_cli_b_f2 || '% de avance de la obra', included: true },
            { text: t.pricing_cli_b_f3 || 'Notificaciones de hitos', included: true },
            { text: t.pricing_cli_b_f4 || 'PNL detallado', included: false },
            { text: t.pricing_cli_b_f5 || 'Comentarios con el arquitecto', included: false },
            { text: t.pricing_cli_b_f6 || 'Exportar PDF', included: false },
          ]}
          ctaLabel={t.pricing_free_cta || 'Empezar gratis'}
          ctaAction={scrollToRegister}
        />
        <PricingCard
          planName={t.pricing_cli_follow || 'SEGUIMIENTO'}
          price={t.pricing_cli_follow_price || '$5 USD / mes'}
          priceNote={t.pricing_cli_follow_note || 'Sin tarjeta de crédito'}
          description={t.pricing_cli_follow_desc || 'Para estar informado'}
          features={[
            { text: t.pricing_cli_f_f1 || 'Todo lo del plan Básico', included: true },
            { text: t.pricing_cli_f_f2 || 'PNL completo línea por línea', included: true },
            { text: t.pricing_cli_f_f3 || 'Comentarios con el arquitecto', included: true },
            { text: t.pricing_cli_f_f4 || 'Alertas de rubros excedidos', included: true },
            { text: t.pricing_cli_f_f5 || 'Registrar tus propios pagos', included: true },
            { text: t.pricing_cli_f_f6 || 'Historial de gastos', included: true },
          ]}
          ctaLabel={t.pricing_pro_cta || 'Empezar prueba de 14 días'}
          ctaAction={scrollToRegister}
          highlighted
          badge={t.pricing_pro_badge || 'Más popular'}
        />
        <PricingCard
          planName={t.pricing_cli_control || 'CONTROL'}
          price={t.pricing_cli_control_price || '$12 USD / mes'}
          priceNote={t.pricing_cli_control_note || 'Facturación mensual o anual'}
          description={t.pricing_cli_control_desc || 'Para tener el mismo control que tu arquitecto'}
          features={[
            { text: t.pricing_cli_c_f1 || 'Todo lo del plan Seguimiento', included: true },
            { text: t.pricing_cli_c_f2 || 'Export PDF profesional', included: true },
            { text: t.pricing_cli_c_f3 || 'Historial de cambios en el presupuesto', included: true },
            { text: t.pricing_cli_c_f4 || 'Comparativa mes a mes', included: true },
            { text: t.pricing_cli_c_f5 || 'Proyección final en USD', included: true },
            { text: t.pricing_cli_c_f6 || 'Acceso prioritario a nuevas funciones', included: true },
          ]}
          ctaLabel={t.pricing_pro_cta || 'Empezar prueba de 14 días'}
          ctaAction={scrollToRegister}
        />
      </div>
    </div>
  )
}
