// ============================================
// CRT-102: Impersonation Write Guard
// Bloquea operaciones de escritura mientras el admin
// está impersonando una cuenta ajena.
//
// Motivo: si el admin realiza cambios durante impersonación,
// los logs quedan registrados como del usuario impersonado,
// no del admin real → manipulación de datos sin trazabilidad.
// ============================================

export function isImpersonating(): boolean {
  try {
    return !!sessionStorage.getItem('hitos-impersonating')
  } catch {
    return false
  }
}

export function assertNotImpersonating(action: string): void {
  if (isImpersonating()) {
    throw new ImpersonationWriteError(action)
  }
}

export class ImpersonationWriteError extends Error {
  readonly action: string

  constructor(action: string) {
    super(
      `Acción bloqueada durante impersonación: ${action}. ` +
      `Salí de la sesión de impersonación para realizar cambios.`
    )
    this.name = 'ImpersonationWriteError'
    this.action = action
  }
}
