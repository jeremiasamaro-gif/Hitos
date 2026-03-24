import type { User } from '@/lib/supabase'
import { EstadoBadge } from '../usuarios/EstadoBadge'

interface PipelineCardProps {
  user: User
  onClick: (user: User) => void
}

export function PipelineCard({ user, onClick }: PipelineCardProps) {
  const initial = user.name.charAt(0).toUpperCase()

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })

  return (
    <div
      onClick={() => onClick(user)}
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-sm hover:border-border-strong transition-all"
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
          style={{ background: user.role === 'arquitecto' ? 'var(--color-accent)' : '#10B981' }}
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{user.name}</p>
          <p className="text-[10px] text-secondary truncate">{user.email}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-medium capitalize ${user.role === 'arquitecto' ? 'text-accent' : 'text-emerald-600'}`}>
          {user.role}
        </span>
        <span className="text-[10px] text-secondary capitalize">{user.plan}</span>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <EstadoBadge estado={user.estado} />
        <span className="text-[10px] text-muted font-mono">{formatDate(user.created_at)}</span>
      </div>
    </div>
  )
}
