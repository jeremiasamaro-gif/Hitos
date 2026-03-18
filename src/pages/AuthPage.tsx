import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card } from '@/components/ui/Card'

export function AuthPage() {
  const user = useAuthStore((s) => s.user)
  const [isLogin, setIsLogin] = useState(true)

  if (user) return <Navigate to="/projects" replace />

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-heading font-bold text-center mb-2">
          Hito<span className="text-accent">'s</span>
        </h1>
        <p className="text-secondary text-center text-sm mb-8">
          Control total de principio a fin
        </p>
        <Card>
          {isLogin ? (
            <LoginForm onToggle={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggle={() => setIsLogin(true)} />
          )}
        </Card>
      </div>
    </div>
  )
}
