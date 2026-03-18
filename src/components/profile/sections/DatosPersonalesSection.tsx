import { useState, useRef, useCallback, useMemo } from 'react'
import { Camera, Upload, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { mockProjects } from '@/store/mockData'

export function DatosPersonalesSection() {
  const user = useAuthStore((s) => s.user)!
  const [name, setName] = useState(user.name)
  const [saved, setSaved] = useState(false)

  // Firma digital state
  const [firmaFile, setFirmaFile] = useState<File | null>(null)
  const [firmaPreview, setFirmaPreview] = useState<string | null>(null)
  const [firmaDragging, setFirmaDragging] = useState(false)
  const [firmaEnPdf, setFirmaEnPdf] = useState(user.firma_en_pdf)
  const firmaInputRef = useRef<HTMLInputElement>(null)

  const initial = user.name.charAt(0).toUpperCase()
  const memberSince = format(parseISO(user.created_at), 'MMMM yyyy', { locale: es })

  // M² trabajados — sum of all architect's project metros_cuadrados
  const totalM2 = useMemo(() => {
    return mockProjects
      .filter((p) => p.architect_id === user.id)
      .reduce((sum, p) => sum + p.metros_cuadrados, 0)
  }, [user.id])

  const formattedM2 = totalM2.toLocaleString('es-AR')

  const handleSave = () => {
    user.name = name
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Firma handlers
  const handleFirmaFile = useCallback((file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!validTypes.includes(file.type)) return
    if (firmaPreview) URL.revokeObjectURL(firmaPreview)
    setFirmaFile(file)
    setFirmaPreview(URL.createObjectURL(file))
  }, [firmaPreview])

  const handleFirmaDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setFirmaDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFirmaFile(file)
  }, [handleFirmaFile])

  const handleFirmaDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setFirmaDragging(true)
  }, [])

  const handleFirmaDragLeave = useCallback(() => {
    setFirmaDragging(false)
  }, [])

  const handleFirmaInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFirmaFile(file)
  }

  const handleFirmaRemove = () => {
    if (firmaPreview) URL.revokeObjectURL(firmaPreview)
    setFirmaFile(null)
    setFirmaPreview(null)
    if (firmaInputRef.current) firmaInputRef.current.value = ''
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

      {/* M² trabajados */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>
            {formattedM2} m²
          </p>
          <p className="text-sm text-secondary mt-1">M² trabajados</p>
        </div>
      </div>

      {/* Firma digital */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-heading font-semibold mb-3">Firma digital</h4>

        {firmaPreview ? (
          <div className="space-y-3">
            <div
              className="rounded-lg border border-border p-4 flex items-center justify-center"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #e0e0e0 25%, transparent 25%), linear-gradient(-45deg, #e0e0e0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e0e0e0 75%), linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
              }}
            >
              <img
                src={firmaPreview}
                alt="Firma digital"
                className="max-h-24 max-w-full object-contain"
              />
            </div>
            <p className="text-xs text-secondary truncate">{firmaFile?.name}</p>
            <Button variant="danger" size="sm" onClick={handleFirmaRemove}>
              <Trash2 size={14} />
              Eliminar firma
            </Button>
          </div>
        ) : (
          <div
            onDrop={handleFirmaDrop}
            onDragOver={handleFirmaDragOver}
            onDragLeave={handleFirmaDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
              ${firmaDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
            onClick={() => firmaInputRef.current?.click()}
          >
            <Upload size={20} className="mx-auto mb-2 text-secondary" />
            <p className="text-sm text-secondary mb-1">Arrastrá tu firma aquí</p>
            <p className="text-xs text-secondary mb-3">PNG, JPG o SVG</p>
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); firmaInputRef.current?.click() }}>
              Elegir imagen
            </Button>
          </div>
        )}

        <input
          ref={firmaInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.svg"
          className="hidden"
          onChange={handleFirmaInputChange}
        />

        {/* Toggle firma en PDF */}
        <label className="mt-4 flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={firmaEnPdf}
              onChange={(e) => setFirmaEnPdf(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 rounded-full bg-border peer-checked:bg-accent transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-secondary">Incluir firma en exportaciones PDF</span>
        </label>
      </div>
    </Card>
  )
}
