import type { BudgetItem } from './supabase'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

// ============================================
// TREE TYPES
// ============================================

export interface BudgetTreeNode {
  item: BudgetItem
  children: BudgetTreeNode[]
  level: number // 0 = category, 1 = subcategory, 2 = item, etc.
  total: number // computed sum (own or children)
}

// ============================================
// BUILD TREE from flat budget items
// ============================================

export function buildTree(items: BudgetItem[]): BudgetTreeNode[] {
  const map = new Map<string, BudgetTreeNode>()
  const roots: BudgetTreeNode[] = []

  // Create nodes
  for (const item of items) {
    map.set(item.id, { item, children: [], level: 0, total: item.total_price })
  }

  // Link children to parents
  for (const item of items) {
    const node = map.get(item.id)!
    if (item.parent_id) {
      const parent = map.get(item.parent_id)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  // Set levels and compute totals recursively
  function setLevelsAndTotals(nodes: BudgetTreeNode[], level: number) {
    for (const node of nodes) {
      node.level = level
      if (node.children.length > 0) {
        setLevelsAndTotals(node.children, level + 1)
        node.total = node.children.reduce((sum, c) => sum + c.total, 0)
      } else {
        node.total = node.item.total_price
      }
    }
  }

  setLevelsAndTotals(roots, 0)

  // Sort by item_code
  function sortNodes(nodes: BudgetTreeNode[]) {
    nodes.sort((a, b) => (a.item.item_code || '').localeCompare(b.item.item_code || '', undefined, { numeric: true }))
    for (const n of nodes) sortNodes(n.children)
  }
  sortNodes(roots)

  return roots
}

// ============================================
// CALC TOTALS for a node branch
// ============================================

export function calcNodeTotal(node: BudgetTreeNode): number {
  if (node.children.length === 0) return node.item.total_price
  return node.children.reduce((sum, c) => sum + calcNodeTotal(c), 0)
}

// ============================================
// SUGGEST NEXT CODE
// ============================================

export function suggestNextCode(parentCode: string | null, siblings: BudgetItem[]): string {
  if (!parentCode) {
    // Root level: next integer
    const maxNum = siblings
      .filter((s) => !s.parent_id)
      .map((s) => parseInt(s.item_code || '0', 10))
      .filter((n) => !isNaN(n))
      .reduce((max, n) => Math.max(max, n), 0)
    return String(maxNum + 1)
  }
  // Child level: parent.N
  const prefix = parentCode + '.'
  const maxSub = siblings
    .filter((s) => s.item_code?.startsWith(prefix))
    .map((s) => {
      const sub = s.item_code!.slice(prefix.length)
      return parseInt(sub, 10)
    })
    .filter((n) => !isNaN(n))
    .reduce((max, n) => Math.max(max, n), 0)
  return `${parentCode}.${maxSub + 1}`
}

// ============================================
// PARSE EXCEL (SheetJS)
// ============================================

export interface RawImportRow {
  [key: string]: string | number | undefined
}

export function parseExcel(buffer: ArrayBuffer): { headers: string[]; rows: RawImportRow[] } {
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json<RawImportRow>(ws, { defval: '' })

  if (jsonData.length === 0) return { headers: [], rows: [] }
  const headers = Object.keys(jsonData[0])
  return { headers, rows: jsonData }
}

// ============================================
// PARSE CSV (Papa Parse)
// ============================================

export function parseCsv(text: string): { headers: string[]; rows: RawImportRow[] } {
  const result = Papa.parse<RawImportRow>(text, { header: true, skipEmptyLines: true })
  if (result.data.length === 0) return { headers: [], rows: [] }
  const headers = result.meta.fields || Object.keys(result.data[0])
  return { headers, rows: result.data }
}

// ============================================
// COLUMN MAPPING
// ============================================

export interface ColumnMapping {
  codigo: string
  descripcion: string
  unidad: string
  cantidad: string
  gremio: string
  precioUnitario: string
  total: string // optional
}

// ============================================
// VALIDATION
// ============================================

export type ValidationStatus = 'valid' | 'sin_precio' | 'requerido' | 'duplicado'

export interface ValidatedImportRow {
  code: string
  description: string
  unit: string
  quantity: number
  gremio: string
  unitPrice: number
  total: number
  status: ValidationStatus
}

export function validateImportRows(
  rows: RawImportRow[],
  mapping: ColumnMapping,
  existingCodes: Set<string>
): ValidatedImportRow[] {
  const seenCodes = new Set<string>()

  return rows.map((row) => {
    const code = String(row[mapping.codigo] ?? '').trim()
    const description = String(row[mapping.descripcion] ?? '').trim()
    const unit = String(row[mapping.unidad] ?? '').trim()
    const quantity = parseFloat(String(row[mapping.cantidad] ?? '0')) || 0
    const gremio = String(row[mapping.gremio] ?? '').trim()
    const unitPrice = parseFloat(String(row[mapping.precioUnitario] ?? '0')) || 0
    const mappedTotal = mapping.total ? parseFloat(String(row[mapping.total] ?? '0')) || 0 : 0
    const total = mappedTotal > 0 ? mappedTotal : quantity * unitPrice

    let status: ValidationStatus = 'valid'
    if (!description) {
      status = 'requerido'
    } else if (unitPrice === 0 && total === 0) {
      status = 'sin_precio'
    } else if (existingCodes.has(code) || seenCodes.has(code)) {
      status = 'duplicado'
    }

    seenCodes.add(code)

    return { code, description, unit, quantity, gremio, unitPrice, total, status }
  })
}

// ============================================
// DETERMINE PARENT from code (e.g. "1.2.3" → parent is "1.2")
// ============================================

export function parentCodeFromCode(code: string): string | null {
  const parts = code.split('.')
  if (parts.length <= 1) return null
  return parts.slice(0, -1).join('.')
}

export function levelFromCode(code: string): number {
  return code.split('.').length - 1
}
