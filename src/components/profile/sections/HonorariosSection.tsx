import { useState, useMemo } from 'react'
import { Percent } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { mockProjects } from '@/store/mockData'
import type { ProjectWithStats } from '@/lib/api/projects'

interface HonorariosSectionProps {
  proyectos: ProjectWithStats[]
  loading: boolean
}

export function HonorariosSection({ proyectos, loading }: HonorariosSectionProps) {
  // Local state for inline editing: { [projectId]: { dir: number, proy: number } }
  const [overrides, setOverrides] = useState<Record<string, { dir: number; proy: number }>>({})

  const rows = useMemo(() => {
    return proyectos.map((proj) => {
      const dirPct = overrides[proj.id]?.dir ?? proj.honorario_direccion
      const proyPct = overrides[proj.id]?.proy ?? proj.honorario_proyecto
      const budget = proj.totalPresupuestado
      const honDir = budget * (dirPct / 100)
      const honProy = budget * (proyPct / 100)
      return { id: proj.id, name: proj.name, budget, dirPct, proyPct, honDir, honProy, total: honDir + honProy }
    })
  }, [proyectos, overrides])

  const grandTotal = rows.reduce((s, r) => s + r.total, 0)
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}m`
      : `$${Math.round(n).toLocaleString('es-AR')}`

  const handleBlur = (projectId: string, field: 'dir' | 'proy', value: number) => {
    const clamped = Math.max(0, Math.min(100, value))
    setOverrides((prev) => ({
      ...prev,
      [projectId]: { ...prev[projectId], [field]: clamped },
    }))
    // Update mock data directly
    const proj = mockProjects.find((p) => p.id === projectId)
    if (proj) {
      if (field === 'dir') proj.honorario_direccion = clamped
      else proj.honorario_proyecto = clamped
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Percent size={18} className="text-accent" />
        <h3 className="text-sm font-heading font-semibold">Honorarios</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead>
            <tr className="border-b border-border text-secondary text-left">
              <th className="px-2 py-1">Proyecto</th>
              <th className="px-2 py-1 text-right">Presupuesto</th>
              <th className="px-2 py-1 text-center w-16">% Dir.</th>
              <th className="px-2 py-1 text-center w-16">% Proy.</th>
              <th className="px-2 py-1 text-right">Dir. obra</th>
              <th className="px-2 py-1 text-right">Proyecto</th>
              <th className="px-2 py-1 text-right font-semibold">Total honor.</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-border/30">
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="px-2 py-1.5">
                        <div
                          className="h-3 rounded animate-pulse"
                          style={{ background: '#F7F6F1', width: j === 1 ? '60%' : '40%' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : (
              <>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/30" style={{ lineHeight: '28px' }}>
                    <td className="px-2 py-0.5 font-medium">{r.name}</td>
                    <td className="px-2 py-0.5 text-right font-mono">{fmt(r.budget)}</td>
                    <td className="px-2 py-0.5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        className="w-14 bg-app border border-border rounded px-1.5 py-0.5 text-center text-xs"
                        defaultValue={r.dirPct}
                        onBlur={(e) => handleBlur(r.id, 'dir', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-2 py-0.5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        className="w-14 bg-app border border-border rounded px-1.5 py-0.5 text-center text-xs"
                        defaultValue={r.proyPct}
                        onBlur={(e) => handleBlur(r.id, 'proy', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-2 py-0.5 text-right font-mono">{fmt(r.honDir)}</td>
                    <td className="px-2 py-0.5 text-right font-mono">{fmt(r.honProy)}</td>
                    <td className="px-2 py-0.5 text-right font-mono font-semibold">{fmt(r.total)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td colSpan={6} className="px-2 py-1 font-bold text-right">TOTAL</td>
                  <td className="px-2 py-1 text-right font-mono font-bold text-accent">{fmt(grandTotal)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
