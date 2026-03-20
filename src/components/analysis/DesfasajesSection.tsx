import { useState, useMemo } from 'react'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useCurrencyStore } from '@/store/currencyStore'
import { getSpentByParent } from '@/lib/analysis'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCompact } from '@/utils/currency'
import type { BudgetItem } from '@/lib/supabase'

interface DesfasajeItem {
  item: BudgetItem
  budgeted: number
  spent: number
  deviationPct: number
}

type FilterOption = 5 | 10 | 20 | 'all'

export function DesfasajesSection() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { convert } = useProjectContext()
  const { mode } = useCurrencyStore()

  const [filter, setFilter] = useState<FilterOption>(5)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<string, { precio: boolean; mano: boolean; alcance: boolean; otro: boolean; otroText: string }>>({})

  const desfasajes = useMemo<DesfasajeItem[]>(() => {
    const parents = items.filter((i) => !i.parent_id)
    const spentMap = getSpentByParent(items, expenses)

    return parents
      .map((p) => {
        const spent = spentMap.get(p.id) || 0
        const deviationPct = p.total_price > 0 ? ((spent - p.total_price) / p.total_price) * 100 : 0
        return { item: p, budgeted: p.total_price, spent, deviationPct }
      })
      .filter((d) => {
        // Show items where spent > 80% of budget OR exceeded
        const spentPct = d.budgeted > 0 ? (d.spent / d.budgeted) * 100 : 0
        if (spentPct < 80) return false
        if (filter === 'all') return true
        return d.deviationPct > filter
      })
      .sort((a, b) => b.deviationPct - a.deviationPct)
  }, [items, expenses, filter])

  const getChecksForId = (id: string) =>
    checks[id] || { precio: false, mano: false, alcance: false, otro: false, otroText: '' }

  const toggleCheck = (id: string, field: 'precio' | 'mano' | 'alcance' | 'otro') => {
    const current = getChecksForId(id)
    setChecks((prev) => ({ ...prev, [id]: { ...current, [field]: !current[field] } }))
  }

  const setOtroText = (id: string, text: string) => {
    const current = getChecksForId(id)
    setChecks((prev) => ({ ...prev, [id]: { ...current, otroText: text } }))
  }

  const handleSave = (id: string) => {
    const analysis = getChecksForId(id)
    const item = desfasajes.find((d) => d.item.id === id)
    console.log('Analisis guardado:', { itemId: id, itemName: item?.item.description, ...analysis })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider">
          Desfasajes ({desfasajes.length})
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-secondary">Mostrar rubros con desvío &gt;</label>
          <select
            value={String(filter)}
            onChange={(e) => {
              const v = e.target.value
              setFilter(v === 'all' ? 'all' : (Number(v) as 5 | 10 | 20))
            }}
            className="text-xs border border-border rounded px-2 py-1 bg-card text-primary"
          >
            <option value="5">5%</option>
            <option value="10">10%</option>
            <option value="20">20%</option>
            <option value="all">Todos</option>
          </select>
        </div>
      </div>

      {desfasajes.length === 0 && (
        <p className="text-sm text-secondary">No hay rubros con desfasaje para el filtro seleccionado.</p>
      )}

      <div className="space-y-3">
        {desfasajes.map((d) => {
          const isExpanded = expandedId === d.item.id
          const chk = getChecksForId(d.item.id)

          return (
            <Card key={d.item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">{d.item.description}</p>
                  <p className="text-xs text-secondary mt-1">
                    Presupuestado: {formatCompact(convert(d.budgeted), mode)} &middot; Gastado: {formatCompact(convert(d.spent), mode)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={d.deviationPct > 0 ? 'danger' : 'warning'}>
                    {d.deviationPct > 0 ? '+' : ''}{d.deviationPct.toFixed(1)}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedId(isExpanded ? null : d.item.id)}
                  >
                    {isExpanded ? 'Cerrar' : 'Ver detalle'}
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-secondary mb-2">Causa del desfasaje:</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chk.precio}
                        onChange={() => toggleCheck(d.item.id, 'precio')}
                      />
                      Aumento de precio
                    </label>
                    <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chk.mano}
                        onChange={() => toggleCheck(d.item.id, 'mano')}
                      />
                      Mayor mano de obra
                    </label>
                    <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chk.alcance}
                        onChange={() => toggleCheck(d.item.id, 'alcance')}
                      />
                      Cambio en alcance
                    </label>
                    <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={chk.otro}
                        onChange={() => toggleCheck(d.item.id, 'otro')}
                      />
                      Otro
                    </label>
                    {chk.otro && (
                      <input
                        type="text"
                        placeholder="Describir..."
                        value={chk.otroText}
                        onChange={(e) => setOtroText(d.item.id, e.target.value)}
                        className="w-full text-sm border border-border rounded px-2 py-1 bg-card text-primary ml-6"
                      />
                    )}
                  </div>
                  <div className="mt-3">
                    <Button size="sm" onClick={() => handleSave(d.item.id)}>
                      Guardar análisis
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
