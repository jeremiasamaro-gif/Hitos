import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { formatMoney, getPDFStatus, PDF_COLORS } from '../pdfUtils'
import type { BudgetItem, Expense } from '@/lib/supabase'

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: PDF_COLORS.text,
    marginBottom: 12,
    paddingBottom: 4,
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.accent,
  },
  // KPI grid
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  kpiBox: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: PDF_COLORS.border,
    borderRadius: 4,
  },
  kpiLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: PDF_COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  kpiValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: PDF_COLORS.text,
  },
  kpiSub: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: PDF_COLORS.textSecondary,
    marginTop: 2,
  },
  // Category table
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.text,
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
  },
  tableRowAlt: {
    backgroundColor: PDF_COLORS.rowAlt,
  },
  colCategory: { flex: 3 },
  colAmount: { flex: 2, textAlign: 'right' as const },
  colDiff: { flex: 2, textAlign: 'right' as const },
  colStatus: { flex: 1, textAlign: 'center' as const },
  headerText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: PDF_COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  cellText: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: PDF_COLORS.text,
  },
  cellMono: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: PDF_COLORS.text,
    textAlign: 'right' as const,
  },
  statusBadge: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    textAlign: 'center' as const,
  },
  // Alerts
  alertItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    marginTop: 3,
  },
  alertText: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: PDF_COLORS.text,
    flex: 1,
  },
})

interface SummarySectionProps {
  items: BudgetItem[]
  expenses: Expense[]
  totalBudget: number
  totalSpent: number
  globalProgress: number
}

interface CategoryRow {
  name: string
  budgeted: number
  spent: number
  diff: number
  status: { label: string; color: string }
}

export function SummarySection({ items, expenses, totalBudget, totalSpent, globalProgress }: SummarySectionProps) {
  const balance = totalBudget - totalSpent

  // Build category rows
  const parents = items.filter((i) => !i.parent_id)
  const childrenMap = new Map<string, BudgetItem[]>()
  for (const item of items) {
    if (item.parent_id) {
      const arr = childrenMap.get(item.parent_id) || []
      arr.push(item)
      childrenMap.set(item.parent_id, arr)
    }
  }

  const spentByItem = new Map<string, number>()
  for (const e of expenses) {
    if (e.budget_item_id) {
      spentByItem.set(e.budget_item_id, (spentByItem.get(e.budget_item_id) || 0) + e.amount_ars)
    }
  }

  const categories: CategoryRow[] = parents.map((p) => {
    const children = childrenMap.get(p.id) || []
    let spent = spentByItem.get(p.id) || 0
    for (const c of children) spent += spentByItem.get(c.id) || 0
    const diff = p.total_price - spent
    return {
      name: p.description,
      budgeted: p.total_price,
      spent,
      diff,
      status: getPDFStatus(spent, p.total_price),
    }
  })

  const exceeded = categories.filter((c) => c.status.label === 'Excedido')
  const inactive = categories.filter((c) => c.spent === 0)

  return (
    <View>
      {/* KPIs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del proyecto</Text>
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Presupuesto total</Text>
            <Text style={styles.kpiValue}>{formatMoney(totalBudget)}</Text>
            <Text style={styles.kpiSub}>100% del proyecto</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Total gastado</Text>
            <Text style={styles.kpiValue}>{formatMoney(totalSpent)}</Text>
            <Text style={styles.kpiSub}>{globalProgress.toFixed(1)}% ejecutado</Text>
          </View>
        </View>
        <View style={styles.kpiRow}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Saldo disponible</Text>
            <Text style={[styles.kpiValue, { color: balance >= 0 ? PDF_COLORS.success : PDF_COLORS.danger }]}>
              {formatMoney(balance)}
            </Text>
            <Text style={styles.kpiSub}>{(100 - globalProgress).toFixed(1)}% restante</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>% Ejecutado</Text>
            <Text style={styles.kpiValue}>{globalProgress.toFixed(1)}%</Text>
            <Text style={styles.kpiSub}>del presupuesto total</Text>
          </View>
        </View>
      </View>

      {/* Category breakdown table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribucion por categoria</Text>
        {/* Header */}
        <View style={styles.tableHeader}>
          <View style={styles.colCategory}><Text style={styles.headerText}>Categoria</Text></View>
          <View style={styles.colAmount}><Text style={[styles.headerText, { textAlign: 'right' }]}>Presupuestado</Text></View>
          <View style={styles.colAmount}><Text style={[styles.headerText, { textAlign: 'right' }]}>Gastado</Text></View>
          <View style={styles.colDiff}><Text style={[styles.headerText, { textAlign: 'right' }]}>Diferencia</Text></View>
          <View style={styles.colStatus}><Text style={styles.headerText}>Estado</Text></View>
        </View>
        {/* Rows */}
        {categories.map((cat, i) => (
          <View key={cat.name} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]} wrap={false}>
            <View style={styles.colCategory}><Text style={styles.cellText}>{cat.name}</Text></View>
            <View style={styles.colAmount}><Text style={styles.cellMono}>{formatMoney(cat.budgeted)}</Text></View>
            <View style={styles.colAmount}><Text style={styles.cellMono}>{formatMoney(cat.spent)}</Text></View>
            <View style={styles.colDiff}>
              <Text style={[styles.cellMono, { color: cat.diff >= 0 ? PDF_COLORS.success : PDF_COLORS.danger }]}>
                {formatMoney(cat.diff)}
              </Text>
            </View>
            <View style={styles.colStatus}>
              <Text style={[styles.statusBadge, { color: cat.status.color }]}>{cat.status.label}</Text>
            </View>
          </View>
        ))}
        {/* Total row */}
        <View style={[styles.tableRow, { borderTopWidth: 1, borderTopColor: PDF_COLORS.text, marginTop: 2 }]} wrap={false}>
          <View style={styles.colCategory}><Text style={[styles.cellText, { fontFamily: 'Helvetica-Bold' }]}>TOTAL</Text></View>
          <View style={styles.colAmount}><Text style={[styles.cellMono, { fontFamily: 'Helvetica-Bold' }]}>{formatMoney(totalBudget)}</Text></View>
          <View style={styles.colAmount}><Text style={[styles.cellMono, { fontFamily: 'Helvetica-Bold' }]}>{formatMoney(totalSpent)}</Text></View>
          <View style={styles.colDiff}>
            <Text style={[styles.cellMono, { fontFamily: 'Helvetica-Bold', color: balance >= 0 ? PDF_COLORS.success : PDF_COLORS.danger }]}>
              {formatMoney(balance)}
            </Text>
          </View>
          <View style={styles.colStatus} />
        </View>
      </View>

      {/* Alerts */}
      {(exceeded.length > 0 || inactive.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas</Text>
          {exceeded.map((cat) => (
            <View key={`exc-${cat.name}`} style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: PDF_COLORS.danger }]} />
              <Text style={styles.alertText}>
                {cat.name}: excedido en {formatMoney(Math.abs(cat.diff))}
              </Text>
            </View>
          ))}
          {inactive.map((cat) => (
            <View key={`ina-${cat.name}`} style={styles.alertItem}>
              <View style={[styles.alertDot, { backgroundColor: PDF_COLORS.textSecondary }]} />
              <Text style={styles.alertText}>
                {cat.name}: sin movimiento registrado
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
