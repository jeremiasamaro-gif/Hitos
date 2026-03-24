import { NavLink } from 'react-router-dom'
import { BarChart3, Users, GitBranch, Zap, Flag, Heart } from 'lucide-react'

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: <BarChart3 size={18} />, end: true },
  { to: '/admin/usuarios', label: 'Usuarios', icon: <Users size={18} /> },
  { to: '/admin/pipeline', label: 'Pipeline', icon: <GitBranch size={18} /> },
  { to: '/admin/operaciones', label: 'Operaciones', icon: <Zap size={18} /> },
  { to: '/admin/flags', label: 'Feature Flags', icon: <Flag size={18} /> },
  { to: '/admin/health', label: 'Health Check', icon: <Heart size={18} /> },
]

export function AdminSidebar() {
  return (
    <aside className="w-56 border-r border-border bg-card/50 min-h-[calc(100vh-57px)] p-3 shrink-0 hidden md:block">
      <nav className="space-y-0.5">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-white'
                  : 'text-secondary hover:text-primary hover:bg-hover'
              }`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
