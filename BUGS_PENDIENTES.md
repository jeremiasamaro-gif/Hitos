# Bugs Pendientes de Fix

Bugs detectados durante la auditoría QA que NO se pudieron arreglar sin riesgo de romper otros módulos.

**Última actualización:** 2026-03-28

---

## BLK-003 (parcial) — Migrar callsites a `convertExpenseAmount()`

**Estado:** ✅ Función `convertExpenseAmount()` creada. ✅ TC lockeado en `createExpense()`. ⚠️ Callsites en PNL/agregados siguen usando `convert()` global (correcto por ahora, ver abajo).

**Por qué los callsites de PNL no se migraron:**
`pnlUtils.ts::buildLineItems()` y `pnlCalculations.ts::calculatePnlRows()` reciben `convert` como callback y lo aplican sobre **sumas agregadas** (`amountMap.get(id)` = suma de múltiples gastos por rubro). No hay un `Expense` individual disponible en ese punto — migrarlos requeriría refactorizar la firma completa para recibir los `Expense[]` originales y sumarlos ya convertidos.

**Callsites que SÍ deberían migrarse (pero no son parte de los archivos target):**
- `src/components/expenses/ExpenseTable.tsx` — `convert(exp.amount_ars)` → candidato directo
- `src/components/payments/PaymentTable.tsx` — `convert(p.amount_ars)` → candidato directo

**Qué habría que hacer para arreglarlo completamente:**
1. Refactorizar `buildLineItems()` para recibir `Expense[]` y acumular con `convertExpenseAmount()`.
2. Refactorizar `calculatePnlRows()` igual.
3. Migrar `ExpenseTable.tsx` y `PaymentTable.tsx` a `convertExpenseAmount(exp, mode, tcBlue)`.

*Requiere migración a Supabase RLS para que los TCs históricos estén disponibles en queries.*

---

## BLK-004 — Guard de membresía en ProjectProvider

**Estado:** Comentario TODO agregado en `src/contexts/ProjectContext.tsx`.

**Motivo por el que no se arregló:**
La app actualmente usa mock data (`mockProjectMembers` array local). No hay query real a Supabase. Un guard basado en mock data no provee seguridad real ya que el array es manipulable desde el cliente.

**Qué habría que hacer para arreglarlo correctamente:**
1. Migrar autenticación y autorización a Supabase Auth + RLS.
2. Agregar query `supabase.from('project_members').select('role').eq(...)` en ProjectProvider.
3. Si no es miembro ni owner (`project.architect_id === user.id`), redirect a `/projects`.
4. Agregar RLS policy en `project_members` que solo permita leer filas propias.
5. Agregar RLS policy en `projects` que solo permita acceso a miembros.

---

## CRT-002 — Admin check 100% client-side

**Motivo por el que no se arregló:**
El sistema de admin usa `mockAdminUsers` para verificar acceso. Es inherente al modo mock. No hay backend real que validar.

**Qué habría que hacer:**
1. Crear tabla `admin_users` en Supabase.
2. Crear RLS policy que solo admins puedan leer tablas admin.
3. Mover `AdminGuard` a validar contra Supabase en vez de mock array.
4. Agregar middleware de Supabase Edge Functions para endpoints admin.

---

## CRT-004 — Firma y logo al PDF ✅ RESUELTO

**Resuelto en:** 2026-03-28

**Cambios realizados:**
- `ExportPDFButton.tsx`: lee `firma_url`, `firma_en_pdf`, `logo_url` del usuario logueado y los pasa en `reportData`.
- `ProjectReport.tsx`: `ReportData` ahora incluye `firmaUrl`, `firmaEnPdf`, `logoUrl`. Propaga a `CoverPage` y `FooterNote`.
- `CoverPage.tsx`: renderiza logo (max 120px) si `logoUrl` es válida.
- `FooterNote.tsx`: renderiza firma si `firmaEnPdf=true` y `firmaUrl` es válida (CRT-007).

---

## CRT-007 — Imagen inválida crashea PDF ✅ RESUELTO

**Resuelto en:** 2026-03-28

**Cambios realizados:**
- `FooterNote.tsx` y `CoverPage.tsx`: añadida función `isValidImageUrl()` que valida protocolo `http:`/`https:` antes de renderizar `<Image>`. URLs inválidas o `null` son ignoradas silenciosamente.

---

## MAJ-001 — Sin validación de montos negativos en gastos ✅ RESUELTO

**Resuelto en:** 2026-03-28

**Cambios realizados:**
- `ExpenseFormModal.tsx`: valida `amount_ars < 0` y `amount_usd < 0` antes de submit. Muestra error inline rojo.
- `expenseStore.ts::createExpense()`: throw si `data.amount_ars < 0`.
- `expenseStore.ts::updateExpense()`: throw si `data.amount_ars !== undefined && data.amount_ars < 0`.

---

## CRT-005 (server-side) — Verificación de estado requiere RLS

**Estado:** Check client-side implementado en `ProtectedRoute.tsx` (usuarios suspendidos son redirigidos y deslogueados). Pero es bypasseable desde consola.

**Qué habría que hacer para fix server-side:**
1. Agregar RLS policy `auth.jwt() ->> 'estado' = 'activo'` en todas las tablas.
2. Agregar webhook de Supabase Auth que revoque tokens de usuarios suspendidos.

---

## CRT-003 (server-side) — Impersonación requiere re-autenticación con password

**Estado:** Modal de confirmación, audit log (mock), timeout de 30 min, y restauración de sesión admin implementados. Falta re-autenticación con password real.

**Qué habría que hacer:**
1. Agregar input de contraseña en el modal de confirmación.
2. Validar contra Supabase Auth antes de permitir impersonación.
3. Migrar audit log a tabla de Supabase.

*Requiere migración a Supabase RLS.*

---

## PENDIENTES QUE REQUIEREN MIGRACIÓN A SUPABASE RLS

Los siguientes 5 ítems no pueden resolverse en el entorno mock. Están bloqueados hasta la migración a Supabase real:

1. **BLK-003 (PNL callsites)** — Refactorizar `buildLineItems()` y `calculatePnlRows()` para usar TC histórico por gasto. Requiere que `exchange_rate` esté persistido confiablemente en la DB.

2. **BLK-004 — Guard de membresía** — La verificación de `project_members` debe hacerse contra Supabase con RLS, no contra array mock.

3. **CRT-002 — Admin check server-side** — `AdminGuard` debe validar contra tabla `admin_users` en Supabase con RLS policy.

4. **CRT-005 — Estado de usuario server-side** — Suspensión y verificación de estado deben propagarse via RLS policies y webhook de Supabase Auth para revocar tokens.

5. **CRT-003 — Re-autenticación en impersonación** — Validar password real contra Supabase Auth y migrar audit log a tabla real.
