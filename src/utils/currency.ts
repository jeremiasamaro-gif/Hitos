export type CurrencyMode = 'ARS' | 'USD_BLUE'

export function convertAmount(amountArs: number, mode: CurrencyMode, rateBlue: number): number {
  if (mode === 'ARS' || !rateBlue) return amountArs
  return rateBlue > 0 ? amountArs / rateBlue : 0
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
