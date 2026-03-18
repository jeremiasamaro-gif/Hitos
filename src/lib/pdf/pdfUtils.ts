// ============================================
// PDF UTILITY FUNCTIONS
// Pure functions — no React, no side effects
// ============================================

/**
 * Format a number as money.
 * ARS: "$ 1.234.567"
 * USD: "U$S 1.234"
 */
export function formatMoney(n: number, currency: 'ARS' | 'USD' = 'ARS'): string {
  const abs = Math.abs(n)
  const formatted = Math.round(abs)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const sign = n < 0 ? '-' : ''
  if (currency === 'USD') return `${sign}U$S ${formatted}`
  return `${sign}$ ${formatted}`
}

/**
 * Format a date as "16 de marzo de 2026"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
}

/**
 * Format a date as "DD/MM/YYYY"
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

/**
 * Format a time as "HH:MM"
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/**
 * Format percentage with sign.
 * "+14.6%" or "-8.3%" or "—"
 */
export function formatPct(n: number): string {
  if (n === 0) return '—'
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

/**
 * Get status label and color for budget vs spent comparison.
 */
export function getPDFStatus(
  gastado: number,
  presupuestado: number
): { label: string; color: string } {
  if (presupuestado <= 0) {
    return gastado > 0
      ? { label: 'Excedido', color: '#DC2626' }
      : { label: 'OK', color: '#16A34A' }
  }
  const ratio = gastado / presupuestado
  if (ratio > 1) return { label: 'Excedido', color: '#DC2626' }
  if (ratio >= 0.8) return { label: 'En riesgo', color: '#D97706' }
  return { label: 'OK', color: '#16A34A' }
}

/**
 * Sanitize a project name for use as filename.
 * "La Alejada, Cuba" → "la-alejada-cuba"
 */
export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // remove special chars
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-')             // collapse hyphens
    .replace(/^-|-$/g, '')           // trim hyphens
}

// ============================================
// PDF COLOR PALETTE
// ============================================

export const PDF_COLORS = {
  background: '#FFFFFF',
  text: '#1A1A18',
  textSecondary: '#6B6A63',
  accent: '#6366F1',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
  rowAlt: '#F7F6F1',
  border: '#E5E5E0',
} as const
