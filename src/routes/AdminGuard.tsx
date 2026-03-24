import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { mockAdminUsers } from '@/store/mockData'
import { Spinner } from '@/components/ui/Spinner'
import type { ReactNode } from 'react'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" replace />

  const isAdmin = mockAdminUsers.some((a) => a.id === user.id)
  if (!isAdmin) {
    return <Navigate to="/auth" replace state={{ error: 'No tenés acceso a esta sección' }} />
  }

  return <>{children}</>
}
