import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function CambiarPasswordSection() {
  const [current, setCurrent] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const valid = newPw.length >= 8 && /\d/.test(newPw) && newPw === confirm

  const handleChange = () => {
    if (!valid) return
    setMsg({ type: 'success', text: 'Contraseña actualizada correctamente' })
    setCurrent('')
    setNewPw('')
    setConfirm('')
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <Card className="p-6">
      <h3 className="text-base font-heading font-semibold mb-4">Cambiar contraseña</h3>
      <div className="space-y-3">
        <div className="relative">
          <Input
            label="Contraseña actual"
            type={showPw ? 'text' : 'password'}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-8 text-secondary hover:text-primary"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <Input
          label="Nueva contraseña"
          type="password"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
          error={
            newPw && newPw.length < 8
              ? 'Mínimo 8 caracteres'
              : newPw && !/\d/.test(newPw)
              ? 'Debe incluir al menos un número'
              : undefined
          }
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm && confirm !== newPw ? 'Las contraseñas no coinciden' : undefined}
        />
        <Button size="sm" onClick={handleChange} disabled={!valid}>
          Cambiar contraseña
        </Button>
        {msg && (
          <p className={`text-xs ${msg.type === 'success' ? 'text-green-400' : 'text-status-exceeded'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </Card>
  )
}
