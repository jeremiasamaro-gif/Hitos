import { useEffect } from 'react'
import { X } from 'lucide-react'
import { CommentThread } from './CommentThread'
import { useCommentStore } from '@/store/commentStore'

interface Props {
  open: boolean
  onClose: () => void
  projectId: string
  budgetItemId: string
  title: string
}

export function ComentariosDrawer({ open, onClose, projectId, budgetItemId, title }: Props) {
  const markAsRead = useCommentStore((s) => s.markAsRead)

  useEffect(() => {
    if (open && budgetItemId) {
      markAsRead(budgetItemId)
    }
  }, [open, budgetItemId, markAsRead])

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-card border-l border-border z-50 flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="min-w-0">
            <h3 className="text-sm font-heading font-semibold truncate">{title}</h3>
            <p className="text-xs text-secondary">Comentarios</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-secondary hover:text-primary transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {open && (
            <CommentThread
              projectId={projectId}
              budgetItemId={budgetItemId}
            />
          )}
        </div>
      </div>
    </>
  )
}
