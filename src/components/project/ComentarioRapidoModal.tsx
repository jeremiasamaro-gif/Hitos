import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useCommentStore } from '@/store/commentStore'
import { useAuthStore } from '@/store/authStore'

interface ComentarioRapidoModalProps {
  open: boolean
  onClose: () => void
}

export function ComentarioRapidoModal({ open, onClose }: ComentarioRapidoModalProps) {
  const { project } = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const { createComment } = useCommentStore()
  const { user } = useAuthStore()

  const [text, setText] = useState('')
  const [budgetItemId, setBudgetItemId] = useState('')
  const [saving, setSaving] = useState(false)

  const categories = useMemo(() => items.filter((i) => !i.parent_id), [items])

  if (!open) return null

  const handlePublish = async () => {
    if (!text.trim() || saving) return
    setSaving(true)
    try {
      await createComment({
        project_id: project.id,
        budget_item_id: budgetItemId || null,
        expense_id: null,
        user_id: user?.id || '',
        text: text.trim(),
        parent_id: null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-heading font-semibold">Agregar nota / comentario</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-hover text-secondary hover:text-primary">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <label className="text-xs text-secondary mb-1 block">Rubro (opcional)</label>
              <select
                value={budgetItemId}
                onChange={(e) => setBudgetItemId(e.target.value)}
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">General</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.description}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-secondary mb-1 block">Comentario</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribir nota o comentario..."
                rows={4}
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handlePublish} disabled={saving || !text.trim()}>
              {saving ? 'Publicando...' : 'Publicar'}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
