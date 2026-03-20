import type { ValidatedImportRow } from '@/lib/budgetUtils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Upload } from 'lucide-react'

interface ImportPreviewProps {
  rows: ValidatedImportRow[]
  onConfirm: () => void
  onCancel: () => void
  importing: boolean
  progress: number // 0–100
}

function StatusBadge({ status }: { status: ValidatedImportRow['status'] }) {
  switch (status) {
    case 'sin_precio':
      return <Badge variant="warning">sin precio</Badge>
    case 'requerido':
      return <Badge variant="danger">requerido</Badge>
    case 'duplicado':
      return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-orange-500/20 text-orange-400">duplicado</span>
    default:
      return <Badge variant="success">ok</Badge>
  }
}

export function ImportPreview({ rows, onConfirm, onCancel, importing, progress }: ImportPreviewProps) {
  const validCount = rows.filter((r) => r.status === 'valid').length
  const errorCount = rows.filter((r) => r.status === 'requerido').length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold">Preview de importacion</h4>
          <span className="text-xs text-secondary">
            {validCount} validos, {rows.length - validCount} con observaciones
          </span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-card sticky top-0">
            <tr className="border-b border-border text-secondary">
              <th className="px-2 py-1.5 text-left">Cod.</th>
              <th className="px-2 py-1.5 text-left">Descripcion</th>
              <th className="px-2 py-1.5">Ud.</th>
              <th className="px-2 py-1.5 text-right">Cant.</th>
              <th className="px-2 py-1.5">Rubro</th>
              <th className="px-2 py-1.5 text-right">P.Unit.</th>
              <th className="px-2 py-1.5 text-right">Total</th>
              <th className="px-2 py-1.5 text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`border-b border-border/30 ${row.status === 'requerido' ? 'bg-status-exceeded/5' : ''}`}>
                <td className="px-2 py-1.5 font-mono">{row.code}</td>
                <td className="px-2 py-1.5">{row.description || <span className="text-secondary italic">vacio</span>}</td>
                <td className="px-2 py-1.5 text-center">{row.unit}</td>
                <td className="px-2 py-1.5 text-right font-mono">{row.quantity}</td>
                <td className="px-2 py-1.5">{row.rubro}</td>
                <td className="px-2 py-1.5 text-right font-mono">{row.unitPrice.toLocaleString('es-AR')}</td>
                <td className="px-2 py-1.5 text-right font-mono">{row.total.toLocaleString('es-AR')}</td>
                <td className="px-2 py-1.5 text-center"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {importing && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-secondary">
            <span>Importando...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button onClick={onConfirm} disabled={importing || errorCount === rows.length} size="sm">
          <Upload size={14} />
          {importing ? 'Importando...' : `Confirmar importacion (${validCount} items)`}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={importing}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
