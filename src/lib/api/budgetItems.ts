import { supabase, type BudgetItem } from '../supabase'

export async function getBudgetItems(projectId: string): Promise<BudgetItem[]> {
  const { data, error } = await supabase
    .from('budget_items')
    .select('*')
    .eq('project_id', projectId)
    .order('item_code', { ascending: true })

  if (error) throw error
  return data
}

export async function createBudgetItem(
  item: Pick<BudgetItem, 'project_id' | 'description' | 'quantity' | 'unit_price' | 'total_price'> &
    Partial<Pick<BudgetItem, 'parent_id' | 'item_code' | 'unit' | 'rubro' | 'category'>>
): Promise<BudgetItem> {
  const { data, error } = await supabase
    .from('budget_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBudgetItem(
  id: string,
  updates: Partial<Pick<BudgetItem, 'item_code' | 'description' | 'unit' | 'quantity' | 'rubro' | 'unit_price' | 'total_price' | 'category' | 'parent_id'>>
): Promise<BudgetItem> {
  const { data, error } = await supabase
    .from('budget_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
