import { useState, useCallback } from 'react'
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight, Layers } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CategoryModal } from '@/components/profile/CategoryModal'
import { mockProjects, mockProjectMembers, mockBudgetItems, mockExpenses } from '@/store/mockData'
import type { BudgetItem } from '@/lib/supabase'

type ModalMode = 'crear' | 'editar-categoria' | 'agregar-subcategoria'

interface CategoriasSectionProps {
  projectId?: string | null
}

export function CategoriasSection({ projectId: initialProjectId }: CategoriasSectionProps) {
  const user = useAuthStore((s) => s.user)!
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<ModalMode>('crear')
  const [modalCategoria, setModalCategoria] = useState<BudgetItem | undefined>(undefined)

  // Tree state
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [editingSubName, setEditingSubName] = useState('')

  // Force re-render after mock mutations
  const [, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])

  // Get architect's projects
  const archProjectIds = mockProjectMembers
    .filter((m) => m.user_id === user.id && m.role === 'arquitecto')
    .map((m) => m.project_id)
  const archProjects = mockProjects.filter((p) => archProjectIds.includes(p.id))

  const projectId = selectedProjectId || ''

  // Categories for selected project
  const categories = mockBudgetItems
    .filter((i) => i.project_id === projectId && !i.parent_id)
    .sort((a, b) => (a.item_code || '').localeCompare(b.item_code || '', undefined, { numeric: true }))

  const getChildren = (parentId: string) =>
    mockBudgetItems
      .filter((i) => i.parent_id === parentId)
      .sort((a, b) => (a.item_code || '').localeCompare(b.item_code || '', undefined, { numeric: true }))

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openModal = (mode: ModalMode, categoria?: BudgetItem) => {
    setModalMode(mode)
    setModalCategoria(categoria)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalCategoria(undefined)
    refresh()
  }

  const handleDeleteCategory = (cat: BudgetItem) => {
    const children = getChildren(cat.id)
    const hasExpenses = children.some((c) => mockExpenses.some((e) => e.budget_item_id === c.id))
      || mockExpenses.some((e) => e.budget_item_id === cat.id)

    const message = hasExpenses
      ? `"${cat.description}" tiene gastos asociados. ¿Eliminar de todos modos?`
      : `¿Eliminar "${cat.description}" y todas sus subcategorías?`

    if (!confirm(message)) return

    // Remove children first, then parent
    for (const child of children) {
      const idx = mockBudgetItems.findIndex((i) => i.id === child.id)
      if (idx !== -1) mockBudgetItems.splice(idx, 1)
    }
    const idx = mockBudgetItems.findIndex((i) => i.id === cat.id)
    if (idx !== -1) mockBudgetItems.splice(idx, 1)

    refresh()
  }

  // Inline editing for subcategories
  const startEditSub = (sub: BudgetItem) => {
    setEditingSubId(sub.id)
    setEditingSubName(sub.description)
  }

  const saveEditSub = () => {
    if (!editingSubId || !editingSubName.trim()) {
      setEditingSubId(null)
      return
    }
    const idx = mockBudgetItems.findIndex((i) => i.id === editingSubId)
    if (idx !== -1) {
      mockBudgetItems[idx] = {
        ...mockBudgetItems[idx],
        description: editingSubName.trim(),
        updated_at: new Date().toISOString(),
      }
    }
    setEditingSubId(null)
    setEditingSubName('')
    refresh()
  }

  const cancelEditSub = () => {
    setEditingSubId(null)
    setEditingSubName('')
  }

  const handleSubKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEditSub()
    if (e.key === 'Escape') cancelEditSub()
  }

  const handleDeleteSub = (sub: BudgetItem) => {
    const hasExp = mockExpenses.some((e) => e.budget_item_id === sub.id)
    const message = hasExp
      ? `"${sub.description}" tiene gastos asociados. ¿Eliminar de todos modos?`
      : `¿Eliminar "${sub.description}"?`
    if (!confirm(message)) return

    const idx = mockBudgetItems.findIndex((i) => i.id === sub.id)
    if (idx !== -1) mockBudgetItems.splice(idx, 1)
    refresh()
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers size={20} className="text-accent" />
          <h3 className="text-base font-heading font-semibold">Categorías del presupuesto</h3>
        </div>
        {projectId && (
          <Button size="sm" onClick={() => openModal('crear')}>
            <Plus size={14} />
            Nueva categoría
          </Button>
        )}
      </div>

      {!projectId ? (
        <div>
          <p className="text-sm text-secondary mb-3">
            Seleccioná un proyecto para editar sus categorías
          </p>
          <select
            className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Seleccionar proyecto...</option>
            {archProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          {!initialProjectId && (
            <div className="mb-4">
              <select
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {archProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Category tree */}
          <div className="space-y-1">
            {categories.map((cat) => {
              const children = getChildren(cat.id)
              const isExpanded = expanded.has(cat.id)

              return (
                <div key={cat.id}>
                  {/* Category row */}
                  <div className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group">
                    <button
                      onClick={() => toggleExpand(cat.id)}
                      className="p-0.5 text-secondary hover:text-primary"
                    >
                      {isExpanded ? (
                        <ChevronDown size={14} className="transition-transform duration-150" />
                      ) : (
                        <ChevronRight size={14} className="transition-transform duration-150" />
                      )}
                    </button>

                    <span className="text-xs font-mono text-muted mr-1">{cat.item_code}</span>
                    <span className="text-sm font-medium text-primary flex-1">
                      {cat.description}
                    </span>

                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal('editar-categoria', cat)}
                        className="p-1 text-secondary hover:text-accent"
                        title="Editar categoría"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => openModal('agregar-subcategoria', cat)}
                        className="p-1 text-secondary hover:text-accent"
                        title="Agregar subcategoría"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1 text-secondary hover:text-status-exceeded"
                        title="Eliminar categoría"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Subcategories accordion */}
                  {isExpanded && (
                    <div style={{ paddingLeft: 16 }} className="border-l border-border/50 ml-4">
                      {children.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group"
                        >
                          <span className="text-xs font-mono text-muted mr-1">{sub.item_code}</span>

                          {editingSubId === sub.id ? (
                            <input
                              className="bg-app border border-border rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:border-accent"
                              value={editingSubName}
                              onChange={(e) => setEditingSubName(e.target.value)}
                              onKeyDown={handleSubKeyDown}
                              onBlur={saveEditSub}
                              autoFocus
                            />
                          ) : (
                            <>
                              <span className="text-sm text-primary flex-1">
                                {sub.description}
                              </span>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditSub(sub)}
                                  className="p-1 text-secondary hover:text-accent"
                                  title="Editar nombre"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSub(sub)}
                                  className="p-1 text-secondary hover:text-status-exceeded"
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}

                      {children.length === 0 && (
                        <p className="text-xs text-secondary py-2 px-3">Sin subcategorías</p>
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
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={closeModal}
        mode={modalMode}
        categoria={modalCategoria}
        projectId={projectId}
      />
    </Card>
  )
}
