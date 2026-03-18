import { supabase, type Project, type BudgetItem, type Expense } from '../supabase'
import { mockProjects, mockBudgetItems, mockExpenses } from '@/store/mockData'
import { getWeekNumber } from '@/lib/formatUtils'

export type ProjectStatus = 'en-curso' | 'con-alertas' | 'finalizado'

export interface RubroExcedidoDetalle {
  nombre: string
  presupuestado: number
  gastado: number
  pctExcedente: number
}

export interface ProjectWithStats extends Project {
  totalPresupuestado: number
  totalGastado: number
  pctEjecutado: number
  rubrosExcedidos: number
  rubrosExcedidosDetalle: RubroExcedidoDetalle[]
  semanaDeObra: number
  estado: ProjectStatus
  badges: string[]
}

export function getBadges(estado: ProjectStatus, rubrosExcedidos: number): string[] {
  if (estado === 'finalizado') return ['Finalizado']
  const badges = ['En curso']
  if (rubrosExcedidos > 0) badges.push('Con alertas')
  return badges
}

function computeStats(project: Project, allItems: BudgetItem[], allExpenses: Expense[]): ProjectWithStats {
  const items = allItems.filter((i) => i.project_id === project.id)
  const expenses = allExpenses.filter((e) => e.project_id === project.id)

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

  const totalPresupuestado = parents.reduce((s, p) => s + p.total_price, 0)

  let totalGastado = 0
  let rubrosExcedidos = 0
  const rubrosExcedidosDetalle: RubroExcedidoDetalle[] = []
  let allFinished = parents.length > 0

  for (const parent of parents) {
    const children = childrenMap.get(parent.id) || []
    let parentSpent = spentByItem.get(parent.id) || 0
    for (const c of children) parentSpent += spentByItem.get(c.id) || 0
    totalGastado += parentSpent

    if (parentSpent > parent.total_price) {
      rubrosExcedidos++
      rubrosExcedidosDetalle.push({
        nombre: parent.description,
        presupuestado: parent.total_price,
        gastado: parentSpent,
        pctExcedente: parent.total_price > 0 ? ((parentSpent - parent.total_price) / parent.total_price) * 100 : 0,
      })
    }
    if (parent.total_price > 0 && parentSpent / parent.total_price < 0.95) allFinished = false
  }

  const pctEjecutado = totalPresupuestado > 0 ? (totalGastado / totalPresupuestado) * 100 : 0
  const semanaDeObra = getWeekNumber(project.created_at)

  let estado: ProjectStatus = 'en-curso'
  if (parents.length > 0 && allFinished) estado = 'finalizado'
  else if (rubrosExcedidos > 0) estado = 'con-alertas'

  const badges = getBadges(estado, rubrosExcedidos)

  return {
    ...project,
    totalPresupuestado,
    totalGastado,
    pctEjecutado,
    rubrosExcedidos,
    rubrosExcedidosDetalle,
    semanaDeObra,
    estado,
    badges,
  }
}

export async function getProjectsWithStats(architectId?: string): Promise<ProjectWithStats[]> {
  // Use mock data directly (in production this would use Supabase joins)
  await new Promise((r) => setTimeout(r, 200))
  const projects = architectId
    ? mockProjects.filter((p) => p.architect_id === architectId)
    : mockProjects
  return projects.map((p) => computeStats(p, mockBudgetItems, mockExpenses))
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProject(id: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProject(
  project: Pick<Project, 'name' | 'address' | 'architect_id' | 'usd_rate_blue'>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(
  id: string,
  updates: Partial<Pick<Project, 'name' | 'address' | 'usd_rate_blue'>>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
