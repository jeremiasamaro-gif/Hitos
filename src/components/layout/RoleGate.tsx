import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/lib/supabase'
import type { ReactNode } from 'react'

interface RoleGateProps {
  allow: UserRole | UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const user = useAuthStore((s) => s.user)
  if (!user) return null
  const allowed = Array.isArray(allow) ? allow : [allow]
  if (!allowed.includes(user.role)) return <>{fallback}</>
  return <>{children}</>
}
