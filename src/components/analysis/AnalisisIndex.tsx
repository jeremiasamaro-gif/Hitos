import { ProgressComparativa } from './ProgressComparativa'
import { DesfasajesSection } from './DesfasajesSection'
import { SimuladorEscenarios } from './SimuladorEscenarios'
import { ProximosVencimientos } from './ProximosVencimientos'

export function AnalisisIndex() {
  return (
    <div>
      <h1 className="text-xl font-heading font-bold mb-6">Análisis de Proyecto</h1>

      <section className="mb-8">
        <ProgressComparativa />
      </section>

      <section className="mb-8">
        <DesfasajesSection />
      </section>

      <section className="mb-8">
        <SimuladorEscenarios />
      </section>

      <section className="mb-8">
        <ProximosVencimientos />
      </section>
    </div>
  )
}
