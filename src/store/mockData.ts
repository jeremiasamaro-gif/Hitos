import type { User, Project, ProjectMember, BudgetItem, Expense, Comment, ExchangeRate, ClientPayment, Provider } from '@/lib/supabase'

// ============================================
// USERS
// ============================================
export const mockUsers: User[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'arq@test.com',
    name: 'Arquitecto Test',
    role: 'arquitecto',
    honorario_direccion: 8,
    honorario_proyecto: 5,
    firma_url: null,
    firma_en_pdf: false,
    logo_url: null,
    last_sign_in: '2026-03-20T08:30:00Z',
    created_at: '2026-01-01T10:00:00Z',
    updated_at: '2026-01-01T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'cliente@test.com',
    name: 'Cliente Test',
    role: 'cliente',
    honorario_direccion: 0,
    honorario_proyecto: 0,
    firma_url: null,
    firma_en_pdf: false,
    logo_url: null,
    last_sign_in: '2026-03-19T14:20:00Z',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'ana.garcia@mail.com',
    name: 'Ana García',
    role: 'cliente',
    honorario_direccion: 0,
    honorario_proyecto: 0,
    firma_url: null,
    firma_en_pdf: false,
    logo_url: null,
    last_sign_in: '2026-03-18T09:15:00Z',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-02-01T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'roberto.diaz@mail.com',
    name: 'Roberto Díaz',
    role: 'cliente',
    honorario_direccion: 0,
    honorario_proyecto: 0,
    firma_url: null,
    firma_en_pdf: false,
    logo_url: null,
    last_sign_in: '2026-03-15T16:45:00Z',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-02-10T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'lucia.fernandez@mail.com',
    name: 'Lucía Fernández',
    role: 'cliente',
    honorario_direccion: 0,
    honorario_proyecto: 0,
    firma_url: null,
    firma_en_pdf: false,
    logo_url: null,
    last_sign_in: '2026-03-10T11:00:00Z',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-02-15T10:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    email: 'martin.torres@mail.com',
    name: 'Martín Torres',
    role: 'cliente',
    honorario_direccion: 0,
    honorario_proyecto: 0,
    firma_url: null,
    firma_en_pdf: false,
    logo_url: null,
    last_sign_in: '2026-03-05T20:30:00Z',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
  },
]

// ============================================
// PROJECT
// ============================================
export const mockProjects: Project[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'La Alejada',
    address: 'Ruta 40 Km 1234, Mendoza',
    architect_id: '00000000-0000-0000-0000-000000000001',
    usd_rate_blue: 1420,
    obra_type: 'Obra nueva',
    description: 'Casa familiar de 180m2 en terreno de montaña',
    start_date: '2026-01-10',
    end_date_estimated: '2026-09-30',
    weeks_estimated: 38,
    honorario_direccion: 8,
    honorario_proyecto: 5,
    metros_cuadrados: 180,
    avance_fisico: 45,
    created_at: '2026-01-10T10:00:00Z',
    updated_at: '2026-03-15T10:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Proyecto B',
    address: 'Av. San Martín 456, CABA',
    architect_id: '00000000-0000-0000-0000-000000000001',
    usd_rate_blue: 1420,
    obra_type: 'Refacción',
    description: 'Refacción departamento 3 ambientes',
    start_date: '2026-02-01',
    end_date_estimated: '2026-06-30',
    weeks_estimated: 20,
    honorario_direccion: 10,
    honorario_proyecto: 6,
    metros_cuadrados: 85,
    avance_fisico: 15,
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-03-10T10:00:00Z',
  },
]

// ============================================
// PROJECT MEMBERS
// ============================================
export const mockProjectMembers: ProjectMember[] = [
  // La Alejada
  { id: 'pm-1', project_id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000001', role: 'arquitecto', created_at: '2026-01-10T10:00:00Z' },
  { id: 'pm-2', project_id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000002', role: 'cliente', created_at: '2026-01-10T10:00:00Z' },
  { id: 'pm-3', project_id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000003', role: 'cliente', created_at: '2026-02-01T10:00:00Z' },
  { id: 'pm-4', project_id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000004', role: 'cliente', created_at: '2026-02-10T10:00:00Z' },
  { id: 'pm-5', project_id: '11111111-1111-1111-1111-111111111111', user_id: '00000000-0000-0000-0000-000000000006', role: 'cliente', created_at: '2026-03-01T10:00:00Z' },
  // Proyecto B
  { id: 'pm-6', project_id: '22222222-2222-2222-2222-222222222222', user_id: '00000000-0000-0000-0000-000000000001', role: 'arquitecto', created_at: '2026-02-01T10:00:00Z' },
  { id: 'pm-7', project_id: '22222222-2222-2222-2222-222222222222', user_id: '00000000-0000-0000-0000-000000000003', role: 'cliente', created_at: '2026-02-05T10:00:00Z' },
  { id: 'pm-8', project_id: '22222222-2222-2222-2222-222222222222', user_id: '00000000-0000-0000-0000-000000000005', role: 'cliente', created_at: '2026-02-15T10:00:00Z' },
  { id: 'pm-9', project_id: '22222222-2222-2222-2222-222222222222', user_id: '00000000-0000-0000-0000-000000000006', role: 'cliente', created_at: '2026-03-01T10:00:00Z' },
]

// ============================================
// BUDGET ITEMS — La Alejada (149.075.700 ARS total)
// ============================================
export const mockBudgetItems: BudgetItem[] = [
  // 1. Movimiento de suelos — 8.500.000
  { id: 'bi-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: null, item_code: '1', description: 'Movimiento de suelos', unit: 'gl', quantity: 1, rubro: 'Excavaciones', unit_price: 8500000, total_price: 8500000, category: 'Movimiento de suelos', week_number: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-1-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-1', item_code: '1.1', description: 'Excavación para fundaciones', unit: 'm3', quantity: 120, rubro: 'Excavaciones', unit_price: 35000, total_price: 4200000, category: 'Movimiento de suelos', week_number: 1, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-1-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-1', item_code: '1.2', description: 'Relleno y compactación', unit: 'm3', quantity: 80, rubro: 'Excavaciones', unit_price: 28000, total_price: 2240000, category: 'Movimiento de suelos', week_number: 2, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-1-3', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-1', item_code: '1.3', description: 'Retiro de sobrante', unit: 'viaje', quantity: 10, rubro: 'Excavaciones', unit_price: 206000, total_price: 2060000, category: 'Movimiento de suelos', week_number: 3, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },

  // 2. Estructura — 35.200.000
  { id: 'bi-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: null, item_code: '2', description: 'Estructura', unit: 'gl', quantity: 1, rubro: 'Estructura', unit_price: 35200000, total_price: 35200000, category: 'Estructura', week_number: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-2-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-2', item_code: '2.1', description: 'Fundaciones H°A°', unit: 'm3', quantity: 25, rubro: 'Estructura', unit_price: 380000, total_price: 9500000, category: 'Estructura', week_number: 4, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-2-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-2', item_code: '2.2', description: 'Columnas H°A°', unit: 'ml', quantity: 60, rubro: 'Estructura', unit_price: 185000, total_price: 11100000, category: 'Estructura', week_number: 6, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-2-3', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-2', item_code: '2.3', description: 'Vigas H°A°', unit: 'ml', quantity: 45, rubro: 'Estructura', unit_price: 195000, total_price: 8775000, category: 'Estructura', week_number: 7, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-2-4', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-2', item_code: '2.4', description: 'Losa H°A°', unit: 'm2', quantity: 140, rubro: 'Estructura', unit_price: 41607.14, total_price: 5825000, category: 'Estructura', week_number: 8, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },

  // 3. Albañilería — 22.400.000
  { id: 'bi-3', project_id: '11111111-1111-1111-1111-111111111111', parent_id: null, item_code: '3', description: 'Albañilería', unit: 'gl', quantity: 1, rubro: 'Albañilería', unit_price: 22400000, total_price: 22400000, category: 'Albañilería', week_number: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-3-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-3', item_code: '3.1', description: 'Mampostería de ladrillos', unit: 'm2', quantity: 320, rubro: 'Albañilería', unit_price: 42000, total_price: 13440000, category: 'Albañilería', week_number: 9, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-3-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-3', item_code: '3.2', description: 'Revoques grueso y fino', unit: 'm2', quantity: 580, rubro: 'Albañilería', unit_price: 15448.28, total_price: 8960000, category: 'Albañilería', week_number: 10, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },

  // 4. Instalaciones — 28.500.000
  { id: 'bi-4', project_id: '11111111-1111-1111-1111-111111111111', parent_id: null, item_code: '4', description: 'Instalaciones', unit: 'gl', quantity: 1, rubro: 'Instalaciones', unit_price: 28500000, total_price: 28500000, category: 'Instalaciones', week_number: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-4-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-4', item_code: '4.1', description: 'Instalación eléctrica', unit: 'gl', quantity: 1, rubro: 'Electricidad', unit_price: 12000000, total_price: 12000000, category: 'Instalaciones', week_number: 10, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-4-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-4', item_code: '4.2', description: 'Instalación sanitaria', unit: 'gl', quantity: 1, rubro: 'Plomería', unit_price: 9500000, total_price: 9500000, category: 'Instalaciones', week_number: 11, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-4-3', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-4', item_code: '4.3', description: 'Instalación de gas', unit: 'gl', quantity: 1, rubro: 'Gasista', unit_price: 7000000, total_price: 7000000, category: 'Instalaciones', week_number: 12, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },

  // 5. Terminaciones — 25.800.000
  { id: 'bi-5', project_id: '11111111-1111-1111-1111-111111111111', parent_id: null, item_code: '5', description: 'Terminaciones', unit: 'gl', quantity: 1, rubro: 'Terminaciones', unit_price: 25800000, total_price: 25800000, category: 'Terminaciones', week_number: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-5-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-5', item_code: '5.1', description: 'Pisos cerámicos', unit: 'm2', quantity: 140, rubro: 'Terminaciones', unit_price: 65000, total_price: 9100000, category: 'Terminaciones', week_number: 14, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-5-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-5', item_code: '5.2', description: 'Pintura interior/exterior', unit: 'm2', quantity: 600, rubro: 'Pintura', unit_price: 18000, total_price: 10800000, category: 'Terminaciones', week_number: 16, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-5-3', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-5', item_code: '5.3', description: 'Revestimientos baños', unit: 'm2', quantity: 45, rubro: 'Terminaciones', unit_price: 131111.11, total_price: 5900000, category: 'Terminaciones', week_number: 18, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },

  // 6. Aberturas — 15.200.000
  { id: 'bi-6', project_id: '11111111-1111-1111-1111-111111111111', parent_id: null, item_code: '6', description: 'Aberturas', unit: 'gl', quantity: 1, rubro: 'Aberturas', unit_price: 15200000, total_price: 15200000, category: 'Aberturas', week_number: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-6-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-6', item_code: '6.1', description: 'Ventanas aluminio DVH', unit: 'un', quantity: 12, rubro: 'Carpintería', unit_price: 850000, total_price: 10200000, category: 'Aberturas', week_number: 20, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-6-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-6', item_code: '6.2', description: 'Puertas interiores', unit: 'un', quantity: 8, rubro: 'Carpintería', unit_price: 625000, total_price: 5000000, category: 'Aberturas', week_number: 22, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },

  // 7. Equipamiento — 8.475.700
  { id: 'bi-7', project_id: '11111111-1111-1111-1111-111111111111', parent_id: null, item_code: '7', description: 'Equipamiento', unit: 'gl', quantity: 1, rubro: 'Equipamiento', unit_price: 8475700, total_price: 8475700, category: 'Equipamiento', week_number: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-7-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-7', item_code: '7.1', description: 'Griferías y sanitarios', unit: 'gl', quantity: 1, rubro: 'Equipamiento', unit_price: 4500000, total_price: 4500000, category: 'Equipamiento', week_number: 24, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-7-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-7', item_code: '7.2', description: 'Mesadas y muebles fijos', unit: 'gl', quantity: 1, rubro: 'Equipamiento', unit_price: 3975700, total_price: 3975700, category: 'Equipamiento', week_number: 26, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },

  // 8. Exterior — 5.000.000
  { id: 'bi-8', project_id: '11111111-1111-1111-1111-111111111111', parent_id: null, item_code: '8', description: 'Exterior y paisajismo', unit: 'gl', quantity: 1, rubro: 'Exterior', unit_price: 5000000, total_price: 5000000, category: 'Exterior', week_number: null, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-8-1', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-8', item_code: '8.1', description: 'Vereda perimetral', unit: 'm2', quantity: 60, rubro: 'Albañilería', unit_price: 45000, total_price: 2700000, category: 'Exterior', week_number: 30, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
  { id: 'bi-8-2', project_id: '11111111-1111-1111-1111-111111111111', parent_id: 'bi-8', item_code: '8.2', description: 'Parquización', unit: 'gl', quantity: 1, rubro: 'Exterior', unit_price: 2300000, total_price: 2300000, category: 'Exterior', week_number: 34, created_at: '2026-01-10T10:00:00Z', updated_at: '2026-01-10T10:00:00Z' },
]

// ============================================
// EXPENSES
// ============================================
const ARQ_ID = '00000000-0000-0000-0000-000000000001'
const PROJECT_ID = '11111111-1111-1111-1111-111111111111'

export const mockExpenses: Expense[] = [
  // Movimiento de suelos — 8.200.000
  { id: 'exp-1', project_id: PROJECT_ID, budget_item_id: 'bi-1-1', date: '2026-01-15', provider: 'Excavaciones del Sur', detail: 'Excavación completa', amount_ars: 4200000, amount_usd: 2896.55, exchange_rate: 1450, payment_method: 'transferencia', week_number: 3, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-01-15T10:00:00Z', updated_at: '2026-01-15T10:00:00Z' },
  { id: 'exp-2', project_id: PROJECT_ID, budget_item_id: 'bi-1-2', date: '2026-01-22', provider: 'Excavaciones del Sur', detail: 'Relleno y compactación', amount_ars: 2100000, amount_usd: 1448.28, exchange_rate: 1450, payment_method: 'transferencia', week_number: 4, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-01-22T10:00:00Z', updated_at: '2026-01-22T10:00:00Z' },
  { id: 'exp-3', project_id: PROJECT_ID, budget_item_id: 'bi-1-3', date: '2026-01-29', provider: 'Transportes Ruiz', detail: 'Retiro sobrante 10 viajes', amount_ars: 1900000, amount_usd: 1310.34, exchange_rate: 1450, payment_method: 'efectivo', week_number: 5, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-01-29T10:00:00Z', updated_at: '2026-01-29T10:00:00Z' },
  // Estructura — 28.750.000
  { id: 'exp-4', project_id: PROJECT_ID, budget_item_id: 'bi-2-1', date: '2026-02-03', provider: 'Hormigonera Central', detail: 'Hormigón para fundaciones', amount_ars: 9500000, amount_usd: 6551.72, exchange_rate: 1450, payment_method: 'transferencia', week_number: 6, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-02-03T10:00:00Z', updated_at: '2026-02-03T10:00:00Z' },
  { id: 'exp-5', project_id: PROJECT_ID, budget_item_id: 'bi-2-2', date: '2026-02-10', provider: 'Hierros Mendoza', detail: 'Hierro para columnas y vigas', amount_ars: 8500000, amount_usd: 5862.07, exchange_rate: 1450, payment_method: 'transferencia', week_number: 7, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-02-10T10:00:00Z', updated_at: '2026-02-10T10:00:00Z' },
  { id: 'exp-6', project_id: PROJECT_ID, budget_item_id: 'bi-2-2', date: '2026-02-17', provider: 'Encofrados SRL', detail: 'Encofrado y mano de obra columnas', amount_ars: 5750000, amount_usd: 3965.52, exchange_rate: 1450, payment_method: 'cheque', week_number: 8, adjunto_url: null, tipo_gasto: 'mano_obra' as const, created_by: ARQ_ID, created_at: '2026-02-17T10:00:00Z', updated_at: '2026-02-17T10:00:00Z' },
  { id: 'exp-7', project_id: PROJECT_ID, budget_item_id: 'bi-2-4', date: '2026-02-24', provider: 'Hormigonera Central', detail: 'Hormigón losa + bomba', amount_ars: 5000000, amount_usd: 3448.28, exchange_rate: 1450, payment_method: 'transferencia', week_number: 9, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-02-24T10:00:00Z', updated_at: '2026-02-24T10:00:00Z' },
  // Albañilería — 15.300.000
  { id: 'exp-8', project_id: PROJECT_ID, budget_item_id: 'bi-3-1', date: '2026-03-03', provider: 'Corralón El Constructor', detail: 'Ladrillos huecos 18x18x33', amount_ars: 7500000, amount_usd: 5172.41, exchange_rate: 1450, payment_method: 'transferencia', week_number: 10, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-03-03T10:00:00Z', updated_at: '2026-03-03T10:00:00Z' },
  { id: 'exp-9', project_id: PROJECT_ID, budget_item_id: 'bi-3-1', date: '2026-03-05', provider: 'Cuadrilla García', detail: 'Mano de obra mampostería', amount_ars: 4800000, amount_usd: 3310.34, exchange_rate: 1450, payment_method: 'efectivo', week_number: 10, adjunto_url: null, tipo_gasto: 'mano_obra' as const, created_by: ARQ_ID, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-03-05T10:00:00Z' },
  { id: 'exp-10', project_id: PROJECT_ID, budget_item_id: 'bi-3-2', date: '2026-03-10', provider: 'Corralón El Constructor', detail: 'Cemento, cal, arena para revoques', amount_ars: 3000000, amount_usd: 2068.97, exchange_rate: 1450, payment_method: 'transferencia', week_number: 11, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-03-10T10:00:00Z', updated_at: '2026-03-10T10:00:00Z' },
  // Instalaciones — 12.100.000
  { id: 'exp-11', project_id: PROJECT_ID, budget_item_id: 'bi-4-1', date: '2026-03-01', provider: 'Electricidad Rodríguez', detail: 'Materiales eléctricos + cableado', amount_ars: 7200000, amount_usd: 4965.52, exchange_rate: 1450, payment_method: 'transferencia', week_number: 9, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { id: 'exp-12', project_id: PROJECT_ID, budget_item_id: 'bi-4-2', date: '2026-03-08', provider: 'Sanitarios López', detail: 'Caños, conexiones, tanque', amount_ars: 4900000, amount_usd: 3379.31, exchange_rate: 1450, payment_method: 'transferencia', week_number: 10, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-03-08T10:00:00Z', updated_at: '2026-03-08T10:00:00Z' },
  // Terminaciones — 5.200.000
  { id: 'exp-13', project_id: PROJECT_ID, budget_item_id: 'bi-5-1', date: '2026-03-12', provider: 'Cerámica San Lorenzo', detail: 'Pisos porcellanato 60x60', amount_ars: 5200000, amount_usd: 3586.21, exchange_rate: 1450, payment_method: 'transferencia', week_number: 11, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-03-12T10:00:00Z', updated_at: '2026-03-12T10:00:00Z' },
  // Aberturas — 2.800.000
  { id: 'exp-14', project_id: PROJECT_ID, budget_item_id: 'bi-6-1', date: '2026-03-14', provider: 'Aluminios Cuyo', detail: 'Seña ventanas DVH (4 unidades)', amount_ars: 2800000, amount_usd: 1931.03, exchange_rate: 1450, payment_method: 'transferencia', week_number: 11, adjunto_url: null, tipo_gasto: 'materiales' as const, created_by: ARQ_ID, created_at: '2026-03-14T10:00:00Z', updated_at: '2026-03-14T10:00:00Z' },
]

// ============================================
// COMMENTS
// ============================================
export const mockComments: Comment[] = [
  { id: 'c-1', project_id: PROJECT_ID, budget_item_id: 'bi-2', expense_id: null, user_id: ARQ_ID, text: 'La estructura está casi completa, falta el curado de la losa.', parent_id: null, created_at: '2026-03-01T14:00:00Z' },
  { id: 'c-2', project_id: PROJECT_ID, budget_item_id: 'bi-4', expense_id: null, user_id: '00000000-0000-0000-0000-000000000002', text: '¿Cuándo empiezan con la instalación de gas?', parent_id: null, created_at: '2026-03-05T10:00:00Z' },
  { id: 'c-3', project_id: PROJECT_ID, budget_item_id: 'bi-4', expense_id: null, user_id: ARQ_ID, text: 'La semana que viene arranca el gasista. Ya tiene los materiales.', parent_id: 'c-2', created_at: '2026-03-05T11:30:00Z' },
  { id: 'c-4', project_id: PROJECT_ID, budget_item_id: 'bi-6', expense_id: null, user_id: ARQ_ID, text: 'Las ventanas tienen 30 días de entrega desde la seña.', parent_id: null, created_at: '2026-03-14T16:00:00Z' },
  { id: 'c-5', project_id: PROJECT_ID, budget_item_id: 'bi-6', expense_id: null, user_id: '00000000-0000-0000-0000-000000000002', text: '¿Se pueden agregar mosquiteros?', parent_id: 'c-4', created_at: '2026-03-14T18:00:00Z' },
]

// ============================================
// EXCHANGE RATES
// ============================================
export const mockExchangeRates: ExchangeRate[] = [
  { id: 'er-1', project_id: PROJECT_ID, date: '2026-03-01', rate_blue: 1420, created_by: ARQ_ID, created_at: '2026-03-01T10:00:00Z' },
  { id: 'er-2', project_id: PROJECT_ID, date: '2026-03-15', rate_blue: 1420, created_by: ARQ_ID, created_at: '2026-03-15T10:00:00Z' },
]

// ============================================
// CLIENT PAYMENTS
// ============================================
const CLIENT_ID = '00000000-0000-0000-0000-000000000002'

export const mockClientPayments: ClientPayment[] = [
  { id: 'cp-1', project_id: PROJECT_ID, user_id: CLIENT_ID, date: '2026-01-20', amount: 20000, currency: 'USD', exchange_rate: 1450, amount_ars: 29000000, payment_method: 'transferencia', description: 'Anticipo de obra', budget_item_id: null, created_at: '2026-01-20T10:00:00Z' },
  { id: 'cp-2', project_id: PROJECT_ID, user_id: CLIENT_ID, date: '2026-02-15', amount: 15000000, currency: 'ARS', exchange_rate: null, amount_ars: 15000000, payment_method: 'transferencia', description: 'Segundo pago - Estructura', budget_item_id: 'bi-2', created_at: '2026-02-15T10:00:00Z' },
  { id: 'cp-3', project_id: PROJECT_ID, user_id: CLIENT_ID, date: '2026-03-10', amount: 10000, currency: 'USD', exchange_rate: 1450, amount_ars: 14500000, payment_method: 'efectivo', description: 'Tercer pago - Albañilería e instalaciones', budget_item_id: 'bi-3', created_at: '2026-03-10T10:00:00Z' },
]

// ============================================
// PROVIDERS
// ============================================
export const mockProviders: Provider[] = [
  { id: 'prov-1', architect_id: ARQ_ID, nombre: 'Carlos', apellido: 'Gómez', rubro: 'Albañilería', telefono: '351-555-0101', email: 'cgomez@mail.com', notas: null, created_at: '2026-01-10T10:00:00Z' },
  { id: 'prov-2', architect_id: ARQ_ID, nombre: 'María', apellido: 'López', rubro: 'Electricidad', telefono: '351-555-0202', email: 'mlopez@mail.com', notas: null, created_at: '2026-01-12T10:00:00Z' },
  { id: 'prov-3', architect_id: ARQ_ID, nombre: 'Hernán', apellido: 'Ruiz', rubro: 'Plomería', telefono: '351-555-0303', email: 'hruiz@mail.com', notas: null, created_at: '2026-01-15T10:00:00Z' },
  { id: 'prov-4', architect_id: ARQ_ID, nombre: 'Corralón', apellido: 'El Constructor', rubro: 'Materiales', telefono: '351-555-0404', email: null, notas: null, created_at: '2026-01-20T10:00:00Z' },
  { id: 'prov-5', architect_id: ARQ_ID, nombre: 'Cerámica', apellido: 'San Lorenzo', rubro: 'Revestimientos', telefono: '351-555-0505', email: null, notas: null, created_at: '2026-02-01T10:00:00Z' },
]
