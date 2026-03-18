import { useState, useRef, useCallback } from 'react'
import { Upload, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function LogoEstudioSection() {
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!validTypes.includes(file.type)) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setLogoFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }, [previewUrl])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setLogoFile(null)
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <Card className="p-6">
      <h3 className="text-base font-heading font-semibold mb-4">Logo del estudio</h3>

      {previewUrl ? (
        <div className="space-y-3">
          <div className="rounded-lg bg-[var(--color-bg)] border border-border p-4 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Logo del estudio"
              className="max-h-32 max-w-full object-contain"
            />
          </div>
          <p className="text-xs text-secondary truncate">{logoFile?.name}</p>
          <Button variant="danger" size="sm" onClick={handleRemove}>
            <Trash2 size={14} />
            Eliminar logo
          </Button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
            ${isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={24} className="mx-auto mb-2 text-secondary" />
          <p className="text-sm text-secondary mb-1">
            Arrastrá tu logo aquí
          </p>
          <p className="text-xs text-secondary mb-3">PNG, JPG o SVG</p>
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
            Elegir imagen
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.svg"
        className="hidden"
        onChange={handleInputChange}
      />
    </Card>
  )
}
