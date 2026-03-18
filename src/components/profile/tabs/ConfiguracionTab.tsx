import { MisProyectosSection } from '../sections/MisProyectosSection'
import { ActividadRecienteSection } from '../sections/ActividadRecienteSection'
import { CategoriasSection } from '../sections/CategoriasSection'
import { ProveedoresSection } from '../sections/ProveedoresSection'

interface ConfiguracionTabProps {
  projectId?: string | null
}

export function ConfiguracionTab({ projectId }: ConfiguracionTabProps) {
  return (
    <div className="space-y-6">
      <MisProyectosSection />
      <ActividadRecienteSection />
      <CategoriasSection projectId={projectId} />
      <ProveedoresSection />
    </div>
  )
}
