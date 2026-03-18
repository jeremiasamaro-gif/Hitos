import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(iso: string): string {
  return format(parseISO(iso), 'd MMM yyyy', { locale: es })
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatWeek(n: number): string {
  return `Semana ${n}`
}
