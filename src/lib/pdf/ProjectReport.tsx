import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { CoverPage } from './sections/CoverPage'
import { SummarySection } from './sections/SummarySection'
import { PNLSection } from './sections/PNLSection'
import { FooterNote } from './sections/FooterNote'
import { PDF_COLORS } from './pdfUtils'
import type { BudgetItem, Expense } from '@/lib/supabase'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 50,
    paddingBottom: 60,
    backgroundColor: PDF_COLORS.background,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: PDF_COLORS.text,
  },
  pageHeader: {
    position: 'absolute',
    top: 20,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageHeaderText: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: PDF_COLORS.textSecondary,
  },
  pageNumber: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: PDF_COLORS.textSecondary,
  },
})

export type ReportVariant = 'resumen' | 'pnl' | 'completo'

export interface ReportData {
  projectName: string
  address: string | null
  clientName: string
  architectName: string
  items: BudgetItem[]
  expenses: Expense[]
  totalBudget: number
  totalSpent: number
  globalProgress: number
  generatedAt: Date
}

interface ProjectReportProps {
  data: ReportData
  variant: ReportVariant
}

function PageHeader({ projectName }: { projectName: string }) {
  return (
    <View style={styles.pageHeader} fixed>
      <Text style={styles.pageHeaderText}>{projectName}</Text>
      <Text
        style={styles.pageNumber}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  )
}

export function ProjectReport({ data, variant }: ProjectReportProps) {
  const showSummary = variant === 'resumen' || variant === 'completo'
  const showPnl = variant === 'pnl' || variant === 'completo'

  return (
    <Document
      title={`${data.projectName} - Reporte`}
      author={data.architectName}
      subject="Reporte financiero de obra"
    >
      {/* Page 1: Cover */}
      <CoverPage
        projectName={data.projectName}
        address={data.address}
        clientName={data.clientName}
        architectName={data.architectName}
        generatedAt={data.generatedAt}
      />

      {/* Page 2+: Summary */}
      {showSummary && (
        <Page size="A4" style={styles.page}>
          <PageHeader projectName={data.projectName} />
          <SummarySection
            items={data.items}
            expenses={data.expenses}
            totalBudget={data.totalBudget}
            totalSpent={data.totalSpent}
            globalProgress={data.globalProgress}
          />
        </Page>
      )}

      {/* Pages: PNL detail */}
      {showPnl && (
        <Page size="A4" style={styles.page} wrap>
          <PageHeader projectName={data.projectName} />
          <PNLSection items={data.items} expenses={data.expenses} />
          <FooterNote
            architectName={data.architectName}
            generatedAt={data.generatedAt}
          />
        </Page>
      )}

      {/* Footer-only page if only summary */}
      {showSummary && !showPnl && (
        <Page size="A4" style={styles.page}>
          <PageHeader projectName={data.projectName} />
          <FooterNote
            architectName={data.architectName}
            generatedAt={data.generatedAt}
          />
        </Page>
      )}
    </Document>
  )
}
