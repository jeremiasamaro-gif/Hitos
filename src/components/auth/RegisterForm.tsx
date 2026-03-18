import { useState, type FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { UserRole } from '@/lib/supabase'

export function RegisterForm({ onToggle }: { onToggle: () => void }) {
  const { signUp, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('arquitecto')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    clearError()
    await signUp(email, password, name, role)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-heading font-bold text-center">Crear cuenta</h2>

      <Input
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        required
      />
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
        placeholder="Mínimo 6 caracteres"
        minLength={6}
        required
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm text-secondary">Rol</label>
        <div className="flex gap-3">
          {(['arquitecto', 'cliente'] as const).map((r) => (
            <label
              key={r}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-colors
                ${role === r ? 'border-accent bg-accent/10 text-accent' : 'border-border text-secondary hover:border-primary'}`}
            >
              <input
                type="radio"
                name="role"
                value={r}
                checked={role === r}
                onChange={() => setRole(r)}
                className="sr-only"
              />
              <span className="text-sm font-medium capitalize">{r === 'arquitecto' ? 'Arquitecto' : 'Cliente'}</span>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-status-exceeded">{error}</p>}

      <Button type="submit" disabled={loading}>
        {loading ? 'Creando cuenta...' : 'Registrarse'}
      </Button>

      <p className="text-sm text-secondary text-center">
        ¿Ya tenés cuenta?{' '}
        <button type="button" onClick={onToggle} className="text-accent hover:underline">
          Iniciá sesión
        </button>
      </p>
    </form>
  )
}
