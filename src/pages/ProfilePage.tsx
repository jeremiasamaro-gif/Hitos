import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { UserMenu } from '@/components/ui/UserMenu'
import { ProfileTabs, type ProfileTabKey } from '@/components/profile/ProfileTabs'
import { MiPerfilTab } from '@/components/profile/tabs/MiPerfilTab'
import { ConfiguracionTab } from '@/components/profile/tabs/ConfiguracionTab'
import { SeguridadTab } from '@/components/profile/tabs/SeguridadTab'

export function ProfilePage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const navState = location.state as { tab?: ProfileTabKey; projectId?: string; returnTo?: string } | null
  const returnTo = navState?.returnTo ?? '/projects'
  const projectId = navState?.projectId ?? null
  const initialTab = navState?.tab ?? 'perfil'

  const [activeTab, setActiveTab] = useState<ProfileTabKey>(initialTab)

  if (!user) {
    navigate('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(returnTo)}
              className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
            <h1 className="font-heading font-bold text-lg">Mi perfil</h1>
          </div>
          <UserMenu
            userName={user.name}
            userRole={user.role}
            userEmail={user.email}
            currentProjectId={projectId ?? undefined}
          />
        </div>
      </header>

      <main className="p-4 lg:p-6 max-w-5xl mx-auto">
        <ProfileTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'perfil' && <MiPerfilTab />}
        {activeTab === 'configuracion' && <ConfiguracionTab projectId={projectId} />}
        {activeTab === 'seguridad' && <SeguridadTab />}
      </main>
    </div>
  )
}
