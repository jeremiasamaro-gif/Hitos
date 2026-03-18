import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { Provider } from '@/lib/supabase'
import { updateProvider, deleteProvider } from '@/lib/api/providers'

interface ProveedoresTableProps {
  providers: Provider[]
  onRefresh: () => void
}

type SortKey = 'nombre' | 'apellido' | 'rubro' | 'telefono' | 'email'
type SortDir = 'asc' | 'desc'

export function ProveedoresTable({ providers, onRefresh }: ProveedoresTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Provider>>({})
  const [sortKey, setSortKey] = useState<SortKey>('nombre')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...providers].sort((a, b) => {
    const aVal = (a[sortKey] || '').toString().toLowerCase()
    const bVal = (b[sortKey] || '').toString().toLowerCase()
    return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  const startEdit = (p: Provider) => {
    setEditingId(p.id)
    setEditData({ nombre: p.nombre, apellido: p.apellido, rubro: p.rubro, telefono: p.telefono, email: p.email, notas: p.notas })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData({})
  }

  const saveEdit = async () => {
    if (!editingId) return
    await updateProvider(editingId, editData)
    setEditingId(null)
    setEditData({})
    onRefresh()
  }

  const handleDelete = async (p: Provider) => {
    if (!confirm(`¿Eliminar a ${p.nombre} ${p.apellido || ''}?`)) return
    await deleteProvider(p.id)
    onRefresh()
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'rubro', label: 'Rubro' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
  ]

  if (providers.length === 0) {
    return (
      <div className="text-center py-10">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted mb-3">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="17" y1="11" x2="23" y2="11" />
        </svg>
        <p className="text-sm text-secondary mb-1">Todavía no tenés proveedores registrados</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-secondary text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-2 py-2 cursor-pointer hover:text-primary select-none"
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
            ))}
            <th className="px-2 py-2">Notas</th>
            <th className="px-2 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id} className="border-b border-border/30 hover:bg-hover/30 transition-colors">
              {editingId === p.id ? (
                <>
                  <td className="px-2 py-1.5">
                    <input className="bg-app border border-border rounded px-2 py-1 text-sm w-full" value={editData.nombre || ''} onChange={(e) => setEditData({ ...editData, nombre: e.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input className="bg-app border border-border rounded px-2 py-1 text-sm w-full" value={editData.apellido || ''} onChange={(e) => setEditData({ ...editData, apellido: e.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input className="bg-app border border-border rounded px-2 py-1 text-sm w-full" value={editData.rubro || ''} onChange={(e) => setEditData({ ...editData, rubro: e.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input className="bg-app border border-border rounded px-2 py-1 text-sm w-full" value={editData.telefono || ''} onChange={(e) => setEditData({ ...editData, telefono: e.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input className="bg-app border border-border rounded px-2 py-1 text-sm w-full" value={editData.email || ''} onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input className="bg-app border border-border rounded px-2 py-1 text-sm w-full" value={editData.notas || ''} onChange={(e) => setEditData({ ...editData, notas: e.target.value })} />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={saveEdit} className="p-1 rounded hover:bg-accent/20 text-accent"><Check size={14} /></button>
                      <button onClick={cancelEdit} className="p-1 rounded hover:bg-hover text-secondary"><X size={14} /></button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-2 py-1.5 font-medium">{p.nombre}</td>
                  <td className="px-2 py-1.5">{p.apellido || '—'}</td>
                  <td className="px-2 py-1.5">{p.rubro || '—'}</td>
                  <td className="px-2 py-1.5">{p.telefono || '—'}</td>
                  <td className="px-2 py-1.5">{p.email || '—'}</td>
                  <td className="px-2 py-1.5 text-secondary">{p.notas || '—'}</td>
                  <td className="px-2 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(p)} className="p-1 rounded hover:bg-hover text-secondary hover:text-primary"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p)} className="p-1 rounded hover:bg-red-500/10 text-secondary hover:text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
