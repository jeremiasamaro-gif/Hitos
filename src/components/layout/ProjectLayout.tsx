import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { CurrencySelector } from '@/components/ui/CurrencySelector'
import { Badge } from '@/components/ui/Badge'
import { UserMenu } from '@/components/ui/UserMenu'
import { ProjectTabs } from './ProjectTabs'
import { NuevaActualizacionDropdown } from '@/components/project/NuevaActualizacionDropdown'

export function ProjectLayout() {
  const { project, userRole, globalProgress } = useProjectContext()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const progressVariant = globalProgress > 100 ? 'danger' : globalProgress > 80 ? 'warning' : 'success'

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/projects')}
              className="p-1.5 text-secondary hover:text-primary transition-colors shrink-0"
              title="Volver a proyectos"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="font-heading font-bold text-lg truncate">{project.name}</h1>
              {project.address && (
                <p className="text-xs text-secondary truncate">{project.address}</p>
              )}
            </div>
            <Badge variant={progressVariant} className="shrink-0 font-mono">
              {globalProgress.toFixed(1)}%
            </Badge>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>
            <Badge variant={userRole === 'arquitecto' ? 'accent' : 'default'}>
              {userRole === 'arquitecto' ? 'Arquitecto' : 'Cliente'}
            </Badge>
            {user && (
              <UserMenu
                userName={user.name}
                userRole={user.role}
                userEmail={user.email}
                currentProjectId={project.id}
              />
            )}
          </div>
        </div>

        {/* Mobile currency selector */}
        <div className="sm:hidden px-4 pb-2">
          <CurrencySelector />
        </div>

        {/* Tabs + CTA inline */}
        <ProjectTabs
          role={userRole}
          cta={userRole === 'arquitecto' ? <NuevaActualizacionDropdown /> : undefined}
        />
      </header>

      {/* Content */}
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}
