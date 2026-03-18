import { useState, useEffect, type FormEvent } from 'react'
import { Plus, Search, Users } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ProveedoresTable } from './ProveedoresTable'
import { getProviders, createProvider } from '@/lib/api/providers'
import type { Provider } from '@/lib/supabase'

export function ProveedoresSection() {
  const user = useAuthStore((s) => s.user)!
  const [providers, setProviders] = useState<Provider[]>([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const loadProviders = () => {
    getProviders(user.id).then(setProviders)
  }

  useEffect(() => {
    loadProviders()
  }, [user.id])

  const filtered = providers.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.nombre.toLowerCase().includes(q) ||
      (p.apellido || '').toLowerCase().includes(q) ||
      (p.rubro || '').toLowerCase().includes(q) ||
      (p.telefono || '').toLowerCase().includes(q)
    )
  })

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-accent" />
          <h3 className="text-base font-heading font-semibold">Proveedores</h3>
        </div>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={14} className="mr-1" />
          Agregar proveedor
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por nombre, rubro, teléfono..."
          className="w-full bg-app border border-border rounded-lg pl-9 pr-3 py-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {providers.length === 0 ? (
        <div className="text-center py-10">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto text-muted mb-3">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="17" y1="11" x2="23" y2="11" />
          </svg>
          <p className="text-sm text-secondary mb-3">Todavía no tenés proveedores registrados</p>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus size={14} className="mr-1" />
            Agregar el primero
          </Button>
        </div>
      ) : (
        <ProveedoresTable providers={filtered} onRefresh={loadProviders} />
      )}

      {/* Add provider modal */}
      <AddProviderModal
        open={showModal}
        onClose={() => setShowModal(false)}
        architectId={user.id}
        onCreated={loadProviders}
      />
    </Card>
  )
}

// ============================================
// Add Provider Modal
// ============================================

function AddProviderModal({
  open,
  onClose,
  architectId,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  architectId: string
  onCreated: () => void
}) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [rubro, setRubro] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [notas, setNotas] = useState('')
  const [saving, setSaving] = useState(false)

  const resetForm = () => {
    setNombre('')
    setApellido('')
    setRubro('')
    setTelefono('')
    setEmail('')
    setNotas('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await createProvider({
        architect_id: architectId,
        nombre,
        apellido: apellido || undefined,
        rubro: rubro || undefined,
        telefono: telefono || undefined,
        email: email || undefined,
        notas: notas || undefined,
      })
      onCreated()
      onClose()
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Agregar proveedor">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Nombre *" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <Input label="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
        <Input label="Rubro" value={rubro} onChange={(e) => setRubro(e.target.value)} />
        <Input label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <div>
          <label className="text-sm text-secondary block mb-1">Notas</label>
          <textarea
            className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm resize-none"
            rows={2}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving || !nombre.trim()}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Modal>
  )
}
