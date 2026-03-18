import { View, Text, StyleSheet } from '@react-pdf/renderer'
import { formatMoney, formatPct, getPDFStatus, PDF_COLORS } from '../pdfUtils'
import type { BudgetItem, Expense } from '@/lib/supabase'

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
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
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.text,
    paddingBottom: 4,
    marginBottom: 2,
  },
  headerText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    color: PDF_COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  // Category row
  categoryRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    backgroundColor: PDF_COLORS.rowAlt,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
  },
  categoryText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: PDF_COLORS.text,
    textTransform: 'uppercase',
  },
  // Child row
  childRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: PDF_COLORS.border,
  },
  childText: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: PDF_COLORS.textSecondary,
  },
  // Columns
  colCode: { width: 30, paddingLeft: 4 },
  colDesc: { flex: 3 },
  colBudget: { flex: 2, textAlign: 'right' as const },
  colSpent: { flex: 2, textAlign: 'right' as const },
  colDiff: { flex: 2, textAlign: 'right' as const },
  colPct: { width: 45, textAlign: 'right' as const },
  // Cell styles
  cellMono: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: PDF_COLORS.text,
    textAlign: 'right' as const,
  },
  cellMonoBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: PDF_COLORS.text,
    textAlign: 'right' as const,
  },
  cellCode: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: PDF_COLORS.textSecondary,
  },
  statusText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textAlign: 'right' as const,
  },
  // Total row
  totalRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderTopWidth: 1.5,
    borderTopColor: PDF_COLORS.text,
    marginTop: 2,
  },
  totalText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: PDF_COLORS.text,
  },
})

interface PNLSectionProps {
  items: BudgetItem[]
  expenses: Expense[]
}

interface PnlCategoryData {
  parent: BudgetItem
  children: BudgetItem[]
  budgeted: number
  spent: number
  diff: number
  pct: number
  status: { label: string; color: string }
  childRows: {
    item: BudgetItem
    budgeted: number
    spent: number
    diff: number
    pct: number
    status: { label: string; color: string }
  }[]
}

export function PNLSection({ items, expenses }: PNLSectionProps) {
  // Compute spent by item
  const spentByItem = new Map<string, number>()
  for (const e of expenses) {
    if (e.budget_item_id) {
      spentByItem.set(e.budget_item_id, (spentByItem.get(e.budget_item_id) || 0) + e.amount_ars)
    }
  }

  // Build hierarchy
  const parents = items.filter((i) => !i.parent_id)
  const childrenMap = new Map<string, BudgetItem[]>()
  for (const item of items) {
    if (item.parent_id) {
      const arr = childrenMap.get(item.parent_id) || []
      arr.push(item)
      childrenMap.set(item.parent_id, arr)
    }
  }

  // Sort parents by item_code
  parents.sort((a, b) => (a.item_code || '').localeCompare(b.item_code || '', undefined, { numeric: true }))

  const categories: PnlCategoryData[] = parents.map((parent) => {
    const children = (childrenMap.get(parent.id) || []).sort((a, b) =>
      (a.item_code || '').localeCompare(b.item_code || '', undefined, { numeric: true })
    )

    const childRows = children.map((child) => {
      const budgeted = child.total_price
      const spent = spentByItem.get(child.id) || 0
      const diff = budgeted - spent
      const pct = budgeted > 0 ? (spent / budgeted) * 100 : spent > 0 ? 100 : 0
      return { item: child, budgeted, spent, diff, pct, status: getPDFStatus(spent, budgeted) }
    })

    let totalSpent = spentByItem.get(parent.id) || 0
    for (const c of children) totalSpent += spentByItem.get(c.id) || 0
    const diff = parent.total_price - totalSpent
    const pct = parent.total_price > 0 ? (totalSpent / parent.total_price) * 100 : totalSpent > 0 ? 100 : 0

    return {
      parent,
      children,
      budgeted: parent.total_price,
      spent: totalSpent,
      diff,
      pct,
      status: getPDFStatus(totalSpent, parent.total_price),
      childRows,
    }
  })

  const grandBudget = categories.reduce((s, c) => s + c.budgeted, 0)
  const grandSpent = categories.reduce((s, c) => s + c.spent, 0)
  const grandDiff = grandBudget - grandSpent
  const grandPct = grandBudget > 0 ? (grandSpent / grandBudget) * 100 : 0

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>PNL Detallado</Text>

      {/* Table header */}
      <View style={styles.tableHeader}>
        <View style={styles.colCode}><Text style={styles.headerText}>Cod.</Text></View>
        <View style={styles.colDesc}><Text style={styles.headerText}>Descripcion</Text></View>
        <View style={styles.colBudget}><Text style={[styles.headerText, { textAlign: 'right' }]}>Presupuestado</Text></View>
        <View style={styles.colSpent}><Text style={[styles.headerText, { textAlign: 'right' }]}>Gastado</Text></View>
        <View style={styles.colDiff}><Text style={[styles.headerText, { textAlign: 'right' }]}>Diferencia</Text></View>
        <View style={styles.colPct}><Text style={[styles.headerText, { textAlign: 'right' }]}>%</Text></View>
      </View>

      {/* Category rows */}
      {categories.map((cat) => (
        <View key={cat.parent.id}>
          {/* Parent row */}
          <View style={styles.categoryRow} wrap={false}>
            <View style={styles.colCode}><Text style={styles.cellCode}>{cat.parent.item_code}</Text></View>
            <View style={styles.colDesc}><Text style={styles.categoryText}>{cat.parent.description}</Text></View>
            <View style={styles.colBudget}><Text style={styles.cellMonoBold}>{formatMoney(cat.budgeted)}</Text></View>
            <View style={styles.colSpent}><Text style={styles.cellMonoBold}>{formatMoney(cat.spent)}</Text></View>
            <View style={styles.colDiff}>
              <Text style={[styles.cellMonoBold, { color: cat.diff >= 0 ? PDF_COLORS.success : PDF_COLORS.danger }]}>
                {formatMoney(cat.diff)}
              </Text>
            </View>
            <View style={styles.colPct}>
              <Text style={[styles.statusText, { color: cat.status.color }]}>{cat.status.label}</Text>
            </View>
          </View>

          {/* Child rows */}
          {cat.childRows.map((child) => (
            <View key={child.item.id} style={styles.childRow} wrap={false}>
              <View style={styles.colCode}><Text style={styles.cellCode}>{child.item.item_code}</Text></View>
              <View style={[styles.colDesc, { paddingLeft: 12 }]}><Text style={styles.childText}>{child.item.description}</Text></View>
              <View style={styles.colBudget}><Text style={styles.cellMono}>{formatMoney(child.budgeted)}</Text></View>
              <View style={styles.colSpent}><Text style={styles.cellMono}>{formatMoney(child.spent)}</Text></View>
              <View style={styles.colDiff}>
                <Text style={[styles.cellMono, { color: child.diff >= 0 ? PDF_COLORS.success : PDF_COLORS.danger }]}>
                  {formatMoney(child.diff)}
                </Text>
              </View>
              <View style={styles.colPct}>
                <Text style={[styles.cellMono, { fontSize: 7 }]}>{formatPct(child.pct)}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}

      {/* Grand total */}
      <View style={styles.totalRow} wrap={false}>
        <View style={styles.colCode} />
        <View style={styles.colDesc}><Text style={styles.totalText}>TOTAL GENERAL</Text></View>
        <View style={styles.colBudget}><Text style={styles.cellMonoBold}>{formatMoney(grandBudget)}</Text></View>
        <View style={styles.colSpent}><Text style={styles.cellMonoBold}>{formatMoney(grandSpent)}</Text></View>
        <View style={styles.colDiff}>
          <Text style={[styles.cellMonoBold, { color: grandDiff >= 0 ? PDF_COLORS.success : PDF_COLORS.danger }]}>
            {formatMoney(grandDiff)}
          </Text>
        </View>
        <View style={styles.colPct}>
          <Text style={styles.cellMonoBold}>{formatPct(grandPct)}</Text>
        </View>
      </View>
    </View>
  )
}
