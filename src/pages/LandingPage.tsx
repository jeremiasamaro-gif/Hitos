import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LangProvider } from '@/contexts/LangContext'
import { BubbleBackground } from '@/components/landing/BubbleBackground'
import { LandingNav } from '@/components/landing/LandingNav'
import { HeroSection } from '@/components/landing/HeroSection'
import { ValueSection } from '@/components/landing/ValueSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { PricingSection } from '@/components/landing/PricingSection/index'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { RegisterSection } from '@/components/landing/RegisterSection'

export function LandingPage() {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)

  // If already logged in, redirect to dashboard
  if (!loading && user) {
    return <Navigate to="/projects" replace />
  }

  return (
    <LangProvider>
      <div className="min-h-screen bg-app text-primary">
        <BubbleBackground />
        <LandingNav />
        <HeroSection />
        <ValueSection />
        <FeaturesSection />
        <PricingSection />
        <TestimonialsSection />
        <RegisterSection />

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-[var(--color-border)]" style={{ position: 'relative', zIndex: 1 }}>
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-heading font-bold text-primary">
              Hito<span className="text-accent">'s</span>
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              © {new Date().getFullYear()} Hito's. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </LangProvider>
  )
}
