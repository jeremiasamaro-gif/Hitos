import { OperacionesTable } from '@/components/admin/operaciones/OperacionesTable'

export function AdminOperaciones() {
  return (
    <div className="space-y-4 max-w-6xl">
      <h1 className="text-xl font-heading font-bold">Operaciones</h1>
      <OperacionesTable />
    </div>
  )
}
