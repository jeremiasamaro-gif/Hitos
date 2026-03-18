import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Table2, Receipt, TrendingUp, CreditCard, MessageSquare } from 'lucide-react'
import { useCommentStore } from '@/store/commentStore'
import type { UserRole } from '@/lib/supabase'

interface Tab {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
  external?: boolean // navigates outside project
}

function TabLink({ to, label, icon, badge, external }: Tab) {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  if (external) {
    return (
      <button
        onClick={() => navigate(to, { state: { projectId: id } })}
        className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 border-transparent text-secondary hover:text-primary transition-colors"
      >
        {icon}
        {label}
      </button>
    )
  }

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
          isActive
            ? 'border-accent text-accent'
            : 'border-transparent text-secondary hover:text-primary'
        }`
      }
    >
      {icon}
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="bg-status-exceeded text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </NavLink>
  )
}

export function ProjectTabs({ role }: { role: UserRole }) {
  const totalUnread = useCommentStore((s) => s.getTotalUnread())

  const architectTabs: Tab[] = [
    { to: 'resumen', label: 'Resumen', icon: <LayoutDashboard size={16} /> },
    { to: 'presupuesto', label: 'Presupuesto', icon: <ClipboardList size={16} /> },
    { to: 'pnl', label: 'PNL', icon: <Table2 size={16} /> },
    { to: 'gastos', label: 'Gastos', icon: <Receipt size={16} /> },
    { to: 'analisis', label: 'Análisis', icon: <TrendingUp size={16} /> },
  ]

  const clientTabs: Tab[] = [
    { to: 'resumen', label: 'Resumen', icon: <LayoutDashboard size={16} /> },
    { to: 'pnl', label: 'PNL', icon: <Table2 size={16} /> },
    { to: 'mis-pagos', label: 'Mis pagos', icon: <CreditCard size={16} /> },
    { to: 'comentarios', label: 'Comentarios', icon: <MessageSquare size={16} />, badge: totalUnread },
  ]

  const tabs = role === 'arquitecto' ? architectTabs : clientTabs

  return (
    <nav className="flex overflow-x-auto scrollbar-hide border-b border-border bg-card/30">
      {tabs.map((tab) => (
        <TabLink key={tab.to} {...tab} />
      ))}
    </nav>
  )
}
