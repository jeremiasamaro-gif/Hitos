import { create } from 'zustand'
import type { Comment } from '@/lib/supabase'
import { mockComments } from './mockData'

interface CommentState {
  comments: Comment[]
  loading: boolean
  lastReadTimestamps: Record<string, string>
  fetchComments: (projectId: string, filters?: { budgetItemId?: string; expenseId?: string }) => Promise<void>
  createComment: (data: Omit<Comment, 'id' | 'created_at'>) => Promise<void>
  replyComment: (parentId: string, data: Omit<Comment, 'id' | 'created_at' | 'parent_id'>) => Promise<void>
  markAsRead: (entityId: string) => void
  getUnreadCount: (entityId: string) => number
  getTotalUnread: () => number
}

function loadTimestamps(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem('obras-read-timestamps') || '{}')
  } catch {
    return {}
  }
}

function saveTimestamps(ts: Record<string, string>) {
  localStorage.setItem('obras-read-timestamps', JSON.stringify(ts))
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  lastReadTimestamps: loadTimestamps(),

  fetchComments: async (projectId, filters) => {
    set({ loading: true })
    await new Promise((r) => setTimeout(r, 100))
    let comments = mockComments.filter((c) => c.project_id === projectId)
    if (filters?.budgetItemId) {
      comments = comments.filter((c) => c.budget_item_id === filters.budgetItemId)
    }
    if (filters?.expenseId) {
      comments = comments.filter((c) => c.expense_id === filters.expenseId)
    }
    set({ comments, loading: false })
  },

  createComment: async (data) => {
    const comment: Comment = {
      ...data,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }
    mockComments.push(comment)
    set((s) => ({ comments: [...s.comments, comment] }))
  },

  replyComment: async (parentId, data) => {
    const comment: Comment = {
      ...data,
      id: crypto.randomUUID(),
      parent_id: parentId,
      created_at: new Date().toISOString(),
    }
    mockComments.push(comment)
    set((s) => ({ comments: [...s.comments, comment] }))
  },

  markAsRead: (entityId) => {
    const ts = { ...get().lastReadTimestamps, [entityId]: new Date().toISOString() }
    set({ lastReadTimestamps: ts })
    saveTimestamps(ts)
  },

  getUnreadCount: (entityId) => {
    const { comments, lastReadTimestamps } = get()
    const lastRead = lastReadTimestamps[entityId]
    const relevant = comments.filter(
      (c) => c.budget_item_id === entityId || c.expense_id === entityId
    )
    if (!lastRead) return relevant.length
    return relevant.filter((c) => c.created_at > lastRead).length
  },

  getTotalUnread: () => {
    const { comments, lastReadTimestamps } = get()
    let count = 0
    const entities = new Set<string>()
    for (const c of comments) {
      const key = c.budget_item_id || c.expense_id || ''
      if (key) entities.add(key)
    }
    for (const entityId of entities) {
      const lastRead = lastReadTimestamps[entityId]
      const relevant = comments.filter(
        (c) => c.budget_item_id === entityId || c.expense_id === entityId
      )
      if (!lastRead) {
        count += relevant.length
      } else {
        count += relevant.filter((c) => c.created_at > lastRead).length
      }
    }
    return count
  },
}))
