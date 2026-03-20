import { useState, useCallback, useRef, useMemo } from 'react'
import { FileSpreadsheet, Upload } from 'lucide-react'
import { parseExcel, parseCsv, validateImportRows, parentCodeFromCode, type ColumnMapping, type RawImportRow, type ValidatedImportRow } from '@/lib/budgetUtils'
import type { BudgetItem } from '@/lib/supabase'
import { ColumnMapper } from './ColumnMapper'
import { ImportPreview } from './ImportPreview'
import { Button } from '@/components/ui/Button'

interface BudgetImporterProps {
  existingItems: BudgetItem[]
  projectId: string
  onImport: (items: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>
  onCancel: () => void
}

type Step = 'upload' | 'map' | 'preview'

export function BudgetImporter({ existingItems, projectId, onImport, onCancel }: BudgetImporterProps) {
  const [step, setStep] = useState<Step>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<RawImportRow[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({
    codigo: '', descripcion: '', unidad: '', cantidad: '', rubro: '', precioUnitario: '', total: '',
  })
  const [validated, setValidated] = useState<ValidatedImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    let result: { headers: string[]; rows: RawImportRow[] }

    if (ext === 'csv' || ext === 'tsv') {
      const text = await file.text()
      result = parseCsv(text)
    } else {
      const buffer = await file.arrayBuffer()
      result = parseExcel(buffer)
    }

    setHeaders(result.headers)
    setRawRows(result.rows)

    // Auto-map: try to guess column names
    const autoMap = { ...mapping }
    const lowerHeaders = result.headers.map((h) => h.toLowerCase())
    for (const [key, patterns] of Object.entries(COLUMN_PATTERNS)) {
      const idx = lowerHeaders.findIndex((h) => patterns.some((p) => h.includes(p)))
      if (idx >= 0) (autoMap as Record<string, string>)[key] = result.headers[idx]
    }
    setMapping(autoMap)
    setStep('map')
  }, [mapping])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const existingCodes = useMemo(
    () => new Set(existingItems.map((i) => i.item_code).filter(Boolean) as string[]),
    [existingItems]
  )

  const previewFile = rawRows.slice(0, 5)

  const handlePreview = () => {
    const result = validateImportRows(rawRows, mapping, existingCodes)
    setValidated(result)
    setStep('preview')
  }

  const handleConfirm = async () => {
    setImporting(true)
    setProgress(0)

    const itemsToCreate = validated
      .filter((r) => r.status !== 'requerido')
      .map((r) => {
        const parentCode = parentCodeFromCode(r.code)
        const parentItem = parentCode ? existingItems.find((i) => i.item_code === parentCode) : null

        return {
          project_id: projectId,
          parent_id: parentItem?.id || null,
          item_code: r.code || null,
          description: r.description,
          unit: r.unit || null,
          quantity: r.quantity,
          rubro: r.rubro || null,
          unit_price: r.unitPrice,
          total_price: r.total,
          category: parentItem?.category || r.description,
          week_number: null,
        }
      })

    // Batch import with progress
    const BATCH = 100
    for (let i = 0; i < itemsToCreate.length; i += BATCH) {
      const batch = itemsToCreate.slice(i, i + BATCH)
      await onImport(batch)
      setProgress(((i + batch.length) / itemsToCreate.length) * 100)
    }

    setImporting(false)
  }

  return (
    <div className="space-y-6">
      {step === 'upload' && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Importar Excel / CSV</h3>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
              dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-secondary'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <FileSpreadsheet className="mx-auto mb-3 text-secondary" size={40} />
            <p className="text-sm text-secondary mb-1">Arrastra y solta un archivo .xlsx o .csv</p>
            <p className="text-xs text-secondary/60">o hace click para elegir</p>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv,.tsv"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        </div>
      )}

      {step === 'map' && (
        <div className="space-y-4">
          {/* Preview first 5 rows */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Vista previa ({rawRows.length} filas)</h4>
            <div className="overflow-x-auto rounded-lg border border-border max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-card sticky top-0">
                  <tr className="border-b border-border">
                    {headers.map((h) => (
                      <th key={h} className="px-2 py-1.5 text-left text-secondary whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewFile.map((row, i) => (
                    <tr key={i} className="border-b border-border/30">
                      {headers.map((h) => (
                        <td key={h} className="px-2 py-1 whitespace-nowrap">{String(row[h] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ColumnMapper headers={headers} mapping={mapping} onChange={setMapping} />

          <div className="flex gap-2">
            <Button size="sm" onClick={handlePreview} disabled={!mapping.descripcion}>
              Previsualizar importacion
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setStep('upload')}>
              Volver
            </Button>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <ImportPreview
          rows={validated}
          onConfirm={handleConfirm}
          onCancel={onCancel}
          importing={importing}
          progress={progress}
        />
      )}
    </div>
  )
}

// Auto-mapping patterns
const COLUMN_PATTERNS: Record<string, string[]> = {
  codigo: ['codigo', 'code', 'cod', 'item', 'num'],
  descripcion: ['descripcion', 'description', 'desc', 'detalle', 'concepto', 'nombre'],
  unidad: ['unidad', 'unit', 'ud', 'u.m.'],
  cantidad: ['cantidad', 'qty', 'quantity', 'cant'],
  rubro: ['rubro', 'gremio', 'oficio', 'trade'],
  precioUnitario: ['precio', 'price', 'p.unit', 'unitario', 'costo'],
  total: ['total', 'importe', 'monto', 'amount', 'subtotal'],
}
