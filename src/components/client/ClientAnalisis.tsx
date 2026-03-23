import { BarChart3 } from 'lucide-react'

export function ClientAnalisis() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-heading font-bold">Análisis</h1>

      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <BarChart3 size={32} style={{ color: 'var(--color-accent)' }} />
          </div>
        </div>
        <h2 className="text-lg font-medium mb-2">Próximamente</h2>
        <p className="text-sm text-secondary max-w-md mx-auto">
          Acá vas a poder ver análisis detallados de tu proyecto: proyecciones de costos,
          comparativas mensuales y tendencias de gastos.
        </p>
      </div>
    </div>
  )
}
