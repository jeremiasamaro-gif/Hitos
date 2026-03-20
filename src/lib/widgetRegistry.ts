export interface WidgetDef {
  id: string
  label: string
  defaultVisible: boolean
  minWidth: 'half' | 'full'
}

export const WIDGET_REGISTRY: WidgetDef[] = [
  { id: 'kpi', label: 'KPIs', defaultVisible: true, minWidth: 'full' },
  { id: 'progress', label: 'Progreso', defaultVisible: true, minWidth: 'full' },
  { id: 'timeline', label: 'Timeline', defaultVisible: true, minWidth: 'full' },
  { id: 'budgetVsSpent', label: 'Presupuesto vs Gastado', defaultVisible: true, minWidth: 'half' },
  { id: 'monthlySpending', label: 'Gasto Mensual', defaultVisible: true, minWidth: 'half' },
  { id: 'expenseDistribution', label: 'Distribucion de Gastos', defaultVisible: true, minWidth: 'full' },
  { id: 'alerts', label: 'Alertas', defaultVisible: true, minWidth: 'full' },
]

export function getDefaultLayout(): string[] {
  return WIDGET_REGISTRY.filter((w) => w.defaultVisible).map((w) => w.id)
}
