import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getProjectsWithStats, type ProjectWithStats } from '@/lib/api/projects'
import { GlobalKPIs } from '@/components/projects/GlobalKPIs'
import { ProjectGrid } from '@/components/projects/ProjectGrid'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Plus } from 'lucide-react'
import { UserMenu } from '@/components/ui/UserMenu'

export function ProjectsPage() {
  const { user } = useAuthStore()
  const [projects, setProjects] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  const isArchitect = user?.role === 'arquitecto'

  useEffect(() => {
    let mounted = true
    setLoading(true)
    getProjectsWithStats().then((data) => {
      if (mounted) {
        setProjects(data)
        setLoading(false)
      }
    })
    return () => { mounted = false }
  }, [])

  const handleClose = () => {
    setShowCreate(false)
    // Refresh stats after potential creation
    getProjectsWithStats().then(setProjects)
  }

  return (
    <div className="min-h-screen bg-app p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-heading font-bold">
              Hito<span className="text-accent">'s</span>
            </h1>
            <p className="text-sm text-secondary mt-1">
              {isArchitect ? 'Tus proyectos' : 'Proyectos compartidos'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isArchitect && (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus size={16} /> Nuevo
              </Button>
            )}
            {user && (
              <UserMenu
                userName={user.name}
                userRole={user.role}
                userEmail={user.email}
              />
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="w-8 h-8" />
          </div>
        ) : (
          <>
            {isArchitect && projects.length > 0 && (
              <GlobalKPIs projects={projects} user={user} />
            )}
            <ProjectGrid
              projects={projects}
              onCreateProject={() => setShowCreate(true)}
            />
          </>
        )}
      </div>

      <CreateProjectModal open={showCreate} onClose={handleClose} />
    </div>
  )
}
