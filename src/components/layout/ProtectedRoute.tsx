import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Spinner } from '@/components/ui/Spinner'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, signOut } = useAuthStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  // CRT-005: Block suspended users from accessing the app
  if (user.estado === 'suspendido') {
    signOut()
    return (
      <Navigate
        to="/auth"
        replace
        state={{ error: 'Tu cuenta fue suspendida. Contactá al soporte.' }}
      />
    )
  }

  return <>{children}</>
}
