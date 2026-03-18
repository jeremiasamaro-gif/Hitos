import { useState, useEffect, type FormEvent } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCurrencyStore } from '@/store/currencyStore'
import { useMemberStore } from '@/store/memberStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useAuthStore } from '@/store/authStore'
import { mockExchangeRates } from '@/store/mockData'
import { mockUsers } from '@/store/mockData'
import { DollarSign, Users, Send } from 'lucide-react'

export function ConfigPage() {
  const { project } = useProjectContext()
  const user = useAuthStore((s) => s.user)
  const { latestRate, setRate, fetchRate } = useCurrencyStore()
  const { members, fetchMembers, inviteMember } = useMemberStore()

  const [rateBlue, setRateBlue] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchMembers(project.id)
  }, [project.id, fetchMembers])

  useEffect(() => {
    if (latestRate) {
      setRateBlue(latestRate.rate_blue.toString())
    }
  }, [latestRate])

  const handleSaveRate = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      await setRate({
        project_id: project.id,
        date: new Date().toISOString().split('T')[0],
        rate_blue: parseFloat(rateBlue) || 0,
        created_by: user.id,
      })
      await fetchRate(project.id)
    } finally {
      setSaving(false)
    }
  }

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await inviteMember({
        project_id: project.id,
        email: inviteEmail.trim(),
        role: 'cliente',
      })
      setInviteEmail('')
    } finally {
      setInviting(false)
    }
  }

  // Recent exchange rate history (last 5)
  const rateHistory = mockExchangeRates
    .filter((r) => r.project_id === project.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  return (
    <div>
      <h1 className="text-xl font-heading font-bold mb-6">Configuración</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Exchange Rate Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={20} className="text-accent" />
            <h2 className="text-sm font-heading font-semibold">Tipo de Cambio</h2>
          </div>

          <form onSubmit={handleSaveRate} className="space-y-3 mb-6">
            <Input
              label="TC Blue"
              type="number"
              value={rateBlue}
              onChange={(e) => setRateBlue(e.target.value)}
              required
            />
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Guardando...' : 'Guardar Tipo de Cambio'}
            </Button>
          </form>

          {rateHistory.length > 0 && (
            <div>
              <h3 className="text-xs text-secondary uppercase tracking-wider mb-2">
                Historial reciente
              </h3>
              <div className="space-y-2">
                {rateHistory.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-hover/30"
                  >
                    <span className="text-secondary">{r.date}</span>
                    <span className="font-mono">Blue: ${r.rate_blue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Members Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-accent" />
            <h2 className="text-sm font-heading font-semibold">Miembros del Proyecto</h2>
          </div>

          <div className="space-y-2 mb-6">
            {members.map((m) => {
              const memberUser = mockUsers.find((u) => u.id === m.user_id)
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-2 px-3 rounded bg-hover/30"
                >
                  <div>
                    <p className="text-sm font-medium">{memberUser?.name || 'Usuario'}</p>
                    <p className="text-xs text-secondary">{memberUser?.email || '—'}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      m.role === 'arquitecto'
                        ? 'bg-accent/20 text-accent'
                        : 'bg-border text-secondary'
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              )
            })}
          </div>

          <form onSubmit={handleInvite}>
            <h3 className="text-xs text-secondary uppercase tracking-wider mb-2">
              Invitar cliente
            </h3>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={inviting} className="shrink-0">
                <Send size={14} />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
