import { supabase, type ExchangeRate } from '../supabase'

export async function getLatestRate(projectId: string): Promise<ExchangeRate | null> {
  const { data, error } = await supabase
    .from('exchange_rates')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function setRate(
  rate: Pick<ExchangeRate, 'project_id' | 'date' | 'rate_blue' | 'created_by'>
): Promise<ExchangeRate> {
  const { data, error } = await supabase
    .from('exchange_rates')
    .upsert(rate, { onConflict: 'project_id,date' })
    .select()
    .single()

  if (error) throw error
  return data
}
