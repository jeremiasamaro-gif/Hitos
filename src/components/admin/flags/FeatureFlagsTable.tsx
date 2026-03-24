import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import type { FeatureFlag } from '@/lib/supabase'
import { mockFeatureFlags, mockUsers } from '@/store/mockData'

export function FeatureFlagsTable() {
  const [flags, setFlags] = useState<FeatureFlag[]>(mockFeatureFlags)
  const [showCreate, setShowCreate] = useState(false)
  const [editFlag, setEditFlag] = useState<FeatureFlag | null>(null)

  const handleToggleGlobal = (id: string) => {
    const idx = flags.findIndex((f) => f.id === id)
    if (idx >= 0) {
      const updated = [...flags]
      updated[idx] = { ...updated[idx], activo_global: !updated[idx].activo_global }
      setFlags(updated)
      // Update mock
      const mockIdx = mockFeatureFlags.findIndex((f) => f.id === id)
      if (mockIdx >= 0) mockFeatureFlags[mockIdx] = updated[idx]
    }
  }

  const handleDelete = (id: string) => {
    setFlags((prev) => prev.filter((f) => f.id !== id))
    const idx = mockFeatureFlags.findIndex((f) => f.id === id)
    if (idx >= 0) mockFeatureFlags.splice(idx, 1)
  }

  const handleCreate = (data: { nombre: string; descripcion: string }) => {
    const newFlag: FeatureFlag = {
      id: crypto.randomUUID(),
      nombre: data.nombre,
      descripcion: data.descripcion,
      activo_global: false,
      activo_para_usuarios: [],
      activo_para_planes: [],
      created_at: new Date().toISOString(),
    }
    mockFeatureFlags.push(newFlag)
    setFlags([...flags, newFlag])
    setShowCreate(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-secondary">{flags.length} flags configurados</span>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90"
        >
          <Plus size={14} />
          Nueva flag
        </button>
      </div>

      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-secondary text-left text-xs uppercase tracking-wider bg-card">
              <th className="px-3 py-2.5">Nombre</th>
              <th className="px-3 py-2.5">Descripción</th>
              <th className="px-3 py-2.5 text-center">Global</th>
              <th className="px-3 py-2.5">Planes</th>
              <th className="px-3 py-2.5">Usuarios</th>
              <th className="px-3 py-2.5">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => (
              <tr key={flag.id} className="border-b border-border/50 hover:bg-hover/50">
                <td className="px-3 py-2.5 font-mono text-xs font-medium">{flag.nombre}</td>
                <td className="px-3 py-2.5 text-sm text-secondary max-w-[200px] truncate">{flag.descripcion || '—'}</td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    onClick={() => handleToggleGlobal(flag.id)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${flag.activo_global ? 'bg-green-500' : 'bg-border'}`}
                  >
                    <span
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                      style={{ left: flag.activo_global ? 22 : 2 }}
                    />
                  </button>
                </td>
                <td className="px-3 py-2.5">
                  {flag.activo_para_planes.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {flag.activo_para_planes.map((p) => (
                        <span key={p} className="bg-accent/10 text-accent text-[10px] px-1.5 py-0.5 rounded capitalize">{p}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {flag.activo_para_usuarios.length > 0 ? (
                    <span className="text-xs text-secondary">{flag.activo_para_usuarios.length} usuario(s)</span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditFlag(flag)} className="p-1 text-secondary hover:text-accent"><Pencil size={13} /></button>
                    <button onClick={() => handleDelete(flag.id)} className="p-1 text-secondary hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && <CreateFlagModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  )
}

// ── Create Flag Modal ──
function CreateFlagModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: { nombre: string; descripcion: string }) => void }) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const handleSubmit = () => {
    if (!nombre.trim()) return
    onCreate({ nombre: nombre.trim().toLowerCase().replace(/\s+/g, '_'), descripcion: descripcion.trim() })
  }

  return createPortal(
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 9998 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
        borderRadius: 12, padding: 24, width: '100%', maxWidth: 400, zIndex: 9999,
      }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Nueva Feature Flag</h2>
          <button onClick={onClose} className="p-1 text-secondary hover:text-primary"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-secondary block mb-1">Nombre (snake_case)</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm font-mono" placeholder="mi_nueva_flag" />
          </div>
          <div>
            <label className="text-xs text-secondary block mb-1">Descripción</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm resize-none" placeholder="¿Qué hace esta flag?" />
          </div>
          <button onClick={handleSubmit} disabled={!nombre.trim()} className="w-full py-2 rounded-lg text-sm font-medium bg-accent text-white hover:opacity-90 disabled:opacity-40">
            Crear flag
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
