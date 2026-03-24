import { useState } from 'react'
import type { User, PipelineEstado } from '@/lib/supabase'
import { mockUsers } from '@/store/mockData'
import { PipelineKanban } from '@/components/admin/pipeline/PipelineKanban'
import { UsuarioDetalle } from '@/components/admin/usuarios/UsuarioDetalle'
import { useNavigate } from 'react-router-dom'

export function AdminPipeline() {
  const navigate = useNavigate()
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [, setForceUpdate] = useState(0)

  const handleMove = (userId: string, newEstado: PipelineEstado) => {
    const idx = mockUsers.findIndex((u) => u.id === userId)
    if (idx >= 0) {
      mockUsers[idx] = { ...mockUsers[idx], pipeline_estado: newEstado }
      setForceUpdate((n) => n + 1)
    }
  }

  const handleImpersonate = (user: User) => {
    sessionStorage.setItem('hitos-impersonating', JSON.stringify({ id: user.id, name: user.name }))
    localStorage.setItem('hitos-mock-user', user.email)
    navigate('/projects')
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-xl font-heading font-bold">Pipeline comercial</h1>
      <p className="text-sm text-secondary">Arrastrá las cards entre columnas para cambiar el estado del pipeline.</p>

      <PipelineKanban
        onUserClick={setDetailUser}
        onMove={handleMove}
      />

      {detailUser && (
        <UsuarioDetalle
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onImpersonate={handleImpersonate}
        />
      )}
    </div>
  )
}
