export type WidgetSection = 'resumen' | 'pnl' | 'gastos' | 'presupuesto' | 'analisis'

export interface WidgetDef {
  id: string
  label: string
  section: WidgetSection
  defaultVisible: boolean
  defaultOrder: number
  minWidth: 'half' | 'full'
}

export const WIDGET_REGISTRY: WidgetDef[] = [
  // Resumen
  { id: 'kpi', label: 'KPIs', section: 'resumen', defaultVisible: true, defaultOrder: 0, minWidth: 'full' },
  { id: 'progress', label: 'Progreso', section: 'resumen', defaultVisible: true, defaultOrder: 1, minWidth: 'full' },
  { id: 'timeline', label: 'Timeline', section: 'resumen', defaultVisible: true, defaultOrder: 2, minWidth: 'full' },
  { id: 'budgetVsSpent', label: 'Presupuesto vs Gastado', section: 'resumen', defaultVisible: true, defaultOrder: 3, minWidth: 'half' },
  { id: 'monthlySpending', label: 'Gasto Mensual', section: 'resumen', defaultVisible: true, defaultOrder: 4, minWidth: 'half' },
  { id: 'expenseDistribution', label: 'Distribucion de Gastos', section: 'resumen', defaultVisible: true, defaultOrder: 5, minWidth: 'full' },
  { id: 'alerts', label: 'Alertas', section: 'resumen', defaultVisible: true, defaultOrder: 6, minWidth: 'full' },
  // PNL
  { id: 'pnl_period_selector', label: 'Selector de período', section: 'pnl', defaultVisible: true, defaultOrder: 0, minWidth: 'full' },
  { id: 'pnl_table', label: 'Tabla PNL', section: 'pnl', defaultVisible: true, defaultOrder: 1, minWidth: 'full' },
  // Gastos
  { id: 'gastos_filters', label: 'Filtros', section: 'gastos', defaultVisible: true, defaultOrder: 0, minWidth: 'full' },
  { id: 'gastos_table', label: 'Tabla de gastos', section: 'gastos', defaultVisible: true, defaultOrder: 1, minWidth: 'full' },
  { id: 'gastos_footer', label: 'Totales y resumen', section: 'gastos', defaultVisible: true, defaultOrder: 2, minWidth: 'full' },
  // Presupuesto
  { id: 'presupuesto_table', label: 'Tabla de presupuesto', section: 'presupuesto', defaultVisible: true, defaultOrder: 0, minWidth: 'full' },
  // Análisis
  { id: 'progress_comparativa', label: 'Avance físico vs financiero', section: 'analisis', defaultVisible: true, defaultOrder: 0, minWidth: 'full' },
  { id: 'desfasajes', label: 'Desfasajes', section: 'analisis', defaultVisible: true, defaultOrder: 1, minWidth: 'full' },
  { id: 'desfasajes_categoria', label: 'Desfasajes por Categoría', section: 'analisis', defaultVisible: true, defaultOrder: 2, minWidth: 'full' },
  { id: 'rubros_saludables', label: 'Rubros Saludables', section: 'analisis', defaultVisible: true, defaultOrder: 3, minWidth: 'full' },
  { id: 'simulador', label: 'Simulador de escenarios', section: 'analisis', defaultVisible: true, defaultOrder: 4, minWidth: 'full' },
  { id: 'proximos_vencimientos', label: 'Próximos vencimientos', section: 'analisis', defaultVisible: true, defaultOrder: 5, minWidth: 'full' },
  { id: 'proyeccion', label: 'Proyección del proyecto', section: 'analisis', defaultVisible: true, defaultOrder: 6, minWidth: 'full' },
]

export function getWidgetsForSection(section: WidgetSection): WidgetDef[] {
  return WIDGET_REGISTRY.filter((w) => w.section === section)
}

export function getDefaultLayout(section?: WidgetSection): string[] {
  const widgets = section
    ? getWidgetsForSection(section)
    : WIDGET_REGISTRY.filter((w) => w.section === 'resumen')
  return widgets
    .filter((w) => w.defaultVisible)
    .sort((a, b) => a.defaultOrder - b.defaultOrder)
    .map((w) => w.id)
}
