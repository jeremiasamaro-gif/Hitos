import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { useMemberStore } from '@/store/memberStore'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { ObraType } from '@/lib/supabase'

const OBRA_TYPES: ObraType[] = ['Obra nueva', 'Refacción', 'Ampliación', 'Remodelación', 'Otro']

interface Props {
  open: boolean
  onClose: () => void
}

function diffWeeks(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.round(ms / (7 * 24 * 60 * 60 * 1000)))
}

export function CreateProjectModal({ open, onClose }: Props) {
  const createProject = useProjectStore((s) => s.createProject)
  const { inviteMember } = useMemberStore()
  const user = useAuthStore((s) => s.user)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [tcBlue, setTcBlue] = useState('1420')
  const [obraType, setObraType] = useState<ObraType | ''>('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [weeksEstimated, setWeeksEstimated] = useState('')
  const [weeksManual, setWeeksManual] = useState(false)
  const [clientEmail, setClientEmail] = useState('')
  const [loading, setLoading] = useState(false)

  // Auto-calculate weeks from dates
  useEffect(() => {
    if (!weeksManual && startDate && endDate) {
      const w = diffWeeks(startDate, endDate)
      setWeeksEstimated(String(w))
    }
  }, [startDate, endDate, weeksManual])

  const handleWeeksChange = (val: string) => {
    setWeeksManual(true)
    setWeeksEstimated(val)
  }

  const resetForm = () => {
    setName('')
    setAddress('')
    setTcBlue('1420')
    setObraType('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setWeeksEstimated('')
    setWeeksManual(false)
    setClientEmail('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    try {
      const project = await createProject({
        name,
        address: address || undefined,
        architect_id: user.id,
        obra_type: obraType || undefined,
        description: description || undefined,
        start_date: startDate || undefined,
        end_date_estimated: endDate || undefined,
        weeks_estimated: weeksEstimated ? parseInt(weeksEstimated) : undefined,
      })

      // Auto-invite client if email provided
      if (clientEmail.trim() && project) {
        try {
          await inviteMember({ project_id: project.id, email: clientEmail.trim(), role: 'cliente' })
        } catch {
          // Invitation is best-effort
        }
      }

      onClose()
      resetForm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Proyecto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        <Input label="Nombre del proyecto" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Direccion" value={address} onChange={(e) => setAddress(e.target.value)} />

        {/* Tipo de obra */}
        <div>
          <label className="text-sm text-secondary block mb-1">Tipo de obra</label>
          <select
            className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
            value={obraType}
            onChange={(e) => setObraType(e.target.value as ObraType)}
          >
            <option value="">Seleccionar...</option>
            {OBRA_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Descripcion */}
        <div>
          <label className="text-sm text-secondary block mb-1">
            Descripcion <span className="text-muted">(opcional, max 200)</span>
          </label>
          <textarea
            className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm resize-none"
            rows={2}
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripcion del proyecto"
          />
          <p className="text-[11px] text-muted text-right mt-0.5">{description.length}/200</p>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha de inicio" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="Fecha fin estimada" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        {/* Semanas estimadas */}
        <Input
          label="Semanas estimadas"
          type="number"
          value={weeksEstimated}
          onChange={(e) => handleWeeksChange(e.target.value)}
          placeholder={startDate && endDate ? 'Calculado automaticamente' : '0'}
        />

        {/* Exchange rate */}
        <Input label="TC Blue" type="number" value={tcBlue} onChange={(e) => setTcBlue(e.target.value)} />

        {/* Client email */}
        <Input
          label="Email del cliente"
          type="email"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          placeholder="Se enviara una invitacion al proyecto"
        />

        <Button type="submit" disabled={loading || !name.trim()}>
          {loading ? 'Creando...' : 'Crear proyecto'}
        </Button>
      </form>
    </Modal>
  )
}
