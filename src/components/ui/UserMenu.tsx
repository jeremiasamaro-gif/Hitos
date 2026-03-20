import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, User, Settings, Shield, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface UserMenuProps {
  userName: string
  userRole: 'arquitecto' | 'cliente'
  userEmail?: string
  currentProjectId?: string
}

export function UserMenu({ userName, userRole, userEmail, currentProjectId }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { signOut } = useAuthStore()

  const initial = userName.charAt(0).toUpperCase()

  const returnTo = currentProjectId
    ? `/proyecto/${currentProjectId}`
    : '/projects'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleNavigate = (path: string, tab?: string) => {
    setOpen(false)
    navigate(path, { state: { returnTo, projectId: currentProjectId, tab } })
  }

  const handleSignOut = () => {
    setOpen(false)
    signOut()
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-hover transition-colors cursor-pointer"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-accent)', color: 'white', fontSize: 13, fontWeight: 500 }}
        >
          {initial}
        </div>
        <span className="text-sm text-primary hidden md:block">{userName}</span>
        <ChevronDown size={12} className="text-muted hidden md:block" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 bg-card border border-border rounded-xl shadow-hover min-w-[200px] p-1.5"
          style={{ top: 'calc(100% + 8px)', zIndex: 100 }}
        >
          {/* User info */}
          <div className="px-3 py-2 pb-2.5 border-b border-border mb-1.5">
            <p className="text-sm font-medium text-primary">{userName}</p>
            {userEmail && (
              <p className="text-xs text-muted mt-0.5">{userEmail}</p>
            )}
          </div>

          {/* Options */}
          <button
            onClick={() => handleNavigate('/perfil', 'perfil')}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-primary hover:bg-hover transition-colors"
          >
            <User size={15} />
            Mi perfil
          </button>
          <button
            onClick={() => handleNavigate('/perfil', 'configuracion')}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-primary hover:bg-hover transition-colors"
          >
            <Settings size={15} />
            Configuración
          </button>
          <button
            onClick={() => handleNavigate('/perfil', 'seguridad')}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-primary hover:bg-hover transition-colors"
          >
            <Shield size={15} />
            Seguridad
          </button>

          {/* Separator */}
          <div className="border-t border-border my-1.5" />

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm hover:bg-hover transition-colors"
            style={{ color: 'var(--color-status-exceeded, #ef4444)' }}
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}
