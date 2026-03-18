import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useMemberStore } from '@/store/memberStore'
import { useCommentStore } from '@/store/commentStore'
import { useAuthStore } from '@/store/authStore'
import { mockUsers } from '@/store/mockData'
import { formatCurrency, type CurrencyMode } from '@/utils/currency'

interface NotificarPagosModalProps {
  open: boolean
  onClose: () => void
  projectId: string
  budgetItemId: string
  subcategoryName: string
  weekNumber: number | null
  amount: number
  currencyMode: CurrencyMode
  convert: (ars: number) => number
}

export function NotificarPagosModal({
  open,
  onClose,
  projectId,
  budgetItemId,
  subcategoryName,
  weekNumber,
  amount,
  currencyMode,
  convert,
}: NotificarPagosModalProps) {
  const { members, fetchMembers } = useMemberStore()
  const { createComment } = useCommentStore()
  const user = useAuthStore((s) => s.user)

  const [selectedMemberId, setSelectedMemberId] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (open) {
      fetchMembers(projectId)
      const fmt = formatCurrency(convert(amount), currencyMode)
      setMessage(
        `Hola, para la semana ${weekNumber ?? '—'} de obra necesitamos los siguientes pagos: ${subcategoryName} por un total de ${fmt}.`
      )
    }
  }, [open, projectId, fetchMembers, subcategoryName, weekNumber, amount, currencyMode, convert])

  // Filter client members
  const clientMembers = members
    .filter((m) => m.role === 'cliente')
    .map((m) => {
      const u = mockUsers.find((u) => u.id === m.user_id)
      return { memberId: m.user_id, name: u?.name || 'Cliente', email: u?.email || '' }
    })

  useEffect(() => {
    if (clientMembers.length > 0 && !selectedMemberId) {
      setSelectedMemberId(clientMembers[0].memberId)
    }
  }, [clientMembers, selectedMemberId])

  const handleSend = async () => {
    if (!user || !message.trim()) return
    setSending(true)
    try {
      await createComment({
        project_id: projectId,
        budget_item_id: budgetItemId,
        expense_id: null,
        user_id: user.id,
        text: `[Pago requerido] ${message.trim()}`,
        parent_id: null,
      })
      onClose()
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Notificar pagos para ${subcategoryName}`}>
      <div className="flex flex-col gap-4">
        {/* Message */}
        <div>
          <label className="text-sm text-secondary block mb-1">Mensaje</label>
          <textarea
            className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm min-h-[100px] resize-y"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Client selector */}
        <div>
          <label className="text-sm text-secondary block mb-1">Notificar a</label>
          {clientMembers.length === 0 ? (
            <p className="text-xs text-muted">No hay clientes asignados al proyecto</p>
          ) : (
            <select
              className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
            >
              {clientMembers.map((c) => (
                <option key={c.memberId} value={c.memberId}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSend} disabled={sending || !message.trim()}>
            {sending ? 'Enviando...' : 'Enviar notificacion'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
