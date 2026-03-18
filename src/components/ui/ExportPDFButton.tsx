import { useMemo } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { mockUsers, mockProjectMembers } from '@/store/mockData'
import { ProjectReport, type ReportVariant, type ReportData } from '@/lib/pdf/ProjectReport'
import { sanitizeFileName } from '@/lib/pdf/pdfUtils'

interface ExportPDFButtonProps {
  variant: ReportVariant
  label?: string
}

export function ExportPDFButton({ variant, label = 'Exportar PDF' }: ExportPDFButtonProps) {
  const ctx = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)

  // Guard: must be inside a project
  if (!ctx?.project) return null

  const { project, totalBudget, totalSpent, globalProgress } = ctx

  const reportData = useMemo<ReportData>(() => {
    // Find client and architect names
    const members = mockProjectMembers.filter((m) => m.project_id === project.id)
    const clientMember = members.find((m) => m.role === 'cliente')
    const architectMember = members.find((m) => m.role === 'arquitecto')
    const clientUser = clientMember ? mockUsers.find((u) => u.id === clientMember.user_id) : null
    const architectUser = architectMember ? mockUsers.find((u) => u.id === architectMember.user_id) : null

    return {
      projectName: project.name,
      address: project.address,
      clientName: clientUser?.name || 'Cliente',
      architectName: architectUser?.name || 'Arquitecto',
      items,
      expenses,
      totalBudget,
      totalSpent,
      globalProgress,
      generatedAt: new Date(),
    }
  }, [project, items, expenses, totalBudget, totalSpent, globalProgress])

  const fileName = useMemo(() => {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, '0')
    const dd = String(today.getDate()).padStart(2, '0')
    return `${sanitizeFileName(project.name)}-reporte-${yyyy}-${mm}-${dd}.pdf`
  }, [project.name])

  return (
    <PDFDownloadLink
      document={<ProjectReport data={reportData} variant={variant} />}
      fileName={fileName}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-card border border-border hover:bg-hover text-primary transition-colors cursor-pointer"
    >
      {({ loading }) => (
        <>
          {/* Download icon (inline SVG) */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {loading ? 'Generando...' : label}
        </>
      )}
    </PDFDownloadLink>
  )
}
