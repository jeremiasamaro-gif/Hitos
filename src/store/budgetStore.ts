import { create } from 'zustand'
import type { BudgetItem } from '@/lib/supabase'
import { mockBudgetItems } from './mockData'

interface BudgetState {
  items: BudgetItem[]
  loading: boolean
  fetchItems: (projectId: string) => Promise<void>
  createItem: (data: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateItem: (id: string, data: Partial<Pick<BudgetItem, 'description' | 'unit' | 'quantity' | 'unit_price' | 'total_price' | 'rubro' | 'category' | 'week_number'>>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

export const useBudgetStore = create<BudgetState>((set) => ({
  items: [],
  loading: false,

  fetchItems: async (projectId) => {
    set({ loading: true })
    await new Promise((r) => setTimeout(r, 150))
    const items = mockBudgetItems.filter((i) => i.project_id === projectId)
    set({ items, loading: false })
  },

  createItem: async (data) => {
    const item: BudgetItem = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockBudgetItems.push(item)
    set((s) => ({ items: [...s.items, item] }))
  },

  updateItem: async (id, data) => {
    const idx = mockBudgetItems.findIndex((i) => i.id === id)
    if (idx >= 0) {
      mockBudgetItems[idx] = { ...mockBudgetItems[idx], ...data, updated_at: new Date().toISOString() }
      const updated = mockBudgetItems[idx]
      set((s) => ({
        items: s.items.map((i) => (i.id === id ? updated : i)),
      }))
    }
  },

  deleteItem: async (id) => {
    const idx = mockBudgetItems.findIndex((i) => i.id === id)
    if (idx >= 0) mockBudgetItems.splice(idx, 1)
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }))
  },
}))
