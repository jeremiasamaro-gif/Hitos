import { useState, type FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginForm({ onToggle }: { onToggle: () => void }) {
  const { signIn, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    await signIn(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-heading font-bold text-center">Iniciar sesión</h2>

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        required
      />
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      {error && <p className="text-sm text-status-exceeded">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </Button>

      <p className="text-sm text-secondary text-center">
        ¿No tenés cuenta?{' '}
        <button type="button" onClick={onToggle} className="text-accent hover:underline">
          Registrate
        </button>
      </p>
    </form>
  )
}
