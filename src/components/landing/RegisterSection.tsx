import { useLang } from '@/contexts/LangContext'

export function RegisterSection() {
  const { t } = useLang()

  const scrollToForm = () => {
    document.getElementById('hero-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="py-20 px-4 text-center" style={{ background: 'var(--color-bg-sidebar)', zIndex: 1, position: 'relative' }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-4">
          {t.cta_title || '¿Listo para empezar?'}
        </h2>
        <p className="text-lg text-secondary mb-8">
          {t.cta_subtitle || 'Arquitectos de toda Argentina ya gestionan sus obras sin planillas.'}
        </p>
        <button
          onClick={scrollToForm}
          className="bg-accent text-white rounded-lg text-base font-medium hover:bg-accent-dark transition-colors"
          style={{ height: 52, padding: '0 40px', fontSize: 16 }}
        >
          {t.register_cta || 'Crear cuenta gratis'}
        </button>
        <p className="text-[13px] text-[var(--color-text-muted)] mt-4">
          {t.cta_note || 'Gratis para arquitectos. Siempre.'}
        </p>
      </div>
    </section>
  )
}
