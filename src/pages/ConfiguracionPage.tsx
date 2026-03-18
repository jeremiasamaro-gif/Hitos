import { useState, useEffect, useMemo, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, DollarSign, Users, Send, Layers } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { useMemberStore } from '@/store/memberStore'
import { mockProjects, mockExchangeRates, mockUsers } from '@/store/mockData'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { UserMenu } from '@/components/ui/UserMenu'
import { CategoryEditor } from '@/components/project/CategoryEditor'

export function ConfiguracionPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as { returnTo?: string; projectId?: string } | null
  const returnTo = state?.returnTo ?? '/projects'
  const projectId = state?.projectId ?? null
  const project = projectId ? mockProjects.find((p) => p.id === projectId) : null

  if (!user) {
    navigate('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(returnTo)}
              className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
            <h1 className="font-heading font-bold text-lg">Configuración</h1>
          </div>
          <UserMenu
            userName={user.name}
            userRole={user.role}
            userEmail={user.email}
          />
        </div>
      </header>

      <main className="p-4 lg:p-6 max-w-5xl mx-auto">
        {project && projectId ? (
          <div>
            <h2 className="text-lg font-heading font-bold mb-4">
              {project.name}
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <ExchangeRateSection projectId={projectId} userId={user.id} />
              <div className="space-y-6">
                <MembersSection projectId={projectId} />
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Layers size={20} className="text-accent" />
                    <h3 className="text-sm font-heading font-semibold">Categorías del presupuesto</h3>
                  </div>
                  <CategoryEditor projectId={projectId} />
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-secondary">Seleccioná un proyecto para ver su configuración.</p>
            <Button size="sm" className="mt-4" onClick={() => navigate('/projects')}>
              Ir a proyectos
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}

// ============================================
// EXCHANGE RATE SECTION
// ============================================

function ExchangeRateSection({ projectId, userId }: { projectId: string; userId: string }) {
  const { latestRate, setRate, fetchRate } = useCurrencyStore()
  const [rateBlue, setRateBlue] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRate(projectId)
  }, [projectId, fetchRate])

  useEffect(() => {
    if (latestRate) {
      setRateBlue(latestRate.rate_blue.toString())
    }
  }, [latestRate])

  const handleSaveRate = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await setRate({
        project_id: projectId,
        date: new Date().toISOString().split('T')[0],
        rate_blue: parseFloat(rateBlue) || 0,
        created_by: userId,
      })
      await fetchRate(projectId)
    } finally {
      setSaving(false)
    }
  }

  const rateHistory = mockExchangeRates
    .filter((r) => r.project_id === projectId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign size={20} className="text-accent" />
        <h3 className="text-sm font-heading font-semibold">Tipo de Cambio</h3>
      </div>
      <form onSubmit={handleSaveRate} className="space-y-3 mb-6">
        <Input label="TC Blue" type="number" value={rateBlue} onChange={(e) => setRateBlue(e.target.value)} required />
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Guardando...' : 'Guardar Tipo de Cambio'}
        </Button>
      </form>
      {rateHistory.length > 0 && (
        <div>
          <h4 className="text-xs text-secondary uppercase tracking-wider mb-2">Historial reciente</h4>
          <div className="space-y-2">
            {rateHistory.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-hover/30">
                <span className="text-secondary">{r.date}</span>
                <span className="font-mono">Blue: ${r.rate_blue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

// ============================================
// MEMBERS SECTION
// ============================================

function MembersSection({ projectId }: { projectId: string }) {
  const { members, fetchMembers, inviteMember } = useMemberStore()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchMembers(projectId)
  }, [projectId, fetchMembers])

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await inviteMember({ project_id: projectId, email: inviteEmail.trim(), role: 'cliente' })
      setInviteEmail('')
    } finally {
      setInviting(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-accent" />
        <h3 className="text-sm font-heading font-semibold">Miembros del Proyecto</h3>
      </div>
      <div className="space-y-2 mb-6">
        {members.map((m) => {
          const memberUser = mockUsers.find((u) => u.id === m.user_id)
          return (
            <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded bg-hover/30">
              <div>
                <p className="text-sm font-medium">{memberUser?.name || 'Usuario'}</p>
                <p className="text-xs text-secondary">{memberUser?.email || '—'}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${m.role === 'arquitecto' ? 'bg-accent/20 text-accent' : 'bg-border text-secondary'}`}>
                {m.role}
              </span>
            </div>
          )
        })}
      </div>
      <form onSubmit={handleInvite}>
        <h4 className="text-xs text-secondary uppercase tracking-wider mb-2">Invitar cliente</h4>
        <div className="flex gap-2">
          <Input type="email" placeholder="email@ejemplo.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
          <Button type="submit" disabled={inviting} className="shrink-0">
            <Send size={14} />
          </Button>
        </div>
      </form>
    </Card>
  )
}
