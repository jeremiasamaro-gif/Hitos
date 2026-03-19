import { useState, useRef, useEffect } from 'react'
import { DollarSign, FileText, FileSpreadsheet, File, MessageSquare } from 'lucide-react'

interface DropdownOption {
  label: string
  icon: React.ReactNode
  action: string
}

const SEPARATOR = '__sep__'

const options: (DropdownOption | string)[] = [
  {
    label: 'Registrar gasto rapido',
    icon: <DollarSign size={16} className="text-secondary shrink-0" />,
    action: 'expense',
  },
  SEPARATOR,
  {
    label: 'Carga manual',
    icon: <FileText size={16} className="text-secondary shrink-0" />,
    action: 'manual',
  },
  {
    label: 'Importar Excel',
    icon: <FileSpreadsheet size={16} className="text-secondary shrink-0" />,
    action: 'import-excel',
  },
  {
    label: 'Importar CSV',
    icon: <File size={16} className="text-secondary shrink-0" />,
    action: 'import-csv',
  },
  SEPARATOR,
  {
    label: 'Agregar nota / comentario',
    icon: <MessageSquare size={16} className="text-secondary shrink-0" />,
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
        className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-medium text-white transition-colors"
        style={{
          background: 'var(--color-accent)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        Nueva actualizacion
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 z-50 py-1"
          style={{
            minWidth: 220,
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-hover, 0 4px 16px rgba(0,0,0,0.15))',
          }}
        >
          {options.map((opt, i) => {
            if (typeof opt === 'string') {
              return (
                <div
                  key={`sep-${i}`}
                  className="my-1"
                  style={{ borderTop: '1px solid var(--color-border)' }}
                />
              )
            }
            return (
              <button
                key={opt.action}
                type="button"
                onClick={() => handleOptionClick(opt.action)}
                className="flex items-center w-full text-left text-sm transition-colors hover:bg-hover/50"
                style={{ padding: '12px 16px', gap: 10 }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
