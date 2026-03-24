import { Outlet, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  // Impersonation banner
  const impersonating = sessionStorage.getItem('hitos-impersonating')

  return (
    <div className="min-h-screen bg-app text-primary">
      {/* Impersonation banner */}
      {impersonating && (
        <div className="bg-amber-500 text-white text-center text-sm py-1.5 px-4">
          Estás viendo la cuenta de otro usuario ·{' '}
          <button
            onClick={() => {
              sessionStorage.removeItem('hitos-impersonating')
              navigate('/admin/usuarios')
            }}
            className="underline font-medium"
          >
            Salir de impersonación
          </button>
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
