import { create } from 'zustand'
import type { Expense } from '@/lib/supabase'
import { mockExpenses } from './mockData'
import { useCurrencyStore } from './currencyStore'
import { assertNotImpersonating } from '@/lib/api/impersonationGuard'

interface ExpenseFilters {
  budgetItemId?: string
  weekNumber?: number
  provider?: string
}

interface ExpenseState {
  expenses: Expense[]
  loading: boolean
  filters: ExpenseFilters
  fetchExpenses: (projectId: string) => Promise<void>
  createExpense: (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
  setFilters: (filters: ExpenseFilters) => void
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  loading: false,
  filters: {},

  fetchExpenses: async (projectId) => {
    set({ loading: true })
    await new Promise((r) => setTimeout(r, 150))
    const { filters } = get()
    let expenses = mockExpenses.filter((e) => e.project_id === projectId)
    if (filters.budgetItemId) {
      expenses = expenses.filter((e) => e.budget_item_id === filters.budgetItemId)
    }
    if (filters.weekNumber) {
      expenses = expenses.filter((e) => e.week_number === filters.weekNumber)
    }
    if (filters.provider) {
      expenses = expenses.filter((e) =>
        e.provider?.toLowerCase().includes(filters.provider!.toLowerCase())
      )
    }
    set({ expenses, loading: false })
  },

  createExpense: async (data) => {
    // CRT-102: Bloquear escrituras durante impersonación
    assertNotImpersonating('createExpense')
    // MAJ-001: Reject negative amounts
    if (data.amount_ars < 0) throw new Error('Monto ARS inválido: no puede ser negativo')
    // BLK-003: Lockear TC al momento de creación del gasto
    const currentRate = useCurrencyStore.getState().latestRate
    const exchangeRate = data.exchange_rate ?? currentRate?.rate_blue ?? null
    // BLK-102: Calcular amount_usd con TC histórico en el momento de creación,
    // nunca reconvertir después. Esto preserva el valor en dólares original.
    const amountUsd =
      exchangeRate && exchangeRate > 0
        ? Math.round((data.amount_ars / exchangeRate) * 100) / 100
        : (data.amount_usd ?? 0)
    const expense: Expense = {
      ...data,
      exchange_rate: exchangeRate,
      amount_usd: amountUsd,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockExpenses.push(expense)
    set((s) => ({ expenses: [expense, ...s.expenses] }))
  },

  updateExpense: async (id, data) => {
    // CRT-102: Bloquear escrituras durante impersonación
    assertNotImpersonating('updateExpense')
    // MAJ-001: Reject negative amounts
    if (data.amount_ars !== undefined && data.amount_ars < 0) throw new Error('Monto ARS inválido: no puede ser negativo')
    const idx = mockExpenses.findIndex((e) => e.id === id)
    if (idx >= 0) {
      mockExpenses[idx] = { ...mockExpenses[idx], ...data, updated_at: new Date().toISOString() }
      const updated = mockExpenses[idx]
      set((s) => ({
        expenses: s.expenses.map((e) => (e.id === id ? updated : e)),
      }))
    }
  },

  deleteExpense: async (id) => {
    // CRT-102: Bloquear escrituras durante impersonación
    assertNotImpersonating('deleteExpense')
    const idx = mockExpenses.findIndex((e) => e.id === id)
    if (idx >= 0) mockExpenses.splice(idx, 1)
    set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
  },

  setFilters: (filters) => set({ filters }),
}))
