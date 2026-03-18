import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { HonorariosSection } from '../sections/HonorariosSection'
import { DatosPersonalesSection } from '../sections/DatosPersonalesSection'
import { getProjectsWithStats, type ProjectWithStats } from '@/lib/api/projects'

export function MiPerfilTab() {
  const user = useAuthStore((s) => s.user)
  const [proyectos, setProyectos] = useState<ProjectWithStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      const data = await getProjectsWithStats(user.id)
      setProyectos(data)
      setLoading(false)
    }
    load()
  }, [user?.id])

  return (
    <div className="space-y-6">
      {user?.role === 'arquitecto' && (
        <HonorariosSection proyectos={proyectos} loading={loading} />
      )}
      <DatosPersonalesSection />
    </div>
  )
}
