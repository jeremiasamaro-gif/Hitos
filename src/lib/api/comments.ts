import { supabase, type Comment } from '../supabase'

export async function getComments(
  projectId: string,
  filters?: { budgetItemId?: string; expenseId?: string }
): Promise<Comment[]> {
  let query = supabase
    .from('comments')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (filters?.budgetItemId) {
    query = query.eq('budget_item_id', filters.budgetItemId)
  }
  if (filters?.expenseId) {
    query = query.eq('expense_id', filters.expenseId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createComment(
  comment: Pick<Comment, 'project_id' | 'user_id' | 'text'> &
    Partial<Pick<Comment, 'budget_item_id' | 'expense_id'>>
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function replyComment(
  parentId: string,
  reply: Pick<Comment, 'project_id' | 'user_id' | 'text'> &
    Partial<Pick<Comment, 'budget_item_id' | 'expense_id'>>
): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({ ...reply, parent_id: parentId })
    .select()
    .single()

  if (error) throw error
  return data
}
