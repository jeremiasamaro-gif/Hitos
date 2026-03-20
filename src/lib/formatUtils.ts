/**
 * Format a number in compact form for display in cards.
 *
 * >= 1.000.000.000  → "$X.Xb"
 * >= 1.000.000      → "$XXX.Xm" or "$X.Xm"
 * < 1.000.000       → "$XXX.XXX"
 */
export function formatCompact(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''

  if (abs >= 1_000_000_000) {
    const val = abs / 1_000_000_000
    return `${sign}$${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}b`
  }
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000
    return `${sign}$${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}m`
  }
  // Format with dots as thousands separator
  return `${sign}$${Math.round(abs).toLocaleString('es-AR')}`
}

/**
 * Calculate the week number of a construction project
 * given its start date.
 *
 * - If startDate is in the future → returns 0
 * - If today or past → returns the current week (minimum 1)
 */
/**
 * Returns Tailwind classes for color-coded payment method badges
 */
export function getPaymentMethodStyle(method: string | null): { bg: string; text: string } {
  switch ((method || '').toLowerCase()) {
    case 'transferencia':
      return { bg: 'bg-indigo-500/15', text: 'text-indigo-400' }
    case 'efectivo':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400' }
    case 'cheque':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400' }
    case 'tarjeta':
      return { bg: 'bg-sky-500/15', text: 'text-sky-400' }
    default:
      return { bg: 'bg-zinc-500/15', text: 'text-zinc-400' }
  }
}

export function getWeekNumber(startDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const now = new Date()

  // Strip time for a clean day comparison
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffMs = today.getTime() - startDay.getTime()
  if (diffMs < 0) return 0

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.ceil((diffDays + 1) / 7))
}
