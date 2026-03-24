import { mockFeatureFlags } from '@/store/mockData'

export function isFeatureEnabled(
  flagNombre: string,
  userId?: string,
  userPlan?: string
): boolean {
  const flag = mockFeatureFlags.find((f) => f.nombre === flagNombre)
  if (!flag) return false
  if (flag.activo_global) return true
  if (userId && flag.activo_para_usuarios.includes(userId)) return true
  if (userPlan && flag.activo_para_planes.includes(userPlan)) return true
  return false
}
