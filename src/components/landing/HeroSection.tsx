import { useLang } from '@/contexts/LangContext'
import { useRegisterForm } from '@/hooks/landing/useRegisterForm'

const CheckInline = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
)

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" />
  </svg>
)

const PersonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export function HeroSection() {
  const { t } = useLang()
  const form = useRegisterForm()

  return (
    <section className="relative min-h-[90vh] flex items-center px-4 pt-20 pb-12" style={{ zIndex: 1 }}>
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 items-center">
        {/* Left column */}
        <div>
          <h1 className="text-[32px] lg:text-[48px] font-heading font-bold text-primary leading-tight mb-6">
            {t.hero_title?.split('sin')[0]}
            <br />
            sin {t.hero_title?.split('sin')[1]?.trim()}
          </h1>
          <p className="text-lg text-secondary mb-8 max-w-lg leading-relaxed">
            {t.hero_subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-6">
            {[
              t.register_bullet_1 || 'Setup en 5 minutos',
              t.register_bullet_2 || 'Sin tarjeta de crédito',
              t.hero_cta || 'Gratis para arquitectos',
            ].map((text) => (
              <span key={text} className="flex items-center gap-1.5 text-[13px] text-secondary">
                <CheckInline />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Right column — register form */}
        <div id="hero-form" className="bg-card border border-[var(--color-border)] p-8 shadow-card-hover" style={{ borderRadius: 'var(--radius-xl)' }}>
          <h2 className="text-xl font-bold text-primary mb-1">{t.register_cta || 'Crear cuenta gratis'}</h2>
          <p className="text-[13px] text-secondary mb-6">
            {t.hero_subtitle_form || 'Empezá hoy, sin compromiso'}
          </p>

          <form onSubmit={form.handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{t.register_name}</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => form.setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-card text-primary text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{t.register_email}</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => form.setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-card text-primary text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-primary mb-1">{t.register_password}</label>
              <div className="relative">
                <input
                  type={form.showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => form.setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-card text-primary text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-accent transition-colors pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => form.setShowPassword(!form.showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
                >
                  <EyeIcon open={form.showPassword} />
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => form.setRole('arquitecto')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all text-center"
                style={{
                  border: form.role === 'arquitecto' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: form.role === 'arquitecto' ? '#EEF2FF' : 'var(--color-bg-app)',
                }}
              >
                <BuildingIcon />
                <span className="text-sm font-medium text-primary">{t.register_role_arch}</span>
                <span className="text-[11px] text-secondary">{t.hero_role_arch_sub || 'Gestioná tus proyectos'}</span>
              </button>
              <button
                type="button"
                onClick={() => form.setRole('cliente')}
                className="flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all text-center"
                style={{
                  border: form.role === 'cliente' ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                  background: form.role === 'cliente' ? '#EEF2FF' : 'var(--color-bg-app)',
                }}
              >
                <PersonIcon />
                <span className="text-sm font-medium text-primary">{t.register_role_client}</span>
                <span className="text-[11px] text-secondary">{t.hero_role_cli_sub || 'Seguí tu obra en tiempo real'}</span>
              </button>
            </div>

            {/* Client warning */}
            {form.role === 'cliente' && (
              <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 'var(--radius-md)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
                  {t.register_client_note}
                </p>
              </div>
            )}

            {form.error && (
              <p className="text-sm text-status-exceeded">{form.error}</p>
            )}

            <button
              type="submit"
              disabled={!form.canSubmit}
              className="w-full bg-accent text-white py-3 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
              style={{ height: 48 }}
            >
              {form.loading ? '...' : (t.register_cta || 'Crear cuenta gratis')}
            </button>

            <p className="text-[11px] text-[var(--color-text-muted)] text-center leading-relaxed">
              {t.register_legal}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
