import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import type { User, UserEstado, UserPlan } from '@/lib/supabase'
import { mockUsers } from '@/store/mockData'
import { UsuariosTable } from '@/components/admin/usuarios/UsuariosTable'
import { UsuarioDetalle } from '@/components/admin/usuarios/UsuarioDetalle'

type RolFilter = 'todos' | 'arquitecto' | 'cliente'
type EstadoFilter = 'todos' | UserEstado
type PlanFilter = 'todos' | UserPlan

export function AdminUsuarios() {
  const navigate = useNavigate()
  const [rolFilter, setRolFilter] = useState<RolFilter>('todos')
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>('todos')
  const [planFilter, setPlanFilter] = useState<PlanFilter>('todos')
  const [search, setSearch] = useState('')
  const [detailUser, setDetailUser] = useState<User | null>(null)

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

  const handleImpersonate = (user: User) => {
    sessionStorage.setItem('hitos-impersonating', JSON.stringify({ id: user.id, name: user.name }))
    localStorage.setItem('hitos-mock-user', user.email)
    navigate(user.role === 'arquitecto' ? '/projects' : '/projects')
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
        onImpersonate={handleImpersonate}
        onQuickEdit={setDetailUser}
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
