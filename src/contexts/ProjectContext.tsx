import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { useCommentStore } from '@/store/commentStore'
import { useAuthStore } from '@/store/authStore'
import { mockProjectMembers } from '@/store/mockData'
import type { Project, UserRole, ExchangeRate } from '@/lib/supabase'
import type { CurrencyMode } from '@/utils/currency'
import { Spinner } from '@/components/ui/Spinner'

interface ProjectContextValue {
  project: Project
  userRole: UserRole
  currencyMode: CurrencyMode
  latestRate: ExchangeRate | null
  globalProgress: number
  totalBudget: number
  totalSpent: number
  convert: (amountArs: number) => number
}

const ProjectCtx = createContext<ProjectContextValue | null>(null)

export function useProjectContext() {
  const ctx = useContext(ProjectCtx)
  if (!ctx) throw new Error('useProjectContext must be used within ProjectProvider')
  return ctx
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const { currentProject, fetchProject } = useProjectStore()
  const { items, fetchItems } = useBudgetStore()
  const { fetchExpenses, expenses } = useExpenseStore()
  const { fetchRate, latestRate, mode, convert } = useCurrencyStore()
  const fetchComments = useCommentStore((s) => s.fetchComments)

  useEffect(() => {
    if (!id) return
    fetchProject(id)
    fetchItems(id)
    fetchExpenses(id)
    fetchRate(id)
    fetchComments(id)
  }, [id, fetchProject, fetchItems, fetchExpenses, fetchRate, fetchComments])

  const userRole = useMemo<UserRole>(() => {
    if (!user || !id) return 'cliente'
    const membership = mockProjectMembers.find(
      (m) => m.project_id === id && m.user_id === user.id
    )
    return (membership?.role as UserRole) ?? user.role
  }, [user, id])

  const { totalBudget, totalSpent, globalProgress } = useMemo(() => {
    const parents = items.filter((i) => !i.parent_id)
    const budget = parents.reduce((sum, p) => sum + p.total_price, 0)
    const spent = expenses.reduce((sum, e) => sum + e.amount_ars, 0)
    const progress = budget > 0 ? (spent / budget) * 100 : 0
    return { totalBudget: budget, totalSpent: spent, globalProgress: progress }
  }, [items, expenses])

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <ProjectCtx.Provider
      value={{
        project: currentProject,
        userRole,
        currencyMode: mode,
        latestRate,
        globalProgress,
        totalBudget,
        totalSpent,
        convert,
      }}
    >
      {children}
    </ProjectCtx.Provider>
  )
}
