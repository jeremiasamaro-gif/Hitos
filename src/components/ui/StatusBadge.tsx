import type { PnlStatus } from '@/utils/pnlCalculations'

const config: Record<PnlStatus, { label: string; color: string; bg: string }> = {
  ok: { label: 'OK', color: 'text-status-ok', bg: 'bg-status-ok/10' },
  at_risk: { label: 'En riesgo', color: 'text-status-warning', bg: 'bg-status-warning/10' },
  exceeded: { label: 'Excedido', color: 'text-status-exceeded', bg: 'bg-status-exceeded/10' },
}

export function StatusBadge({ status }: { status: PnlStatus }) {
  const c = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${c.color} ${c.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'ok' ? 'bg-status-ok' : status === 'at_risk' ? 'bg-status-warning' : 'bg-status-exceeded'}`} />
      {c.label}
    </span>
  )
}
