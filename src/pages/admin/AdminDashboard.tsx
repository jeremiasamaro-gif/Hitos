import { useMemo } from 'react'
import { Users, UserCheck, DollarSign, TrendingDown, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import { mockUsers, mockActivityLogs, mockProjects, mockProjectMembers, mockExpenses, mockComments } from '@/store/mockData'

const PLAN_PRICES: Record<string, number> = { gratis: 0, seguimiento: 5, control: 12, pro: 12 }

export function AdminDashboard() {
  const stats = useMemo(() => {
    const nonAdminUsers = mockUsers.filter((u) => u.role !== 'admin')
    const arqs = nonAdminUsers.filter((u) => u.role === 'arquitecto')
    const clientes = nonAdminUsers.filter((u) => u.role === 'cliente')

    // Active in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeUsers = nonAdminUsers.filter((u) =>
      u.last_sign_in && new Date(u.last_sign_in) > thirtyDaysAgo
    )

    // MRR
    const mrr = nonAdminUsers
      .filter((u) => u.estado === 'activo' || u.estado === 'vip' || u.estado === 'trial')
      .reduce((sum, u) => sum + (PLAN_PRICES[u.plan] || 0), 0)

    // Churn
    const churned = nonAdminUsers.filter((u) => u.estado === 'churned')
    const churnRate = nonAdminUsers.length > 0 ? (churned.length / nonAdminUsers.length) * 100 : 0

    // Conversion
    const paying = nonAdminUsers.filter((u) => u.plan !== 'gratis')
    const conversionRate = nonAdminUsers.length > 0 ? (paying.length / nonAdminUsers.length) * 100 : 0

    // Architects without projects
    const arqsWithProjects = new Set(mockProjectMembers.filter(m => m.role === 'arquitecto').map(m => m.user_id))
    const arqsSinProyecto = arqs.filter((a) => !arqsWithProjects.has(a.id))

    return {
      total: nonAdminUsers.length,
      arqs: arqs.length,
      clientes: clientes.length,
      activeUsers: activeUsers.length,
      mrr,
      churnRate,
      conversionRate,
      arqsSinProyecto: arqsSinProyecto.length,
    }
  }, [])

  const recentLogs = useMemo(() => {
    return [...mockActivityLogs]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)
  }, [])

  const getUserName = (id: string) => mockUsers.find((u) => u.id === id)?.name ?? 'Desconocido'

  const actionIcons: Record<string, string> = {
    create_expense: '💰',
    export_pdf: '📄',
    create_comment: '💬',
    create_project: '🏗️',
    invite_client: '📨',
    error: '❌',
  }

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `hace ${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `hace ${hours}h`
    const days = Math.floor(hours / 24)
    return `hace ${days}d`
  }

  const kpis = [
    { label: 'Total usuarios', value: stats.total, sub: `Arq: ${stats.arqs} | Cli: ${stats.clientes}`, icon: <Users size={20} />, color: 'var(--color-accent)' },
    { label: 'Usuarios activos', value: stats.activeUsers, sub: `de ${stats.total} totales`, icon: <UserCheck size={20} />, color: '#10B981' },
    { label: 'MRR estimado', value: `US$ ${stats.mrr}`, sub: 'Planes pagos activos', icon: <DollarSign size={20} />, color: '#8B5CF6' },
    { label: 'Churn rate', value: `${stats.churnRate.toFixed(1)}%`, sub: 'Del último período', icon: <TrendingDown size={20} />, color: '#EF4444' },
    { label: 'Conversión', value: `${stats.conversionRate.toFixed(1)}%`, sub: 'Free → pago', icon: <TrendingUp size={20} />, color: '#F59E0B' },
    { label: 'Arq. sin proyecto', value: stats.arqsSinProyecto, sub: 'Sin proyectos creados', icon: <AlertTriangle size={20} />, color: '#F97316' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <h1 className="text-xl font-heading font-bold">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: kpi.color }}>{kpi.icon}</span>
            </div>
            <p className="text-xl font-bold font-mono">{kpi.value}</p>
            <p className="text-[10px] text-secondary mt-1 uppercase tracking-wider">{kpi.label}</p>
            <p className="text-[10px] text-muted mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Activity + Health side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Actividad reciente global</h2>
          </div>
          <div className="max-h-[400px] overflow-y-auto divide-y divide-border/50">
            {recentLogs.map((log) => (
              <div key={log.id} className="px-4 py-2.5 flex items-center gap-3">
                <span className="text-base shrink-0">{actionIcons[log.action] || '📌'}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">
                    <span className="font-medium">{log.action.replace('_', ' ')}</span>
                    {' · '}
                    <span className="text-secondary">{getUserName(log.user_id)}</span>
                  </p>
                </div>
                <span className="text-[10px] text-muted font-mono shrink-0">{timeAgo(log.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Health */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium">Health check rápido</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Supabase DB</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-green-600 font-medium">OK</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Resp. time</span>
              <span className="text-xs font-mono text-secondary">45ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Último error</span>
              <span className="text-xs text-secondary">Ninguno</span>
            </div>
            <div className="border-t border-border pt-3 mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">Proyectos</span>
                <span className="text-sm font-mono font-medium">{mockProjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">Gastos</span>
                <span className="text-sm font-mono font-medium">{mockExpenses.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">Comentarios</span>
                <span className="text-sm font-mono font-medium">{mockComments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
