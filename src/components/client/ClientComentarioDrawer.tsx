import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Send } from 'lucide-react'
import { useCommentStore } from '@/store/commentStore'
import { useAuthStore } from '@/store/authStore'
import { mockUsers } from '@/store/mockData'

interface ClientComentarioDrawerProps {
  open: boolean
  onClose: () => void
  projectId: string
  budgetItemId: string
  budgetItemName: string
}

export function ClientComentarioDrawer({ open, onClose, projectId, budgetItemId, budgetItemName }: ClientComentarioDrawerProps) {
  const [text, setText] = useState('')
  const comments = useCommentStore((s) => s.comments)
  const createComment = useCommentStore((s) => s.createComment)
  const { user } = useAuthStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  const itemComments = comments
    .filter((c) => c.budget_item_id === budgetItemId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, itemComments.length])

  const handleSend = () => {
    if (!text.trim() || !user) return
    createComment({
      project_id: projectId,
      budget_item_id: budgetItemId,
      expense_id: null,
      user_id: user.id,
      text: text.trim(),
      parent_id: null,
    })
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!open) return null

  const getUserName = (userId: string) => {
    const u = mockUsers.find((mu) => mu.id === userId)
    return u?.name ?? 'Usuario'
  }

  const getUserInitial = (userId: string) => {
    return getUserName(userId).charAt(0).toUpperCase()
  }

  const getUserColor = (userId: string) => {
    const u = mockUsers.find((mu) => mu.id === userId)
    return u?.role === 'arquitecto' ? 'var(--color-accent)' : '#10B981'
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) + ' ' +
      d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 9998,
        }}
      />
      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 420,
          background: 'var(--color-bg-card)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onClose} className="p-1 text-secondary hover:text-primary transition-colors">
            <X size={18} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-medium truncate">Comentarios</h2>
            <p className="text-xs text-secondary truncate">{budgetItemName}</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {itemComments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-secondary">No hay comentarios aún</p>
              <p className="text-xs text-muted mt-1">Escribí un mensaje para iniciar la conversación</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itemComments.map((c) => {
                const isMe = c.user_id === user?.id
                return (
                  <div key={c.id} className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-medium"
                      style={{ background: getUserColor(c.user_id) }}
                    >
                      {getUserInitial(c.user_id)}
                    </div>
                    <div className={`max-w-[75%] ${isMe ? 'text-right' : ''}`}>
                      <div className="flex items-baseline gap-2 mb-0.5" style={{ flexDirection: isMe ? 'row-reverse' : 'row' }}>
                        <span className="text-xs font-medium">{getUserName(c.user_id)}</span>
                        <span className="text-[10px] text-muted">{formatTime(c.created_at)}</span>
                      </div>
                      <div
                        className="rounded-lg px-3 py-2 text-sm"
                        style={{
                          background: isMe ? 'var(--color-accent)' : 'var(--color-bg-app)',
                          color: isMe ? '#fff' : 'var(--color-text-primary)',
                        }}
                      >
                        {c.text}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)' }}>
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribí un comentario..."
              rows={1}
              className="flex-1 bg-app border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-accent"
              style={{ minHeight: 38, maxHeight: 100 }}
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="p-2 rounded-lg transition-colors disabled:opacity-40"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
