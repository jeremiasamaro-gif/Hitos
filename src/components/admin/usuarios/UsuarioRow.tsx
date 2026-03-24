import { Eye, UserCheck, Pencil } from 'lucide-react'
import type { User } from '@/lib/supabase'
import { EstadoBadge } from './EstadoBadge'
import { mockProjects, mockProjectMembers } from '@/store/mockData'

interface UsuarioRowProps {
  user: User
  onViewDetail: (user: User) => void
  onImpersonate: (user: User) => void
  onQuickEdit: (user: User) => void
}

export function UsuarioRow({ user, onViewDetail, onImpersonate, onQuickEdit }: UsuarioRowProps) {
  const projectCount = mockProjectMembers.filter((m) => m.user_id === user.id).length

  const formatDate = (d: string | null) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: '2-digit' })
  }

  const initial = user.name.charAt(0).toUpperCase()

  return (
    <tr className="border-b border-border/50 hover:bg-hover/50 transition-colors">
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-medium"
            style={{ background: user.role === 'arquitecto' ? 'var(--color-accent)' : '#10B981' }}
          >
            {initial}
          </div>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-sm text-secondary">{user.email}</td>
      <td className="px-3 py-2.5">
        <span className={`text-xs font-medium capitalize ${user.role === 'arquitecto' ? 'text-accent' : 'text-emerald-600'}`}>
          {user.role}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span className="text-xs font-medium capitalize text-secondary">{user.plan}</span>
      </td>
      <td className="px-3 py-2.5"><EstadoBadge estado={user.estado} /></td>
      <td className="px-3 py-2.5 text-xs text-secondary font-mono">{formatDate(user.created_at)}</td>
      <td className="px-3 py-2.5 text-xs text-secondary font-mono">{formatDate(user.last_sign_in)}</td>
      <td className="px-3 py-2.5 text-sm text-center">{projectCount}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <button onClick={() => onViewDetail(user)} className="p-1 text-secondary hover:text-accent transition-colors" title="Ver detalle">
            <Eye size={14} />
          </button>
          <button onClick={() => onImpersonate(user)} className="p-1 text-secondary hover:text-amber-500 transition-colors" title="Impersonar">
            <UserCheck size={14} />
          </button>
          <button onClick={() => onQuickEdit(user)} className="p-1 text-secondary hover:text-accent transition-colors" title="Editar">
            <Pencil size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}
