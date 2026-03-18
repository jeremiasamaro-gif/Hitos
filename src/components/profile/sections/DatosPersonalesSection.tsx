import { useState } from 'react'
import { Camera } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export function DatosPersonalesSection() {
  const user = useAuthStore((s) => s.user)!
  const [name, setName] = useState(user.name)
  const [saved, setSaved] = useState(false)

  const initial = user.name.charAt(0).toUpperCase()
  const memberSince = format(parseISO(user.created_at), 'MMMM yyyy', { locale: es })

  const handleSave = () => {
    user.name = name
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card className="p-6">
      <h3 className="text-base font-heading font-semibold mb-4">Datos personales</h3>
      <div className="flex items-start gap-4">
        <div className="relative group cursor-pointer">
          <div
            className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-2xl font-bold text-accent"
            style={{ width: 80, height: 80 }}
          >
            {initial}
          </div>
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={18} className="text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <Input label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user.email} readOnly className="opacity-70" />
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm text-secondary">Rol</label>
              <div className="mt-1">
                <Badge variant={user.role === 'arquitecto' ? 'accent' : 'default'}>
                  {user.role === 'arquitecto' ? 'Arquitecto' : 'Cliente'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm text-secondary">Miembro desde</label>
              <p className="text-sm mt-1 capitalize">{memberSince}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={name === user.name}>
          Guardar cambios
        </Button>
        {saved && <span className="text-xs text-green-400">Guardado</span>}
      </div>
    </Card>
  )
}
