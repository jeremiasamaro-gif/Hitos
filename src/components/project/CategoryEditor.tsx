import { useState, useMemo, useCallback, useEffect } from 'react'
import { ChevronRight, Plus, Trash2, Check, X } from 'lucide-react'
import { useBudgetStore } from '@/store/budgetStore'
import { suggestNextCode } from '@/lib/budgetUtils'
import type { BudgetItem } from '@/lib/supabase'

interface CategoryEditorProps {
  projectId: string
}

export function CategoryEditor({ projectId }: CategoryEditorProps) {
  const { items, createItem, updateItem, deleteItem, fetchItems } = useBudgetStore()
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Ensure items are loaded for this project
  useEffect(() => {
    fetchItems(projectId)
  }, [projectId, fetchItems])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  // Categories (level 0): no parent
  const categories = useMemo(
    () => items
      .filter((i) => i.project_id === projectId && !i.parent_id)
      .sort((a, b) => (a.item_code || '').localeCompare(b.item_code || '', undefined, { numeric: true })),
    [items, projectId]
  )

  // Subcategories by parent
  const getChildren = useCallback(
    (parentId: string) =>
      items
        .filter((i) => i.parent_id === parentId)
        .sort((a, b) => (a.item_code || '').localeCompare(b.item_code || '', undefined, { numeric: true })),
    [items]
  )

  const hasGrandchildren = useCallback(
    (itemId: string) => items.some((i) => i.parent_id === itemId),
    [items]
  )

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id)
    setEditName(item.description)
  }

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return
    await updateItem(editingId, { description: editName.trim() })
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = async (item: BudgetItem) => {
    if (hasGrandchildren(item.id)) return
    const children = getChildren(item.id)
    if (children.length > 0) return
    if (!confirm(`¿Eliminar "${item.description}"?`)) return
    await deleteItem(item.id)
  }

  const startAdd = (parentId: string) => {
    setAddingTo(parentId)
    setNewName('')
  }

  const saveAdd = async (parentId: string) => {
    if (!newName.trim()) return
    const parent = items.find((i) => i.id === parentId)
    const code = parent ? suggestNextCode(parent.item_code, items) : ''
    await createItem({
      project_id: projectId,
      parent_id: parentId,
      item_code: code,
      description: newName.trim(),
      unit: 'gl',
      quantity: 1,
      gremio: null,
      unit_price: 0,
      total_price: 0,
      category: parent?.category || parent?.description || null,
      week_number: null,
    })
    setAddingTo(null)
    setNewName('')
    // Auto-expand parent
    setExpanded((prev) => new Set(prev).add(parentId))
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') action()
    if (e.key === 'Escape') {
      setEditingId(null)
      setAddingTo(null)
    }
  }

  return (
    <div className="space-y-1">
      {categories.map((cat) => {
        const children = getChildren(cat.id)
        const isExpanded = expanded.has(cat.id)
        const canDelete = children.length === 0

        return (
          <div key={cat.id}>
            {/* Category row */}
            <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group">
              <button
                onClick={() => toggleExpand(cat.id)}
                className="p-0.5 text-secondary hover:text-primary"
              >
                <ChevronRight
                  size={14}
                  className={`transition-transform duration-150 ${isExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              <span className="text-xs font-mono text-muted mr-1">{cat.item_code}</span>

              {editingId === cat.id ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    className="bg-app border border-border rounded px-2 py-1 text-sm flex-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, saveEdit)}
                    autoFocus
                  />
                  <button onClick={saveEdit} className="p-1 text-green-500"><Check size={14} /></button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-secondary"><X size={14} /></button>
                </div>
              ) : (
                <>
                  <span
                    className="text-sm font-medium text-primary flex-1 cursor-pointer"
                    onClick={() => startEdit(cat)}
                  >
                    {cat.description}
                  </span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startAdd(cat.id)}
                      className="p-1 text-secondary hover:text-accent"
                      title="Agregar subcategoría"
                    >
                      <Plus size={14} />
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(cat)}
                        className="p-1 text-secondary hover:text-status-exceeded"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Subcategories */}
            {isExpanded && (
              <div className="ml-6 border-l border-border/50 pl-2">
                {children.map((sub) => {
                  const subCanDelete = !hasGrandchildren(sub.id)
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group"
                    >
                      <span className="text-xs font-mono text-muted mr-1">{sub.item_code}</span>

                      {editingId === sub.id ? (
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            className="bg-app border border-border rounded px-2 py-1 text-sm flex-1"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, saveEdit)}
                            autoFocus
                          />
                          <button onClick={saveEdit} className="p-1 text-green-500"><Check size={14} /></button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-secondary"><X size={14} /></button>
                        </div>
                      ) : (
                        <>
                          <span
                            className="text-sm text-primary flex-1 cursor-pointer"
                            onClick={() => startEdit(sub)}
                          >
                            {sub.description}
                          </span>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {subCanDelete && (
                              <button
                                onClick={() => handleDelete(sub)}
                                className="p-1 text-secondary hover:text-status-exceeded"
                                title="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}

                {/* Add subcategory inline */}
                {addingTo === cat.id && (
                  <div className="flex items-center gap-1 px-3 py-1.5">
                    <input
                      className="bg-app border border-border rounded px-2 py-1 text-sm flex-1"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, () => saveAdd(cat.id))}
                      placeholder="Nombre de subcategoría"
                      autoFocus
                    />
                    <button onClick={() => saveAdd(cat.id)} disabled={!newName.trim()} className="p-1 text-green-500 disabled:opacity-40"><Check size={14} /></button>
                    <button onClick={() => setAddingTo(null)} className="p-1 text-secondary"><X size={14} /></button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {categories.length === 0 && (
        <p className="text-sm text-secondary py-2">Sin categorías en el presupuesto</p>
      )}
    </div>
  )
}
