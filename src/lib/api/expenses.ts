import { supabase, type Expense } from '../supabase'

export async function getExpenses(
  projectId: string,
  filters?: { budgetItemId?: string; weekNumber?: number }
): Promise<Expense[]> {
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false })

  if (filters?.budgetItemId) {
    query = query.eq('budget_item_id', filters.budgetItemId)
  }
  if (filters?.weekNumber) {
    query = query.eq('week_number', filters.weekNumber)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createExpense(
  expense: Pick<Expense, 'project_id' | 'date' | 'amount_ars' | 'created_by'> &
    Partial<Pick<Expense, 'budget_item_id' | 'provider' | 'detail' | 'amount_usd' | 'exchange_rate' | 'payment_method' | 'week_number' | 'adjunto_url' | 'tipo_gasto'>>
): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateExpense(
  id: string,
  updates: Partial<Pick<Expense, 'budget_item_id' | 'date' | 'provider' | 'detail' | 'amount_ars' | 'amount_usd' | 'exchange_rate' | 'payment_method' | 'week_number' | 'adjunto_url' | 'tipo_gasto'>>
): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)

  if (error) throw error
}
