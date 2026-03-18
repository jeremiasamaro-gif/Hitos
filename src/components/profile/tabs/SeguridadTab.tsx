import { CambiarPasswordSection } from '../sections/CambiarPasswordSection'
import { MiembrosSection } from '../sections/MiembrosSection'

export function SeguridadTab() {
  return (
    <div className="space-y-6">
      <CambiarPasswordSection />
      <MiembrosSection />
    </div>
  )
}
