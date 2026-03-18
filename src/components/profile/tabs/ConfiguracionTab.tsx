import { LogoEstudioSection } from '../sections/LogoEstudioSection'
import { MisProyectosSection } from '../sections/MisProyectosSection'
import { ActividadRecienteSection } from '../sections/ActividadRecienteSection'
import { CategoriasSection } from '../sections/CategoriasSection'
import { ProveedoresSection } from '../sections/ProveedoresSection'

interface ConfiguracionTabProps {
  projectId?: string | null
}

export function ConfiguracionTab({ projectId }: ConfiguracionTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_1fr] gap-6">
      {/* Left column (55%) */}
      <div className="space-y-6">
        <LogoEstudioSection />
        <MisProyectosSection />
        <CategoriasSection projectId={projectId} />
      </div>

      {/* Right column (45%) */}
      <div className="space-y-6">
        <ActividadRecienteSection compact />
        <ProveedoresSection />
      </div>
    </div>
  )
}
