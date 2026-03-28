import { useEffect, useState, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { logActivity } from '@/lib/logActivity'
import { AdminSidebar } from './AdminSidebar'

const IMPERSONATION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export function AdminLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [impersonationExpired, setImpersonationExpired] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  // CRT-003: Exit impersonation and restore admin session
  const exitImpersonation = useCallback(() => {
    const raw = sessionStorage.getItem('hitos-impersonating')
    if (raw) {
      try {
        const data = JSON.parse(raw)
        // Restore admin session
        if (data.admin_email) {
          localStorage.setItem('hitos-mock-user', data.admin_email)
        }
        // Log the exit
        if (data.admin_id) {
          logActivity(data.admin_id, 'end_impersonation', {
            target_user_id: data.id,
            duration_ms: Date.now() - (data.started_at || Date.now()),
          })
        }
      } catch { /* ignore parse errors */ }
    }
    sessionStorage.removeItem('hitos-impersonating')
    navigate('/admin/usuarios')
  }, [navigate])

  // CRT-003: Check timeout every 30 seconds
  useEffect(() => {
    const raw = sessionStorage.getItem('hitos-impersonating')
    if (!raw) return
    const check = () => {
      try {
        const data = JSON.parse(raw)
        if (data.started_at && Date.now() - data.started_at > IMPERSONATION_TIMEOUT_MS) {
          setImpersonationExpired(true)
          exitImpersonation()
        }
      } catch { /* ignore */ }
    }
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [exitImpersonation])

  // Impersonation banner
  const impersonating = sessionStorage.getItem('hitos-impersonating')

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* Impersonation banner */}
      {impersonating && (
        <div className="bg-amber-500 text-white text-center text-sm py-1.5 px-4">
          Estás viendo la cuenta de otro usuario ·{' '}
          <button
            onClick={exitImpersonation}
            className="underline font-medium"
          >
            Salir de impersonación
          </button>
        </div>
      )}
      {impersonationExpired && !impersonating && (
        <div className="bg-red-500 text-white text-center text-sm py-1.5 px-4">
          Sesión de impersonación expirada (30 min). Se restauró tu sesión admin.
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-heading font-bold text-lg">
              Hito<span style={{ color: 'var(--color-accent)' }}>&apos;s</span>
            </span>
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-secondary hover:text-primary px-2 py-1 rounded-lg hover:bg-hover transition-colors"
            >
              <LogOut size={15} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
