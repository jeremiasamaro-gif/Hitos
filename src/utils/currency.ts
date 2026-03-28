import type { Expense } from '@/lib/supabase'

export type CurrencyMode = 'ARS' | 'USD_BLUE'

export function convertAmount(amountArs: number, mode: CurrencyMode, rateBlue: number): number {
  if (mode === 'ARS' || !rateBlue) return amountArs
  return rateBlue > 0 ? Math.round((amountArs / rateBlue) * 100) / 100 : 0
}

/**
 * Convierte un gasto histórico usando el TC lockeado al momento de creación.
 * Usa expense.exchange_rate si existe, o tcBlueActual como fallback.
 * BLK-003: Los gastos deben convertirse con su TC histórico, no el global.
 */
export function convertExpenseAmount(
  expense: Expense,
  mode: CurrencyMode,
  tcBlueActual: number
): number {
  if (mode === 'ARS') return expense.amount_ars
  const tc = expense.exchange_rate ?? tcBlueActual
  return tc > 0 ? Math.round((expense.amount_ars / tc) * 100) / 100 : 0
}

export function formatCurrency(amount: number, mode: CurrencyMode): string {
  if (mode === 'ARS') {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return `US$ ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

export function formatCompact(amount: number, mode: CurrencyMode): string {
  const prefix = mode === 'ARS' ? '$' : 'US$'
  if (Math.abs(amount) >= 1_000_000) {
    return `${prefix} ${(amount / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(amount) >= 1_000) {
    return `${prefix} ${(amount / 1_000).toFixed(0)}k`
  }
  return `${prefix} ${amount.toFixed(0)}`
}
