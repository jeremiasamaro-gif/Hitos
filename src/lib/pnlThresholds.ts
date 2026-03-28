/**
 * CRT-009: Fuente única de verdad para thresholds de semáforo PNL.
 * Todos los archivos que evalúan status de gastos deben importar de acá.
 */

export const PNL_THRESHOLDS = {
  AT_RISK: 0.8,  // >= este valor → En riesgo
  EXCEEDED: 1.0, // > este valor → Excedido
} as const

export type PnlStatus = 'ok' | 'at_risk' | 'exceeded'

export function getPnlStatus(spent: number, budgeted: number): PnlStatus {
  if (budgeted <= 0) return spent > 0 ? 'exceeded' : 'ok'
  const ratio = spent / budgeted
  if (ratio > PNL_THRESHOLDS.EXCEEDED) return 'exceeded'
  if (ratio >= PNL_THRESHOLDS.AT_RISK) return 'at_risk'
  return 'ok'
}

export const PNL_STATUS_CONFIG: Record<PnlStatus, { label: string; color: string; bgColor: string }> = {
  ok: { label: 'OK', color: '#16A34A', bgColor: '#F0FDF4' },
  at_risk: { label: 'En riesgo', color: '#D97706', bgColor: '#FFFBEB' },
  exceeded: { label: 'Excedido', color: '#DC2626', bgColor: '#FEF2F2' },
}
