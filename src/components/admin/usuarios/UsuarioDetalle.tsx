import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, UserCheck, Ban } from 'lucide-react'
import type { User, UserEstado, UserPlan } from '@/lib/supabase'
import { EstadoBadge } from './EstadoBadge'
import { mockActivityLogs, mockUsers } from '@/store/mockData'

interface UsuarioDetalleProps {
  user: User
  onClose: () => void
  onImpersonate: (user: User) => void
}

const ESTADOS: UserEstado[] = ['activo', 'suspendido', 'trial', 'churned', 'vip']
const PLANES: UserPlan[] = ['gratis', 'seguimiento', 'control', 'pro']

export function UsuarioDetalle({ user, onClose, onImpersonate }: UsuarioDetalleProps) {
  const [estado, setEstado] = useState(user.estado)
  const [plan, setPlan] = useState(user.plan)
  const [notas, setNotas] = useState(user.notas_admin || '')
  const [responsable, setResponsable] = useState(user.responsable_seguimiento || '')

  const logs = mockActivityLogs
    .filter((l) => l.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)

  const handleSave = () => {
    const idx = mockUsers.findIndex((u) => u.id === user.id)
    if (idx >= 0) {
      mockUsers[idx] = {
        ...mockUsers[idx],
        estado,
        plan,
        notas_admin: notas || null,
        responsable_seguimiento: responsable || null,
      }
    }
    onClose()
  }

  const handleSuspend = () => {
    setEstado('suspendido')
    const idx = mockUsers.findIndex((u) => u.id === user.id)
    if (idx >= 0) {
      mockUsers[idx] = { ...mockUsers[idx], estado: 'suspendido' }
    }
  }

  const formatTime = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }) + ' ' +
      date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  const actionLabels: Record<string, string> = {
    create_expense: 'Creó gasto',
    export_pdf: 'Exportó PDF',
    create_comment: 'Comentó',
    create_project: 'Creó proyecto',
    invite_client: 'Invitó cliente',
  }

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9998 }} />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: 440,
          background: 'var(--color-bg-card)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
              style={{ background: user.role === 'arquitecto' ? 'var(--color-accent)' : '#10B981' }}
            >
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-medium">{user.name}</h2>
              <p className="text-xs text-secondary">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-secondary hover:text-primary"><X size={18} /></button>
        </div>

        {/* Fields */}
        <div className="p-5 space-y-4">
          {/* Estado */}
          <div>
            <label className="text-xs text-secondary uppercase tracking-wider block mb-1">Estado</label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value as UserEstado)}
              className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
            >
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Plan */}
          <div>
            <label className="text-xs text-secondary uppercase tracking-wider block mb-1">Plan</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as UserPlan)}
              className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
            >
              {PLANES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="text-xs text-secondary uppercase tracking-wider block mb-1">Notas internas</label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm resize-none"
              placeholder="Solo visible para admins..."
            />
          </div>

          {/* Responsable */}
          <div>
            <label className="text-xs text-secondary uppercase tracking-wider block mb-1">Responsable seguimiento</label>
            <input
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
              className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Nombre del responsable"
            />
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-app rounded-lg p-3">
              <p className="text-[10px] text-secondary uppercase">Rol</p>
              <p className="text-sm font-medium capitalize">{user.role}</p>
            </div>
            <div className="bg-app rounded-lg p-3">
              <p className="text-[10px] text-secondary uppercase">Pipeline</p>
              <p className="text-sm font-medium capitalize">{user.pipeline_estado.replace('_', ' ')}</p>
            </div>
            <div className="bg-app rounded-lg p-3">
              <p className="text-[10px] text-secondary uppercase">Registro</p>
              <p className="text-sm font-mono">{formatTime(user.created_at)}</p>
            </div>
            <div className="bg-app rounded-lg p-3">
              <p className="text-[10px] text-secondary uppercase">Último login</p>
              <p className="text-sm font-mono">{user.last_sign_in ? formatTime(user.last_sign_in) : '—'}</p>
            </div>
          </div>

          {/* Activity */}
          <div>
            <h3 className="text-xs text-secondary uppercase tracking-wider mb-2">Actividad reciente</h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-muted">Sin actividad registrada</p>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between bg-app rounded px-2.5 py-1.5">
                    <span className="text-xs">{actionLabels[log.action] || log.action}</span>
                    <span className="text-[10px] text-muted font-mono">{formatTime(log.created_at)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <button
              onClick={() => onImpersonate(user)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
            >
              <UserCheck size={14} />
              Impersonar
            </button>
            <button
              onClick={handleSuspend}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <Ban size={14} />
              Suspender
            </button>
            <button
              onClick={handleSave}
              className="ml-auto px-4 py-2 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 transition-opacity"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
