import type { BudgetItem, Expense } from '@/lib/supabase'
import { getPnlStatus, type PnlStatus } from '@/lib/pnlThresholds'
import type { CurrencyMode } from '@/utils/currency'

// CRT-009: Re-export type for consumers (StatusBadge etc.)
export type { PnlStatus }

export interface PnlRow {
  item: BudgetItem
  budgeted: number
  spent: number
  difference: number
  percentage: number
  status: PnlStatus
  children?: PnlRow[]
}

// CRT-009: Delegated to centralized pnlThresholds.ts
const getStatus = getPnlStatus

function worstStatus(statuses: PnlStatus[]): PnlStatus {
  if (statuses.includes('exceeded')) return 'exceeded'
  if (statuses.includes('at_risk')) return 'at_risk'
  return 'ok'
}

export function calculatePnlRows(
  items: BudgetItem[],
  expenses: Expense[],
  convert: (ars: number) => number,
  currencyMode?: CurrencyMode
): PnlRow[] {
  // BLK-102: Acumular ARS y USD histórico por separado.
  // En modo USD se usa usdByItem (TC del momento de cada gasto),
  // no convert(totalARS) que usaría el TC actual.
  const spentByItem = new Map<string, number>()
  const usdByItem = new Map<string, number>()
  for (const exp of expenses) {
    if (exp.budget_item_id) {
      spentByItem.set(exp.budget_item_id, (spentByItem.get(exp.budget_item_id) || 0) + exp.amount_ars)
      const usd =
        exp.amount_usd !== undefined && exp.amount_usd > 0
          ? exp.amount_usd
          : exp.exchange_rate && exp.exchange_rate > 0
            ? exp.amount_ars / exp.exchange_rate
            : 0
      usdByItem.set(exp.budget_item_id, (usdByItem.get(exp.budget_item_id) || 0) + usd)
    }
  }

  const isUsd = currencyMode === 'USD_BLUE'

  // Helper: spent en la moneda correcta, usando TC histórico en USD
  const getSpent = (itemId: string): number => {
    if (isUsd) return Math.round((usdByItem.get(itemId) || 0) * 100) / 100
    return spentByItem.get(itemId) || 0
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
    let total = getSpent(parentId)
    const children = childrenMap.get(parentId) || []
    for (const child of children) {
      total += getSpent(child.id)
    }
    return total
  }

  return parents.map((parent) => {
    const children = childrenMap.get(parent.id) || []
    const childRows: PnlRow[] = children.map((child) => {
      const budgeted = convert(child.total_price)
      // BLK-102: usar getSpent() que respeta TC histórico en modo USD
      const spent = getSpent(child.id)
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
    const spent = getSpentForParent(parent.id)
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
