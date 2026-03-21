import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, FileText, FileSpreadsheet, File, MessageSquare } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { GastoRapidoModal } from './GastoRapidoModal'
import { ComentarioRapidoModal } from './ComentarioRapidoModal'

const optionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '9px 12px',
  background: 'transparent',
  border: 'none',
  borderRadius: 'var(--radius-md)',
  fontSize: 14,
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  textAlign: 'left' as const,
}

export function NuevaActualizacionDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [showGasto, setShowGasto] = useState(false)
  const [showComentario, setShowComentario] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { project } = useProjectContext()

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const base = `/proyecto/${project.id}`

  function onGastoRapido() {
    setIsOpen(false)
    setShowGasto(true)
  }

  function onCargaManual() {
    setIsOpen(false)
    navigate(`${base}/presupuesto`, { state: { loadMode: 'manual' } })
  }

  function onImportExcel() {
    setIsOpen(false)
    navigate(`${base}/presupuesto`, { state: { loadMode: 'xlsx' } })
  }

  function onImportCSV() {
    setIsOpen(false)
    navigate(`${base}/presupuesto`, { state: { loadMode: 'csv' } })
  }

  function onComentario() {
    setIsOpen(false)
    setShowComentario(true)
  }

  return (
    <>
      <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'var(--color-accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Nueva actualización
        </button>

        {isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              left: 'auto',
              zIndex: 100,
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-hover, 0 4px 16px rgba(0,0,0,0.15))',
              minWidth: 220,
              padding: 6,
              overflow: 'visible',
            }}
          >
            {/* Registrar gasto rápido */}
            <button
              type="button"
              onClick={onGastoRapido}
              style={optionStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-row-hover, rgba(0,0,0,0.04))' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <DollarSign size={16} style={{ color: 'var(--color-text-secondary)' }} />
              <span>Registrar gasto rápido</span>
            </button>

            {/* Separador */}
            <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />

            {/* Carga manual */}
            <button
              type="button"
              onClick={onCargaManual}
              style={optionStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-row-hover, rgba(0,0,0,0.04))' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <FileText size={16} style={{ color: 'var(--color-text-secondary)' }} />
              <span>Carga manual</span>
            </button>

            {/* Importar Excel */}
            <button
              type="button"
              onClick={onImportExcel}
              style={optionStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-row-hover, rgba(0,0,0,0.04))' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <FileSpreadsheet size={16} style={{ color: 'var(--color-text-secondary)' }} />
              <span>Importar Excel</span>
            </button>

            {/* Importar CSV */}
            <button
              type="button"
              onClick={onImportCSV}
              style={optionStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-row-hover, rgba(0,0,0,0.04))' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <File size={16} style={{ color: 'var(--color-text-secondary)' }} />
              <span>Importar CSV</span>
            </button>

            {/* Separador */}
            <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }} />

            {/* Agregar nota / comentario */}
            <button
              type="button"
              onClick={onComentario}
              style={optionStyle}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-row-hover, rgba(0,0,0,0.04))' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <MessageSquare size={16} style={{ color: 'var(--color-text-secondary)' }} />
              <span>Agregar nota / comentario</span>
            </button>
          </div>
        )}
      </div>

      <GastoRapidoModal open={showGasto} onClose={() => setShowGasto(false)} />
      <ComentarioRapidoModal open={showComentario} onClose={() => setShowComentario(false)} />
    </>
  )
}
