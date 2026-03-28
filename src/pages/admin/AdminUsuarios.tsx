import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { User, UserEstado, UserPlan } from '@/lib/supabase'
import { mockUsers } from '@/store/mockData'
import { useAuthStore } from '@/store/authStore'
import { logActivity } from '@/lib/logActivity'
import { UsuariosTable } from '@/components/admin/usuarios/UsuariosTable'
import { UsuarioDetalle } from '@/components/admin/usuarios/UsuarioDetalle'

type RolFilter = 'todos' | 'arquitecto' | 'cliente'
type EstadoFilter = 'todos' | UserEstado
type PlanFilter = 'todos' | UserPlan

export function AdminUsuarios() {
  const navigate = useNavigate()
  const adminUser = useAuthStore((s) => s.user)
  const [rolFilter, setRolFilter] = useState<RolFilter>('todos')
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('todos')
  const [search, setSearch] = useState('')
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [confirmImpersonate, setConfirmImpersonate] = useState<User | null>(null)

  const filtered = useMemo(() => {
    return mockUsers
      .filter((u) => u.role !== 'admin')
      .filter((u) => rolFilter === 'todos' || u.role === rolFilter)
      .filter((u) => estadoFilter === 'todos' || u.estado === estadoFilter)
      .filter((u) => planFilter === 'todos' || u.plan === planFilter)
      .filter((u) => {
        if (!search) return true
        const q = search.toLowerCase()
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      })
  }, [rolFilter, estadoFilter, planFilter, search])

  // CRT-003: Impersonación con confirmación + audit log + timeout
  const handleRequestImpersonate = (user: User) => {
    setConfirmImpersonate(user)
  }

  const handleConfirmImpersonate = () => {
    if (!confirmImpersonate || !adminUser) return
    // Log the impersonation
    logActivity(adminUser.id, 'impersonate_user', {
      target_user_id: confirmImpersonate.id,
      target_user_email: confirmImpersonate.email,
      timestamp: new Date().toISOString(),
    })
    sessionStorage.setItem('hitos-impersonating', JSON.stringify({
      id: confirmImpersonate.id,
      name: confirmImpersonate.name,
      admin_id: adminUser.id,
      admin_email: adminUser.email,
      started_at: Date.now(),
    }))
    localStorage.setItem('hitos-mock-user', confirmImpersonate.email)
    setConfirmImpersonate(null)
    navigate('/projects')
  }

  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-xl font-heading font-bold">Usuarios</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="bg-app border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm w-60"
          />
        </div>

        <select value={rolFilter} onChange={(e) => setRolFilter(e.target.value as RolFilter)} className="bg-app border border-border rounded-lg px-3 py-1.5 text-sm">
          <option value="todos">Todos los roles</option>
          <option value="arquitecto">Arquitecto</option>
          <option value="cliente">Cliente</option>
        </select>

        <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value as EstadoFilter)} className="bg-app border border-border rounded-lg px-3 py-1.5 text-sm">
          <option value="todos">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="trial">Trial</option>
          <option value="vip">VIP</option>
          <option value="suspendido">Suspendido</option>
          <option value="churned">Churned</option>
        </select>

        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value as PlanFilter)} className="bg-app border border-border rounded-lg px-3 py-1.5 text-sm">
          <option value="todos">Todos los planes</option>
          <option value="gratis">Gratis</option>
          <option value="seguimiento">Seguimiento</option>
          <option value="control">Control</option>
          <option value="pro">Pro</option>
        </select>

        <span className="text-xs text-secondary ml-auto">{filtered.length} usuarios</span>
      </div>

      <UsuariosTable
        users={filtered}
        onViewDetail={setDetailUser}
        onImpersonate={handleRequestImpersonate}
        onQuickEdit={setDetailUser}
      />

      {detailUser && (
        <UsuarioDetalle
          user={detailUser}
          onClose={() => setDetailUser(null)}
          onImpersonate={handleRequestImpersonate}
        />
      )}

      {/* CRT-003: Modal de confirmación de impersonación */}
      {confirmImpersonate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4 shadow-xl">
            <h3 className="font-heading font-bold text-lg mb-2">Confirmar impersonación</h3>
            <p className="text-sm text-secondary mb-4">
              ¿Confirmar impersonación de <strong>{confirmImpersonate.name}</strong> ({confirmImpersonate.email})?
              <br />
              <span className="text-xs text-muted mt-1 block">Esta acción quedará registrada. La sesión expira en 30 minutos.</span>
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmImpersonate(null)}
                className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-hover transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImpersonate}
                className="px-4 py-2 text-sm rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
