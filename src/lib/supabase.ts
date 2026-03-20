import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// TypeScript types matching schema.sql
// ============================================

export type UserRole = 'arquitecto' | 'cliente'
export type ProjectMemberRole = 'arquitecto' | 'cliente'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  honorario_direccion: number
  honorario_proyecto: number
  firma_url: string | null
  firma_en_pdf: boolean
  logo_url: string | null
  last_sign_in: string | null
  created_at: string
  updated_at: string
}

export type ObraType = 'Obra nueva' | 'Refacción' | 'Ampliación' | 'Remodelación' | 'Otro'

export interface Project {
  id: string
  name: string
  address: string | null
  architect_id: string
  usd_rate_blue: number
  obra_type: ObraType | null
  description: string | null
  start_date: string | null
  end_date_estimated: string | null
  weeks_estimated: number | null
  honorario_direccion: number
  honorario_proyecto: number
  metros_cuadrados: number
  avance_fisico: number
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: ProjectMemberRole
  created_at: string
}

export interface BudgetItem {
  id: string
  project_id: string
  parent_id: string | null
  item_code: string | null
  description: string
  unit: string | null
  quantity: number
  rubro: string | null
  unit_price: number
  total_price: number
  category: string | null
  week_number: number | null
  created_at: string
  updated_at: string
}

export type TipoGasto = 'materiales' | 'mano_obra' | 'honorarios' | 'varios'

export interface Expense {
  id: string
  project_id: string
  budget_item_id: string | null
  date: string
  provider: string | null
  detail: string | null
  amount_ars: number
  amount_usd: number
  exchange_rate: number | null
  payment_method: string | null
  week_number: number | null
  adjunto_url: string | null
  tipo_gasto: TipoGasto
  created_by: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  project_id: string
  budget_item_id: string | null
  expense_id: string | null
  user_id: string
  text: string
  parent_id: string | null
  created_at: string
}

export interface ExchangeRate {
  id: string
  project_id: string
  date: string
  rate_blue: number
  created_by: string
  created_at: string
}

export interface Provider {
  id: string
  architect_id: string
  nombre: string
  apellido: string | null
  rubro: string | null
  telefono: string | null
  email: string | null
  notas: string | null
  created_at: string
}

export interface ClientPayment {
  id: string
  project_id: string
  user_id: string
  date: string
  amount: number
  currency: 'ARS' | 'USD' | 'EUR'
  exchange_rate: number | null
  amount_ars: number
  payment_method: string
  description: string | null
  budget_item_id: string | null
  created_at: string
}
