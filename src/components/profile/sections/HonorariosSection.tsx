import { useState, useMemo } from 'react'
import { Percent } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import type { ProjectWithStats } from '@/lib/api/projects'

interface HonorariosSectionProps {
  proyectos: ProjectWithStats[]
  loading: boolean
}

export function HonorariosSection({ proyectos, loading }: HonorariosSectionProps) {
  const user = useAuthStore((s) => s.user)!
  const [dirPct, setDirPct] = useState(String(user.honorario_direccion))
  const [proyPct, setProyPct] = useState(String(user.honorario_proyecto))
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const d = Math.max(0, Math.min(100, parseFloat(dirPct) || 0))
    const p = Math.max(0, Math.min(100, parseFloat(proyPct) || 0))
    user.honorario_direccion = d
    user.honorario_proyecto = p
    setDirPct(String(d))
    setProyPct(String(p))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const projectHonorarios = useMemo(() => {
    const d = parseFloat(dirPct) || 0
    const p = parseFloat(proyPct) || 0

    return proyectos.map((proj) => {
      const budget = proj.totalPresupuestado
      const honDir = budget * (d / 100)
      const honProy = budget * (p / 100)
      return { name: proj.name, budget, honDir, honProy, total: honDir + honProy }
    })
  }, [proyectos, dirPct, proyPct])

  const grandTotal = projectHonorarios.reduce((s, p) => s + p.total, 0)
  const fmt = (n: number) => `$${(n / 1_000_000).toFixed(1)}m`

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Percent size={20} className="text-accent" />
        <h3 className="text-base font-heading font-semibold">Honorarios</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-secondary block mb-1">Dirección de obra</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              className="bg-app border border-border rounded-lg px-3 py-2 text-sm w-24"
              value={dirPct}
              onChange={(e) => setDirPct(e.target.value)}
            />
            <span className="text-sm text-secondary">%</span>
          </div>
        </div>
        <div>
          <label className="text-sm text-secondary block mb-1">Proyecto</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              step={0.5}
              className="bg-app border border-border rounded-lg px-3 py-2 text-sm w-24"
              value={proyPct}
              onChange={(e) => setProyPct(e.target.value)}
            />
            <span className="text-sm text-secondary">%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" onClick={handleSave}>Guardar</Button>
        {saved && <span className="text-xs text-green-400">Guardado</span>}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-secondary text-left">
              <th className="px-2 py-1.5">Proyecto</th>
              <th className="px-2 py-1.5 text-right">Presupuesto</th>
              <th className="px-2 py-1.5 text-right">Dir. obra</th>
              <th className="px-2 py-1.5 text-right">Proyecto</th>
              <th className="px-2 py-1.5 text-right font-semibold">Total honor.</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-border/30">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-2 py-2.5">
                        <div
                          className="h-3.5 rounded animate-pulse"
                          style={{ background: '#F7F6F1', width: j === 1 ? '60%' : '40%' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : (
              <>
                {projectHonorarios.map((p) => (
                  <tr key={p.name} className="border-b border-border/30">
                    <td className="px-2 py-1.5 font-medium">{p.name}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{fmt(p.budget)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{fmt(p.honDir)}</td>
                    <td className="px-2 py-1.5 text-right font-mono">{fmt(p.honProy)}</td>
                    <td className="px-2 py-1.5 text-right font-mono font-semibold">{fmt(p.total)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td colSpan={4} className="px-2 py-1.5 font-bold text-right">TOTAL</td>
                  <td className="px-2 py-1.5 text-right font-mono font-bold text-accent">{fmt(grandTotal)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
