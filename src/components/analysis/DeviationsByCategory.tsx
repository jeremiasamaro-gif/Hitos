import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatPercent } from '@/utils/formatters'
import type { AnalysisItem } from '@/lib/analysis'

const DEVIATION_CAUSES: Record<string, string[]> = {
  'Materiales': ['Aumento de precios', 'Mayor cantidad', 'Cambio de especificación'],
  'Mano de obra': ['Horas extra', 'Cambio de alcance', 'Trabajos adicionales'],
  'Servicios': ['Aumento de tarifa', 'Demora con recargo', 'Alcance ampliado'],
  'Otros': ['Imprevisto', 'Cambio de diseño', 'Requisito regulatorio'],
}

function getCategoryType(description: string): string {
  const d = description.toLowerCase()
  if (d.includes('material') || d.includes('hierro') || d.includes('hormigón') || d.includes('ladrillo')) return 'Materiales'
  if (d.includes('mano') || d.includes('albañil') || d.includes('plomero') || d.includes('electrici')) return 'Mano de obra'
  if (d.includes('servicio') || d.includes('diseño') || d.includes('proyecto')) return 'Servicios'
  return 'Otros'
}

interface Props {
  exceededItems: AnalysisItem[]
}

export function DeviationsByCategory({ exceededItems }: Props) {
  const mode = useCurrencyStore((s) => s.mode)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedCauses, setSelectedCauses] = useState<Record<string, string>>({})

  if (exceededItems.length === 0) {
    return (
      <p className="text-sm text-secondary">No hay rubros excedidos.</p>
    )
  }

  // Group by category type
  const grouped = new Map<string, AnalysisItem[]>()
  for (const item of exceededItems) {
    const cat = getCategoryType(item.item.description)
    if (!grouped.has(cat)) grouped.set(cat, [])
    grouped.get(cat)!.push(item)
  }

  return (
    <div className="space-y-3">
      {[...grouped.entries()].map(([category, items]) => (
        <Card key={category} className="overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === category ? null : category)}
            className="w-full flex items-center justify-between p-4 hover:bg-hover/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="text-status-exceeded" />
              <span className="text-sm font-heading font-semibold">{category}</span>
              <span className="text-xs text-secondary">({items.length} rubros)</span>
            </div>
            {expanded === category ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {expanded === category && (
            <div className="border-t border-border px-4 pb-4 space-y-3">
              {items.map((ai) => (
                <div key={ai.item.id} className="pt-3 border-t border-border/50 first:border-t-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{ai.item.description}</span>
                    <span className="text-xs font-mono text-status-exceeded">
                      +{formatCurrency(ai.overage, mode)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-secondary">
                    <span>Presup: {formatCurrency(ai.budgeted, mode)}</span>
                    <span>Gastado: {formatCurrency(ai.spent, mode)}</span>
                    <span>{formatPercent(ai.percentage)}</span>
                  </div>

                  {/* Cause selector */}
                  <div className="mt-2">
                    <label className="text-xs text-secondary block mb-1">Causa probable:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {(DEVIATION_CAUSES[category] || DEVIATION_CAUSES['Otros']).map((cause) => (
                        <button
                          key={cause}
                          type="button"
                          onClick={() => setSelectedCauses((prev) => ({ ...prev, [ai.item.id]: cause }))}
                          className={`px-2 py-0.5 rounded text-xs transition-colors ${
                            selectedCauses[ai.item.id] === cause
                              ? 'bg-status-exceeded/20 text-status-exceeded border border-status-exceeded/30'
                              : 'bg-border text-secondary hover:text-primary'
                          }`}
                        >
                          {cause}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
