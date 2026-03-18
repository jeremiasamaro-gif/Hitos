import { useState, useRef, useEffect } from 'react'
import { PenLine, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface CargarDropdownProps {
  onSelect: (mode: 'manual' | 'xlsx' | 'csv') => void
}

export function CargarDropdown({ onSelect }: CargarDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const handleSelect = (mode: 'manual' | 'xlsx' | 'csv') => {
    setOpen(false)
    onSelect(mode)
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(!open)}
      >
        <PenLine size={14} />
        Cargar
        <ChevronDown size={12} className={`ml-0.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-lg z-20"
          style={{
            minWidth: '200px',
            boxShadow: 'var(--shadow-hover)',
          }}
        >
          <button
            onClick={() => handleSelect('manual')}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors first:rounded-t-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Carga manual
          </button>
          <button
            onClick={() => handleSelect('xlsx')}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18" />
              <path d="M3 9h18" />
              <path d="M3 15h18" />
            </svg>
            Importar Excel
          </button>
          <button
            onClick={() => handleSelect('csv')}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-left text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors last:rounded-b-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            Importar CSV
          </button>
        </div>
      )}
    </div>
  )
}
