import { useNavigate } from 'react-router-dom'
import { useLang } from '@/contexts/LangContext'

export function LandingNav() {
  const { t, lang, setLang } = useLang()
  const navigate = useNavigate()

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)]"
      style={{ backdropFilter: 'blur(12px)', background: 'rgba(242,241,236,0.85)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xl font-heading font-bold text-primary">
          Hito<span className="text-accent">'s</span>
        </button>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('features')} className="text-sm text-secondary hover:text-primary transition-colors">
            {t.nav_features}
          </button>
          <button onClick={() => scrollTo('pricing')} className="text-sm text-secondary hover:text-primary transition-colors">
            {t.nav_pricing}
          </button>
          <button onClick={() => scrollTo('testimonials')} className="text-sm text-secondary hover:text-primary transition-colors">
            {t.nav_testimonials}
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Language selector */}
          <div className="flex items-center gap-1 border border-[var(--color-border)] rounded-lg overflow-hidden">
            <button
              onClick={() => setLang('es')}
              className={`px-2 py-1 text-xs transition-colors ${lang === 'es' ? 'bg-[var(--color-bg-hover)] text-primary font-medium' : 'text-secondary hover:text-primary'}`}
            >
              <span className="mr-1">🇦🇷</span>ES
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 text-xs transition-colors ${lang === 'en' ? 'bg-[var(--color-bg-hover)] text-primary font-medium' : 'text-secondary hover:text-primary'}`}
            >
              <span className="mr-1">🇬🇧</span>EN
            </button>
          </div>

          <button
            onClick={() => navigate('/auth')}
            className="text-sm text-secondary hover:text-primary transition-colors hidden sm:block"
          >
            {t.nav_login}
          </button>
          <button
            onClick={() => scrollTo('register')}
            className="text-sm bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-dark transition-colors font-medium"
          >
            {t.nav_register}
          </button>
        </div>
      </div>
    </nav>
  )
}
