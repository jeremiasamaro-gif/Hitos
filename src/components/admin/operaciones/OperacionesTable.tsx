import { useState, useMemo } from 'react'
import { mockActivityLogs, mockUsers, mockProjects, mockExpenses, mockComments } from '@/store/mockData'

type ActionFilter = 'todos' | 'create_expense' | 'export_pdf' | 'create_comment' | 'create_project' | 'invite_client'

export function OperacionesTable() {
  const [actionFilter, setActionFilter] = useState<ActionFilter>('todos')
  const [userFilter, setUserFilter] = useState('todos')

  const logs = useMemo(() => {
    return [...mockActivityLogs]
      .filter((l) => actionFilter === 'todos' || l.action === actionFilter)
      .filter((l) => userFilter === 'todos' || l.user_id === userFilter)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [actionFilter, userFilter])

  const getUserName = (id: string) => mockUsers.find((u) => u.id === id)?.name ?? 'Desconocido'

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' }) +
      ' ' + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  const actionLabels: Record<string, string> = {
    create_expense: 'Gasto creado',
    export_pdf: 'PDF exportado',
    create_comment: 'Comentario',
    create_project: 'Proyecto creado',
    invite_client: 'Cliente invitado',
  }

  const uniqueUsers = useMemo(() => {
    const ids = new Set(mockActivityLogs.map((l) => l.user_id))
    return [...ids].map((id) => ({ id, name: getUserName(id) }))
  }, [])

  return (
    <div className="space-y-4">
      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] text-secondary uppercase tracking-wider">Gastos cargados</p>
          <p className="text-xl font-bold font-mono">{mockExpenses.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] text-secondary uppercase tracking-wider">Comentarios</p>
          <p className="text-xl font-bold font-mono">{mockComments.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] text-secondary uppercase tracking-wider">Proyectos activos</p>
          <p className="text-xl font-bold font-mono">{mockProjects.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-[10px] text-secondary uppercase tracking-wider">PDFs exportados</p>
          <p className="text-xl font-bold font-mono">
            {mockActivityLogs.filter((l) => l.action === 'export_pdf').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ActionFilter)}
          className="bg-app border border-border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="todos">Todas las acciones</option>
          <option value="create_expense">Gastos</option>
          <option value="export_pdf">PDF exportado</option>
          <option value="create_comment">Comentarios</option>
          <option value="create_project">Proyectos</option>
          <option value="invite_client">Invitaciones</option>
        </select>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="bg-app border border-border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="todos">Todos los usuarios</option>
          {uniqueUsers.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <span className="text-xs text-secondary ml-auto">{logs.length} registros</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-secondary text-left text-xs uppercase tracking-wider bg-card">
              <th className="px-3 py-2.5">Fecha</th>
              <th className="px-3 py-2.5">Usuario</th>
              <th className="px-3 py-2.5">Acción</th>
              <th className="px-3 py-2.5">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-border/50 hover:bg-hover/50">
                <td className="px-3 py-2 text-xs font-mono text-secondary">{formatDate(log.created_at)}</td>
                <td className="px-3 py-2 text-sm">{getUserName(log.user_id)}</td>
                <td className="px-3 py-2">
                  <span className="text-xs font-medium">{actionLabels[log.action] || log.action}</span>
                </td>
                <td className="px-3 py-2 text-xs text-secondary truncate max-w-[200px]">
                  {log.details ? JSON.stringify(log.details) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
