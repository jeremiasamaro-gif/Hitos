import type { BudgetItem, Expense } from '@/lib/supabase'

export type PnlStatus = 'ok' | 'at_risk' | 'exceeded'

export interface PnlRow {
  item: BudgetItem
  budgeted: number
  spent: number
  difference: number
  percentage: number
  status: PnlStatus
  children?: PnlRow[]
}

function getStatus(spent: number, budgeted: number): PnlStatus {
  if (budgeted <= 0) return spent > 0 ? 'exceeded' : 'ok'
  const ratio = spent / budgeted
  if (ratio > 1) return 'exceeded'
  if (ratio > 0.8) return 'at_risk'
  return 'ok'
}

function worstStatus(statuses: PnlStatus[]): PnlStatus {
  if (statuses.includes('exceeded')) return 'exceeded'
  if (statuses.includes('at_risk')) return 'at_risk'
  return 'ok'
}

export function calculatePnlRows(
  items: BudgetItem[],
  expenses: Expense[],
  convert: (ars: number) => number
): PnlRow[] {
  const spentByItem = new Map<string, number>()
  for (const exp of expenses) {
    if (exp.budget_item_id) {
      spentByItem.set(exp.budget_item_id, (spentByItem.get(exp.budget_item_id) || 0) + exp.amount_ars)
    }
  }

  const parents = items.filter((i) => !i.parent_id)
  const childrenMap = new Map<string, BudgetItem[]>()
  for (const item of items) {
    if (item.parent_id) {
      const list = childrenMap.get(item.parent_id) || []
      list.push(item)
      childrenMap.set(item.parent_id, list)
    }
  }

  // Sum spent for parent: include direct expenses on parent + all children
  function getSpentForParent(parentId: string): number {
    let total = spentByItem.get(parentId) || 0
    const children = childrenMap.get(parentId) || []
    for (const child of children) {
      total += spentByItem.get(child.id) || 0
    }
    return total
  }

  return parents.map((parent) => {
    const children = childrenMap.get(parent.id) || []
    const childRows: PnlRow[] = children.map((child) => {
      const budgeted = convert(child.total_price)
      const spent = convert(spentByItem.get(child.id) || 0)
      const difference = budgeted - spent
      const percentage = budgeted > 0 ? (spent / budgeted) * 100 : spent > 0 ? 100 : 0
      return {
        item: child,
        budgeted,
        spent,
        difference,
        percentage,
        status: getStatus(spent, budgeted),
      }
    })

    const budgeted = convert(parent.total_price)
    const spent = convert(getSpentForParent(parent.id))
    const difference = budgeted - spent
    const percentage = budgeted > 0 ? (spent / budgeted) * 100 : spent > 0 ? 100 : 0

    return {
      item: parent,
      budgeted,
      spent,
      difference,
      percentage,
      status: childRows.length > 0 ? worstStatus(childRows.map((c) => c.status)) : getStatus(spent, budgeted),
      children: childRows,
    }
  })
}

export function getDeviations(rows: PnlRow[]): PnlRow[] {
  return rows.filter((r) => r.status === 'exceeded' || r.status === 'at_risk')
}

export function getSavings(rows: PnlRow[]): PnlRow[] {
  return rows.filter((r) => r.budgeted > 0 && r.percentage < 80)
}
