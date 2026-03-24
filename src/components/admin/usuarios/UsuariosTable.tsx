import type { User } from '@/lib/supabase'
import { UsuarioRow } from './UsuarioRow'

interface UsuariosTableProps {
  users: User[]
  onViewDetail: (user: User) => void
  onImpersonate: (user: User) => void
  onQuickEdit: (user: User) => void
}

export function UsuariosTable({ users, onViewDetail, onImpersonate, onQuickEdit }: UsuariosTableProps) {
  return (
    <div className="overflow-x-auto border border-border rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-secondary text-left text-xs uppercase tracking-wider bg-card">
            <th className="px-3 py-2.5 min-w-[180px]">Nombre</th>
            <th className="px-3 py-2.5 min-w-[180px]">Email</th>
            <th className="px-3 py-2.5 min-w-[100px]">Rol</th>
            <th className="px-3 py-2.5 min-w-[100px]">Plan</th>
            <th className="px-3 py-2.5 min-w-[100px]">Estado</th>
            <th className="px-3 py-2.5 min-w-[90px]">Registro</th>
            <th className="px-3 py-2.5 min-w-[90px]">Último login</th>
            <th className="px-3 py-2.5 min-w-[70px] text-center">Proyectos</th>
            <th className="px-3 py-2.5 min-w-[90px]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <UsuarioRow
              key={u.id}
              user={u}
              onViewDetail={onViewDetail}
              onImpersonate={onImpersonate}
              onQuickEdit={onQuickEdit}
            />
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-secondary">
                No se encontraron usuarios
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
