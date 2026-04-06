import { create } from 'zustand'
import type { BudgetItem } from '@/lib/supabase'
import { mockBudgetItems } from './mockData'
import { assertNotImpersonating } from '@/lib/api/impersonationGuard'

/** BLK-001: Collect all descendant IDs recursively for cascade delete */
function getAllDescendantIds(items: BudgetItem[], parentId: string): string[] {
  const directChildren = items.filter((i) => i.parent_id === parentId)
  return [
    ...directChildren.map((c) => c.id),
    ...directChildren.flatMap((c) => getAllDescendantIds(items, c.id)),
  ]
}

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
    // CRT-102: Bloquear escrituras durante impersonación
    assertNotImpersonating('createBudgetItem')
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
    // CRT-102: Bloquear escrituras durante impersonación
    assertNotImpersonating('updateBudgetItem')
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
    // CRT-102: Bloquear escrituras durante impersonación
    assertNotImpersonating('deleteBudgetItem')
    // BLK-001: Cascade delete — remove item + all descendants
    set((s) => {
      const toDelete = new Set([id, ...getAllDescendantIds(s.items, id)])
      // Also remove from mock data array
      for (let i = mockBudgetItems.length - 1; i >= 0; i--) {
        if (toDelete.has(mockBudgetItems[i].id)) mockBudgetItems.splice(i, 1)
      }
      return { items: s.items.filter((i) => !toDelete.has(i.id)) }
    })
  },
}))
