import { useState, useRef, useEffect } from 'react'
import { DollarSign, MessageSquare } from 'lucide-react'

interface DropdownOption {
  label: string
  icon: typeof DollarSign
  action: string
}

const options: DropdownOption[] = [
  {
    label: 'Registrar gasto rapido',
    icon: DollarSign,
    action: 'expense',
  },
  {
    label: 'Agregar nota / comentario',
    icon: MessageSquare,
    action: 'comment',
  },
]

export function NuevaActualizacionDropdown() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  function handleOptionClick(action: string) {
    console.log(`[NuevaActualizacion] Selected: ${action}`)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors"
      >
        + Nueva actualizacion
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-60 rounded-lg shadow-lg z-50"
          style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {options.map((opt) => (
            <button
              key={opt.action}
              type="button"
              onClick={() => handleOptionClick(opt.action)}
              className="flex items-center gap-3 w-full text-left text-sm transition-colors"
              style={{ padding: '12px 16px' }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = 'var(--color-bg-row-hover)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <opt.icon size={16} className="text-secondary shrink-0" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
