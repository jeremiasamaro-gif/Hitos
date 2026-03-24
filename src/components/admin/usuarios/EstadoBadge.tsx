import type { UserEstado } from '@/lib/supabase'

const BADGE_STYLES: Record<UserEstado, { bg: string; text: string }> = {
  activo: { bg: '#DCFCE7', text: '#16A34A' },
  trial: { bg: '#DBEAFE', text: '#2563EB' },
  vip: { bg: '#FEF3C7', text: '#D97706' },
  suspendido: { bg: '#FEE2E2', text: '#DC2626' },
  churned: { bg: '#F3F4F6', text: '#6B7280' },
}

interface EstadoBadgeProps {
  estado: UserEstado
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const style = BADGE_STYLES[estado]
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {estado}
    </span>
  )
}
