import { KpiCards } from './KpiCards'
import { ProgressBar } from './ProgressBar'
import { BudgetVsSpentChart } from './BudgetVsSpentChart'
import { ExpenseDistributionChart } from './ExpenseDistributionChart'
import { MonthlySpendingChart } from './MonthlySpendingChart'
import { AlertCards } from './AlertCards'
import { ExportPDFButton } from '@/components/ui/ExportPDFButton'
import { TimelineSection } from '@/components/project/TimelineSection'

export function DashboardPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold">Resumen</h1>
        <ExportPDFButton variant="completo" />
      </div>
      <KpiCards />
      <ProgressBar />
      <TimelineSection />
      <div className="grid lg:grid-cols-2 gap-4 mt-6">
        <BudgetVsSpentChart />
        <MonthlySpendingChart />
      </div>
      <div className="mt-4">
        <ExpenseDistributionChart />
      </div>
      <AlertCards />
    </div>
  )
}
