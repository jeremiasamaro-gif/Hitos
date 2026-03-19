import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { getExceededItems, getSavingItems, getProjectProjection } from '@/lib/analysis'
import { DeviationsByCategory } from './DeviationsByCategory'
import { HealthyItemsSection } from './HealthyItemsSection'
import { ProjectionCard } from './ProjectionCard'
import { ProgressComparativa } from './ProgressComparativa'
import { DesfasajesSection } from './DesfasajesSection'
import { SimuladorEscenarios } from './SimuladorEscenarios'
import { ProximosVencimientos } from './ProximosVencimientos'

export function AnalysisPage() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { globalProgress, totalBudget, totalSpent } = useProjectContext()

  const exceededItems = getExceededItems(items, expenses)
  const savingItems = getSavingItems(items, expenses, globalProgress)
  const projection = getProjectProjection(expenses, totalBudget, totalSpent)

  return (
    <div>
      <h1 className="text-xl font-heading font-bold mb-6">Analisis de Proyecto</h1>

      {/* New: Progress comparativa */}
      <section className="mb-8">
        <ProgressComparativa />
      </section>

      {/* New: Desfasajes with filter */}
      <section className="mb-8">
        <DesfasajesSection />
      </section>

      {/* Original: Desfasajes por categoria */}
      <section className="mb-8">
        <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-4">
          Desfasajes por Categoria ({exceededItems.length})
        </h2>
        <DeviationsByCategory exceededItems={exceededItems} />
      </section>

      {/* Original: Rubros saludables */}
      <section className="mb-8">
        <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-4">
          Rubros Saludables ({savingItems.length})
        </h2>
        <HealthyItemsSection savingItems={savingItems} />
      </section>

      {/* New: Simulador */}
      <section className="mb-8">
        <SimuladorEscenarios />
      </section>

      {/* New: Proximos vencimientos */}
      <section className="mb-8">
        <ProximosVencimientos />
      </section>

      {/* Original: Proyeccion */}
      <section>
        <ProjectionCard projection={projection} totalBudget={totalBudget} />
      </section>
    </div>
  )
}
