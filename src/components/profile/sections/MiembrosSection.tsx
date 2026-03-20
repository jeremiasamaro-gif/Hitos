import { useState, useMemo } from 'react'
import { Search, Key, Trash2, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { mockProjects, mockProjectMembers, mockUsers } from '@/store/mockData'

interface ClientMember {
  userId: string
  name: string
  email: string
  initial: string
  projects: { id: string; name: string }[]
  firstAccess: string
  lastSignIn: string | null
}

export function MiembrosSection() {
  const user = useAuthStore((s) => s.user)!
  const [search, setSearch] = useState('')
  const [accessModalClient, setAccessModalClient] = useState<ClientMember | null>(null)

  const members = useMemo(() => {
    // Get architect's projects
    const archProjectIds = mockProjectMembers
      .filter((m) => m.user_id === user.id && m.role === 'arquitecto')
      .map((m) => m.project_id)

    // Get all client members across all architect's projects
    const clientMemberships = mockProjectMembers.filter(
      (m) => archProjectIds.includes(m.project_id) && m.role === 'cliente'
    )

    // Group by user
    const map = new Map<string, ClientMember>()
    for (const membership of clientMemberships) {
      const u = mockUsers.find((u) => u.id === membership.user_id)
      if (!u) continue
      const project = mockProjects.find((p) => p.id === membership.project_id)
      if (!project) continue

      if (map.has(u.id)) {
        const existing = map.get(u.id)!
        existing.projects.push({ id: project.id, name: project.name })
        if (membership.created_at < existing.firstAccess) {
          existing.firstAccess = membership.created_at
        }
      } else {
        map.set(u.id, {
          userId: u.id,
          name: u.name,
          email: u.email,
          initial: u.name.charAt(0).toUpperCase(),
          projects: [{ id: project.id, name: project.name }],
          firstAccess: membership.created_at,
          lastSignIn: u.last_sign_in,
        })
      }
    }

    return Array.from(map.values())
  }, [user.id])

  const filtered = members.filter((m) => {
    const q = search.toLowerCase()
    return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
  })

  const handleDeleteClient = (client: ClientMember) => {
    if (!confirm(`¿Eliminar a ${client.name} de todos los proyectos?\nEsta acción no se puede deshacer.`)) return
    // Remove from mock data
    for (const proj of client.projects) {
      const idx = mockProjectMembers.findIndex(
        (m) => m.project_id === proj.id && m.user_id === client.userId
      )
      if (idx !== -1) mockProjectMembers.splice(idx, 1)
    }
    // Force re-render by triggering search update
    setSearch(search + ' ')
    setTimeout(() => setSearch(search), 10)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-accent" />
        <h3 className="text-base font-heading font-semibold">Miembros y Accesos</h3>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-10">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted mb-3">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p className="text-sm text-secondary">Todavía no invitaste a ningún cliente</p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full bg-app border border-border rounded-lg pl-9 pr-3 py-2 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-secondary text-left">
                  <th className="px-2 py-2">Nombre</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Proyectos asignados</th>
                  <th className="px-2 py-2">Fecha de acceso</th>
                  <th className="px-2 py-2">Ultima conexion</th>
                  <th className="px-2 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.userId} className="border-b border-border/30 hover:bg-hover/30 transition-colors">
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                          style={{ background: 'var(--color-accent)', color: 'white', opacity: 0.8 }}
                        >
                          {client.initial}
                        </div>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-secondary">{client.email}</td>
                    <td className="px-2 py-2">
                      <ProjectChips projects={client.projects} />
                    </td>
                    <td className="px-2 py-2 text-secondary">{formatDate(client.firstAccess)}</td>
                    <td className="px-2 py-2 text-secondary text-xs">
                      {client.lastSignIn
                        ? formatDistanceToNow(new Date(client.lastSignIn), { addSuffix: true, locale: es })
                        : 'Nunca'}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setAccessModalClient(client)}
                          className="p-1 rounded hover:bg-hover text-secondary hover:text-primary"
                          title="Gestionar accesos"
                        >
                          <Key size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client)}
                          className="p-1 rounded hover:bg-red-500/10 text-secondary hover:text-red-400"
                          title="Eliminar de todos los proyectos"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Access management modal */}
      {accessModalClient && (
        <AccessModal
          client={accessModalClient}
          architectId={user.id}
          onClose={() => setAccessModalClient(null)}
        />
      )}
    </Card>
  )
}

// ============================================
// Project Chips
// ============================================

function ProjectChips({ projects }: { projects: { id: string; name: string }[] }) {
  const [showAll, setShowAll] = useState(false)
  const maxVisible = 2

  if (projects.length <= maxVisible) {
    return (
      <div className="flex flex-wrap gap-1">
        {projects.map((p) => (
          <span key={p.id} className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {p.name}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {projects.slice(0, maxVisible).map((p) => (
        <span key={p.id} className="text-[11px] px-2 py-0.5 rounded-full bg-accent/10 text-accent">
          {p.name}
        </span>
      ))}
      <span
        className="text-[11px] px-2 py-0.5 rounded-full bg-border text-secondary cursor-pointer hover:text-primary relative"
        onMouseEnter={() => setShowAll(true)}
        onMouseLeave={() => setShowAll(false)}
      >
        +{projects.length - maxVisible} más
        {showAll && (
          <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-lg shadow-lg p-2 z-50 whitespace-nowrap">
            {projects.slice(maxVisible).map((p) => (
              <div key={p.id} className="text-xs py-0.5">{p.name}</div>
            ))}
          </div>
        )}
      </span>
    </div>
  )
}

// ============================================
// Access Management Modal
// ============================================

function AccessModal({
  client,
  architectId,
  onClose,
}: {
  client: ClientMember
  architectId: string
  onClose: () => void
}) {
  // Get all architect's projects
  const archProjectIds = mockProjectMembers
    .filter((m) => m.user_id === architectId && m.role === 'arquitecto')
    .map((m) => m.project_id)
  const allProjects = mockProjects.filter((p) => archProjectIds.includes(p.id))

  // Track which projects this client has access to
  const [access, setAccess] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const p of allProjects) {
      map[p.id] = client.projects.some((cp) => cp.id === p.id)
    }
    return map
  })

  const handleSave = () => {
    for (const p of allProjects) {
      const hasAccess = mockProjectMembers.some(
        (m) => m.project_id === p.id && m.user_id === client.userId && m.role === 'cliente'
      )
      if (access[p.id] && !hasAccess) {
        // Add membership
        mockProjectMembers.push({
          id: crypto.randomUUID(),
          project_id: p.id,
          user_id: client.userId,
          role: 'cliente',
          created_at: new Date().toISOString(),
        })
      } else if (!access[p.id] && hasAccess) {
        // Remove membership
        const idx = mockProjectMembers.findIndex(
          (m) => m.project_id === p.id && m.user_id === client.userId && m.role === 'cliente'
        )
        if (idx !== -1) mockProjectMembers.splice(idx, 1)
      }
    }
    onClose()
  }

  return (
    <Modal open={true} onClose={onClose} title={`Accesos de ${client.name}`}>
      <div className="space-y-3 mb-6">
        {allProjects.map((p) => (
          <label key={p.id} className="flex items-center gap-3 cursor-pointer py-1">
            <input
              type="checkbox"
              checked={access[p.id] || false}
              onChange={(e) => setAccess({ ...access, [p.id]: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">{p.name}</span>
            {p.address && <span className="text-xs text-secondary">{p.address}</span>}
          </label>
        ))}
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>Guardar cambios</Button>
        <Button size="sm" variant="ghost" onClick={onClose}>Cancelar</Button>
      </div>
    </Modal>
  )
}
