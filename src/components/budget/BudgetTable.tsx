import { useState, useCallback, useRef, useEffect } from 'react'
import { Pencil, Trash2, Plus, Check, X, Bell } from 'lucide-react'
import type { BudgetItem } from '@/lib/supabase'
import type { BudgetTreeNode } from '@/lib/budgetUtils'
import { suggestNextCode } from '@/lib/budgetUtils'
import { formatCurrency, type CurrencyMode } from '@/utils/currency'
import { NotificarPagosModal } from './NotificarPagosModal'

interface BudgetTableProps {
  tree: BudgetTreeNode[]
  allItems: BudgetItem[]
  currencyMode: CurrencyMode
  convert: (ars: number) => number
  onUpdate: (id: string, data: Partial<BudgetItem>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onAddChild: (parentId: string) => void
  onInlineAdd?: (data: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  projectId?: string
}

interface EditState {
  id: string
  description: string
  unit: string
  quantity: string
  gremio: string
  unit_price: string
}

interface InlineAddState {
  parentId: string
  code: string
  description: string
  unit: string
  quantity: string
  gremio: string
  unitPrice: string
}

export function BudgetTable({ tree, allItems, currencyMode, convert, onUpdate, onDelete, onAddChild, onInlineAdd, projectId }: BudgetTableProps) {
  const [editRow, setEditRow] = useState<EditState | null>(null)
  const [inlineAdd, setInlineAdd] = useState<InlineAddState | null>(null)
  const [notifyItem, setNotifyItem] = useState<BudgetTreeNode | null>(null)

  const startEdit = useCallback((node: BudgetTreeNode) => {
    setEditRow({
      id: node.item.id,
      description: node.item.description,
      unit: node.item.unit || '',
      quantity: String(node.item.quantity),
      gremio: node.item.gremio || '',
      unit_price: String(node.item.unit_price),
    })
  }, [])

  const cancelEdit = () => setEditRow(null)

  const saveEdit = async () => {
    if (!editRow) return
    const qty = parseFloat(editRow.quantity) || 0
    const price = parseFloat(editRow.unit_price) || 0
    await onUpdate(editRow.id, {
      description: editRow.description,
      unit: editRow.unit || null,
      quantity: qty,
      gremio: editRow.gremio || null,
      unit_price: price,
      total_price: qty * price,
    })
    setEditRow(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar este ítem y sus hijos?')) {
      await onDelete(id)
    }
  }

  const startInlineAdd = useCallback((parentId: string) => {
    if (onInlineAdd && projectId) {
      const parent = allItems.find((i) => i.id === parentId)
      const code = parent ? suggestNextCode(parent.item_code, allItems) : ''
      setInlineAdd({
        parentId,
        code,
        description: '',
        unit: '',
        quantity: '',
        gremio: '',
        unitPrice: '',
      })
    } else {
      onAddChild(parentId)
    }
  }, [onInlineAdd, projectId, allItems, onAddChild])

  const fmt = (ars: number) => formatCurrency(convert(ars), currencyMode)

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-secondary text-left">
              <th className="px-3 py-2 w-20">Cod.</th>
              <th className="px-3 py-2">Descripcion</th>
              <th className="px-3 py-2 w-16">Ud.</th>
              <th className="px-3 py-2 w-20 text-right">Cant.</th>
              <th className="px-3 py-2 w-28">Gremio</th>
              <th className="px-3 py-2 w-28 text-right">P. Unit.</th>
              <th className="px-3 py-2 w-32 text-right">Total</th>
              <th className="px-3 py-2 w-24 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tree.map((node) => (
              <CategoryGroup
                key={node.item.id}
                node={node}
                editRow={editRow}
                setEditRow={setEditRow}
                startEdit={startEdit}
                cancelEdit={cancelEdit}
                saveEdit={saveEdit}
                handleKeyDown={handleKeyDown}
                handleDelete={handleDelete}
                onAddChild={startInlineAdd}
                fmt={fmt}
                inlineAdd={inlineAdd}
                setInlineAdd={setInlineAdd}
                onInlineAdd={onInlineAdd}
                projectId={projectId}
                allItems={allItems}
                onNotify={setNotifyItem}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Notify modal */}
      {notifyItem && projectId && (
        <NotificarPagosModal
          open={!!notifyItem}
          onClose={() => setNotifyItem(null)}
          projectId={projectId}
          budgetItemId={notifyItem.item.id}
          subcategoryName={notifyItem.item.description}
          weekNumber={notifyItem.item.week_number}
          amount={notifyItem.total}
          currencyMode={currencyMode}
          convert={convert}
        />
      )}
    </>
  )
}

// ============================================
// CATEGORY GROUP (parent + children rows)
// ============================================

interface GroupProps {
  node: BudgetTreeNode
  editRow: EditState | null
  setEditRow: (s: EditState | null) => void
  startEdit: (n: BudgetTreeNode) => void
  cancelEdit: () => void
  saveEdit: () => Promise<void>
  handleKeyDown: (e: React.KeyboardEvent) => void
  handleDelete: (id: string) => Promise<void>
  onAddChild: (parentId: string) => void
  fmt: (ars: number) => string
  inlineAdd: InlineAddState | null
  setInlineAdd: (s: InlineAddState | null) => void
  onInlineAdd?: (data: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  projectId?: string
  allItems: BudgetItem[]
  onNotify?: (node: BudgetTreeNode) => void
}

function CategoryGroup({ node, editRow, setEditRow, startEdit, cancelEdit, saveEdit, handleKeyDown, handleDelete, onAddChild, fmt, inlineAdd, setInlineAdd, onInlineAdd, projectId, allItems, onNotify }: GroupProps) {
  const isEditing = editRow?.id === node.item.id
  const isCategory = node.level === 0
  const isSub = node.level === 1
  const showInlineAdd = inlineAdd?.parentId === node.item.id

  // Row styles by level
  const rowBg = isCategory ? 'bg-[#F0EFFE]' : isSub ? 'bg-[#F7F6F1]' : 'bg-white'
  const borderStyle = isCategory
    ? { borderLeft: '3px solid var(--color-accent)' }
    : isSub
    ? { borderLeft: '3px solid #C7D2FE' }
    : {}
  const codeColor = isCategory ? 'text-[var(--color-accent)]' : 'text-secondary'
  const descClass = isCategory
    ? 'font-bold text-[var(--color-accent)]'
    : isSub
    ? 'font-semibold text-[#4338CA]'
    : 'font-normal text-primary'

  return (
    <>
      {/* Category/Subcategory row */}
      <tr className={`border-b border-border/50 ${rowBg}`} style={borderStyle}>
        <td className={`px-3 py-2 font-mono text-xs ${codeColor}`}>{node.item.item_code}</td>
        <td className={`px-3 py-2 ${descClass}`} style={{ paddingLeft: `${12 + node.level * 16}px` }}>
          {isEditing ? (
            <input
              className="bg-app border border-border rounded px-2 py-1 text-sm w-full"
              value={editRow!.description}
              onChange={(e) => setEditRow({ ...editRow!, description: e.target.value })}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          ) : (
            <span className="flex items-center gap-2 group/desc">
              {node.item.description}
              {/* Week badge for subcategories */}
              {isSub && node.item.week_number != null && (
                <span className="bg-[#EEF2FF] text-[var(--color-accent)] rounded-full text-[11px] px-2 py-0.5 font-normal shrink-0">
                  Semana {node.item.week_number}
                </span>
              )}
              {/* Notify button for subcategories */}
              {isSub && onNotify && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNotify(node) }}
                  className="opacity-0 group-hover/desc:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-secondary hover:text-accent shrink-0 ml-auto"
                  title="Notificar pagos"
                >
                  <Bell size={12} />
                  <span>Notificar</span>
                </button>
              )}
            </span>
          )}
        </td>
        {node.children.length > 0 ? (
          <>
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className="px-3 py-2" />
            <td className={`px-3 py-2 text-right font-mono ${isCategory ? 'font-bold' : 'font-semibold'}`}>{fmt(node.total)}</td>
          </>
        ) : (
          <>
            <td className="px-3 py-2 text-secondary">
              {isEditing ? (
                <input className="bg-app border border-border rounded px-2 py-1 text-sm w-14" value={editRow!.unit} onChange={(e) => setEditRow({ ...editRow!, unit: e.target.value })} onKeyDown={handleKeyDown} />
              ) : (
                node.item.unit
              )}
            </td>
            <td className="px-3 py-2 text-right font-mono">
              {isEditing ? (
                <input className="bg-app border border-border rounded px-2 py-1 text-sm w-16 text-right" type="number" value={editRow!.quantity} onChange={(e) => setEditRow({ ...editRow!, quantity: e.target.value })} onKeyDown={handleKeyDown} />
              ) : (
                node.item.quantity
              )}
            </td>
            <td className="px-3 py-2 text-secondary text-xs">
              {isEditing ? (
                <input className="bg-app border border-border rounded px-2 py-1 text-sm w-full" value={editRow!.gremio} onChange={(e) => setEditRow({ ...editRow!, gremio: e.target.value })} onKeyDown={handleKeyDown} />
              ) : (
                node.item.gremio || '—'
              )}
            </td>
            <td className="px-3 py-2 text-right font-mono">
              {isEditing ? (
                <input className="bg-app border border-border rounded px-2 py-1 text-sm w-24 text-right" type="number" value={editRow!.unit_price} onChange={(e) => setEditRow({ ...editRow!, unit_price: e.target.value })} onKeyDown={handleKeyDown} />
              ) : (
                fmt(node.item.unit_price)
              )}
            </td>
            <td className="px-3 py-2 text-right font-mono font-semibold">{isEditing ? fmt(parseFloat(editRow!.quantity || '0') * parseFloat(editRow!.unit_price || '0')) : fmt(node.item.total_price)}</td>
          </>
        )}
        <td className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1">
            {isEditing ? (
              <>
                <button onClick={saveEdit} className="p-1 text-green-400 hover:text-green-300"><Check size={14} /></button>
                <button onClick={cancelEdit} className="p-1 text-secondary hover:text-primary"><X size={14} /></button>
              </>
            ) : (
              <>
                <button onClick={() => startEdit(node)} className="p-1 text-secondary hover:text-accent"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(node.item.id)} className="p-1 text-secondary hover:text-status-exceeded"><Trash2 size={14} /></button>
              </>
            )}
          </div>
        </td>
      </tr>

      {/* Children */}
      {node.children.map((child) => (
        <CategoryGroup
          key={child.item.id}
          node={child}
          editRow={editRow}
          setEditRow={setEditRow}
          startEdit={startEdit}
          cancelEdit={cancelEdit}
          saveEdit={saveEdit}
          handleKeyDown={handleKeyDown}
          handleDelete={handleDelete}
          onAddChild={onAddChild}
          fmt={fmt}
          inlineAdd={inlineAdd}
          setInlineAdd={setInlineAdd}
          onInlineAdd={onInlineAdd}
          projectId={projectId}
          allItems={allItems}
          onNotify={onNotify}
        />
      ))}

      {/* Inline add row */}
      {showInlineAdd && onInlineAdd && projectId && (
        <InlineAddRow
          state={inlineAdd!}
          setState={setInlineAdd}
          onSave={onInlineAdd}
          projectId={projectId}
          parentId={node.item.id}
          parentCategory={node.item.category}
          level={node.level}
          fmt={fmt}
        />
      )}

      {/* Add child button at end of category/subcategory */}
      {node.children.length > 0 && (
        <tr className="border-b border-border/30">
          <td colSpan={8}>
            <button
              onClick={() => onAddChild(node.item.id)}
              className="flex items-center gap-1 text-xs text-secondary hover:text-accent px-3 py-1.5 transition-colors"
              style={{ paddingLeft: `${28 + node.level * 16}px` }}
            >
              <Plus size={12} />
              Agregar item en {node.item.description}
            </button>
          </td>
        </tr>
      )}
    </>
  )
}

// ============================================
// INLINE ADD ROW
// ============================================

interface InlineAddRowProps {
  state: InlineAddState
  setState: (s: InlineAddState | null) => void
  onSave: (data: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  projectId: string
  parentId: string
  parentCategory: string | null
  level: number
  fmt: (ars: number) => string
}

function InlineAddRow({ state, setState, onSave, projectId, parentId, parentCategory, level, fmt }: InlineAddRowProps) {
  const descRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    descRef.current?.focus()
  }, [])

  const qty = parseFloat(state.quantity) || 0
  const price = parseFloat(state.unitPrice) || 0
  const total = qty * price

  const update = (patch: Partial<InlineAddState>) => setState({ ...state, ...patch })

  const handleSave = async () => {
    if (!state.description.trim() || saving) return
    setSaving(true)
    try {
      await onSave({
        project_id: projectId,
        parent_id: parentId,
        item_code: state.code,
        description: state.description.trim(),
        unit: state.unit || null,
        quantity: qty,
        gremio: state.gremio || null,
        unit_price: price,
        total_price: total,
        category: parentCategory,
        week_number: null,
      })
      setState(null)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setState(null)
  }

  return (
    <tr className="border-b border-accent/30 bg-accent/5">
      <td className="px-3 py-1.5">
        <input
          className="bg-app border border-border rounded px-2 py-1 text-sm w-full font-mono text-xs"
          value={state.code}
          onChange={(e) => update({ code: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Cod."
        />
      </td>
      <td className="px-3 py-1.5" style={{ paddingLeft: `${12 + (level + 1) * 16}px` }}>
        <input
          ref={descRef}
          className="bg-app border border-border rounded px-2 py-1 text-sm w-full"
          value={state.description}
          onChange={(e) => update({ description: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Descripción"
        />
      </td>
      <td className="px-3 py-1.5">
        <input
          className="bg-app border border-border rounded px-2 py-1 text-sm w-14"
          value={state.unit}
          onChange={(e) => update({ unit: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Ud."
        />
      </td>
      <td className="px-3 py-1.5">
        <input
          className="bg-app border border-border rounded px-2 py-1 text-sm w-16 text-right"
          type="number"
          value={state.quantity}
          onChange={(e) => update({ quantity: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="0"
        />
      </td>
      <td className="px-3 py-1.5">
        <input
          className="bg-app border border-border rounded px-2 py-1 text-sm w-full"
          value={state.gremio}
          onChange={(e) => update({ gremio: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Gremio"
        />
      </td>
      <td className="px-3 py-1.5">
        <input
          className="bg-app border border-border rounded px-2 py-1 text-sm w-24 text-right"
          type="number"
          value={state.unitPrice}
          onChange={(e) => update({ unitPrice: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="0"
        />
      </td>
      <td className="px-3 py-1.5 text-right font-mono text-sm text-muted">
        {total > 0 ? fmt(total) : '—'}
      </td>
      <td className="px-3 py-1.5 text-center">
        <div className="flex items-center justify-center gap-1">
          <button onClick={handleSave} disabled={saving || !state.description.trim()} className="p-1 text-green-500 hover:text-green-400 disabled:opacity-40"><Check size={14} /></button>
          <button onClick={() => setState(null)} className="p-1 text-secondary hover:text-primary"><X size={14} /></button>
        </div>
      </td>
    </tr>
  )
}
