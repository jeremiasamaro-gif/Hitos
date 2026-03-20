import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { BudgetItem } from '@/lib/supabase'
import { mockBudgetItems, mockExpenses } from '@/store/mockData'

type ModalMode = 'crear' | 'editar-categoria' | 'agregar-subcategoria'

interface SubcategoryEntry {
  id: string
  name: string
  isNew: boolean
  isModified: boolean
  isDeleted: boolean
  originalName: string
  hasExpenses: boolean
}

interface CategoryModalProps {
  open: boolean
  onClose: () => void
  mode: ModalMode
  categoria?: BudgetItem
  projectId: string
}

let nextId = Date.now()
function genId() {
  return `new-${nextId++}`
}

export function CategoryModal({ open, onClose, mode, categoria, projectId }: CategoryModalProps) {
  const [name, setName] = useState('')
  const [subcategories, setSubcategories] = useState<SubcategoryEntry[]>([])
  const [newSubName, setNewSubName] = useState('')

  useEffect(() => {
    if (!open) return

    if (mode === 'crear') {
      setName('')
      setSubcategories([])
    } else if (mode === 'editar-categoria' && categoria) {
      setName(categoria.description)
      const children = mockBudgetItems.filter((i) => i.parent_id === categoria.id)
      setSubcategories(
        children.map((c) => ({
          id: c.id,
          name: c.description,
          isNew: false,
          isModified: false,
          isDeleted: false,
          originalName: c.description,
          hasExpenses: mockExpenses.some((e) => e.budget_item_id === c.id),
        }))
      )
    } else if (mode === 'agregar-subcategoria') {
      setNewSubName('')
      setSubcategories([])
    }
  }, [open, mode, categoria])

  const addSubcategory = () => {
    setSubcategories((prev) => [
      ...prev,
      {
        id: genId(),
        name: '',
        isNew: true,
        isModified: false,
        isDeleted: false,
        originalName: '',
        hasExpenses: false,
      },
    ])
  }

  const removeSubcategory = (id: string) => {
    setSubcategories((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        if (s.isNew) return { ...s, isDeleted: true }
        return { ...s, isDeleted: !s.isDeleted }
      }).filter((s) => !(s.isNew && s.isDeleted))
    )
  }

  const updateSubcategoryName = (id: string, value: string) => {
    setSubcategories((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        const isModified = !s.isNew && value !== s.originalName
        return { ...s, name: value, isModified }
      })
    )
  }

  const handleCrear = () => {
    if (!name.trim()) return
    const now = new Date().toISOString()
    const parentCode = String(
      mockBudgetItems.filter((i) => i.project_id === projectId && !i.parent_id).length + 1
    )
    const parentId = genId()

    const parent: BudgetItem = {
      id: parentId,
      project_id: projectId,
      parent_id: null,
      item_code: parentCode,
      description: name.trim(),
      unit: 'gl',
      quantity: 1,
      rubro: null,
      unit_price: 0,
      total_price: 0,
      category: name.trim(),
      week_number: null,
      created_at: now,
      updated_at: now,
    }
    mockBudgetItems.push(parent)

    subcategories
      .filter((s) => s.name.trim())
      .forEach((s, idx) => {
        const child: BudgetItem = {
          id: genId(),
          project_id: projectId,
          parent_id: parentId,
          item_code: `${parentCode}.${idx + 1}`,
          description: s.name.trim(),
          unit: 'gl',
          quantity: 1,
          rubro: null,
          unit_price: 0,
          total_price: 0,
          category: name.trim(),
          week_number: null,
          created_at: now,
          updated_at: now,
        }
        mockBudgetItems.push(child)
      })

    onClose()
  }

  const handleGuardar = () => {
    if (!categoria || !name.trim()) return
    const now = new Date().toISOString()

    // Update parent description
    const parentIdx = mockBudgetItems.findIndex((i) => i.id === categoria.id)
    if (parentIdx !== -1) {
      mockBudgetItems[parentIdx] = {
        ...mockBudgetItems[parentIdx],
        description: name.trim(),
        category: name.trim(),
        updated_at: now,
      }
    }

    // Handle subcategory changes
    for (const sub of subcategories) {
      if (sub.isDeleted && !sub.isNew) {
        const idx = mockBudgetItems.findIndex((i) => i.id === sub.id)
        if (idx !== -1) mockBudgetItems.splice(idx, 1)
      } else if (sub.isNew && !sub.isDeleted && sub.name.trim()) {
        const parentCode = categoria.item_code || ''
        const existingChildren = mockBudgetItems.filter((i) => i.parent_id === categoria.id)
        const childCode = `${parentCode}.${existingChildren.length + 1}`
        mockBudgetItems.push({
          id: genId(),
          project_id: projectId,
          parent_id: categoria.id,
          item_code: childCode,
          description: sub.name.trim(),
          unit: 'gl',
          quantity: 1,
          rubro: null,
          unit_price: 0,
          total_price: 0,
          category: name.trim(),
          week_number: null,
          created_at: now,
          updated_at: now,
        })
      } else if (sub.isModified && sub.name.trim()) {
        const idx = mockBudgetItems.findIndex((i) => i.id === sub.id)
        if (idx !== -1) {
          mockBudgetItems[idx] = {
            ...mockBudgetItems[idx],
            description: sub.name.trim(),
            updated_at: now,
          }
        }
      }
    }

    onClose()
  }

  const handleAgregar = () => {
    if (!categoria || !newSubName.trim()) return
    const now = new Date().toISOString()
    const parentCode = categoria.item_code || ''
    const existingChildren = mockBudgetItems.filter((i) => i.parent_id === categoria.id)
    const childCode = `${parentCode}.${existingChildren.length + 1}`

    mockBudgetItems.push({
      id: genId(),
      project_id: projectId,
      parent_id: categoria.id,
      item_code: childCode,
      description: newSubName.trim(),
      unit: 'gl',
      quantity: 1,
      rubro: null,
      unit_price: 0,
      total_price: 0,
      category: categoria.description,
      week_number: null,
      created_at: now,
      updated_at: now,
    })

    onClose()
  }

  const title =
    mode === 'crear'
      ? 'Nueva categoría'
      : mode === 'editar-categoria'
        ? 'Editar categoría'
        : `Agregar subcategorías a ${categoria?.description ?? ''}`

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {mode === 'crear' && (
        <div className="space-y-4">
          <Input
            label="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Instalaciones"
            autoFocus
            required
          />

          <div className="space-y-2">
            <label className="text-sm text-secondary">Subcategorías</label>
            {subcategories.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <Input
                  value={sub.name}
                  onChange={(e) => updateSubcategoryName(sub.id, e.target.value)}
                  placeholder="Nombre de subcategoría"
                  className="flex-1"
                />
                <button
                  onClick={() => removeSubcategory(sub.id)}
                  className="text-secondary hover:text-status-exceeded transition-colors text-lg px-1"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              onClick={addSubcategory}
              className="text-sm text-accent hover:text-accent-dark transition-colors"
            >
              + Agregar subcategoría
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleCrear} disabled={!name.trim()}>
              Crear categoría
            </Button>
          </div>
        </div>
      )}

      {mode === 'editar-categoria' && categoria && (
        <div className="space-y-4">
          <Input
            label="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
          />

          <div className="space-y-2">
            <label className="text-sm text-secondary">Subcategorías</label>
            {subcategories.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <Input
                  value={sub.name}
                  onChange={(e) => updateSubcategoryName(sub.id, e.target.value)}
                  placeholder="Nombre de subcategoría"
                  className="flex-1"
                  disabled={sub.isDeleted}
                />
                <div className="flex items-center gap-1">
                  {sub.isModified && !sub.isDeleted && (
                    <Badge variant="default">Modificado</Badge>
                  )}
                  {sub.isNew && !sub.isDeleted && (
                    <Badge variant="success">Nuevo</Badge>
                  )}
                  {sub.isDeleted && (
                    <Badge variant="danger">Eliminar</Badge>
                  )}
                </div>
                <button
                  onClick={() => removeSubcategory(sub.id)}
                  className="text-secondary hover:text-status-exceeded transition-colors text-lg px-1"
                  title={
                    sub.isDeleted
                      ? 'Restaurar'
                      : sub.hasExpenses
                        ? 'Tiene gastos asociados'
                        : 'Eliminar'
                  }
                >
                  &times;
                </button>
                {!sub.isDeleted && sub.hasExpenses && (
                  <span className="text-xs text-status-warning">Tiene gastos</span>
                )}
              </div>
            ))}
            <button
              onClick={addSubcategory}
              className="text-sm text-accent hover:text-accent-dark transition-colors"
            >
              + Agregar subcategoría
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleGuardar} disabled={!name.trim()}>
              Guardar cambios
            </Button>
          </div>
        </div>
      )}

      {mode === 'agregar-subcategoria' && categoria && (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-secondary block mb-1">Categoría padre</label>
            <Badge variant="accent">{categoria.description}</Badge>
          </div>

          <Input
            label="Nombre de la subcategoría"
            value={newSubName}
            onChange={(e) => setNewSubName(e.target.value)}
            placeholder="Ej: Instalación eléctrica"
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleAgregar} disabled={!newSubName.trim()}>
              Agregar
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
