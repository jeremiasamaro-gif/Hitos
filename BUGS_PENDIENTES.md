# Bugs Pendientes de Fix

Bugs detectados durante la auditoría QA que NO se pudieron arreglar sin riesgo de romper otros módulos.

**Última actualización:** 2026-04-06

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

## BLK-101 — Guard de membresía en ProjectProvider ✅ RESUELTO (parcial)

**Resuelto en:** 2026-04-06

**Cambios realizados:**
- `ProjectContext.tsx`: guard que redirecta silenciosamente a `/projects` si el usuario no es miembro del proyecto ni su arquitecto dueño.
- `supabase/rls.sql`: políticas RLS documentadas para cuando se migre a Supabase real.

**Pendiente para producción:** La validación actual usa `mockProjectMembers` (array en memoria, manipulable desde consola). En Supabase deberá usar query real + RLS policy. Ver `supabase/rls.sql`.

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

## CRT-102 — Escrituras bloqueadas durante impersonación ✅ RESUELTO

**Resuelto en:** 2026-04-06

**Cambios realizados:**
- `src/lib/api/impersonationGuard.ts`: nuevo helper con `assertNotImpersonating()` y clase `ImpersonationWriteError`.
- `expenseStore.ts`: `createExpense`, `updateExpense`, `deleteExpense` → `assertNotImpersonating()` al inicio.
- `budgetStore.ts`: `createItem`, `updateItem`, `deleteItem` → `assertNotImpersonating()` al inicio.
- `ExpenseFormModal.tsx`: catch de `ImpersonationWriteError`, muestra banner amarillo de advertencia.

**Pendiente:** Aplicar `assertNotImpersonating()` también en `projectStore`, `commentStore` y `currencyStore`. Documentado abajo.

---

## CRT-003 (server-side) — Impersonación requiere re-autenticación con password

**Estado:** Modal de confirmación, audit log (mock), timeout de 30 min, y restauración de sesión admin implementados. Falta re-autenticación con password real.

**Qué habría que hacer:**
1. Agregar input de contraseña en el modal de confirmación.
2. Validar contra Supabase Auth antes de permitir impersonación.
3. Migrar audit log a tabla de Supabase.

*Requiere migración a Supabase RLS.*

---

## BLK-102 / CRT-101 — TC histórico en PNL (pnlUtils.ts) ✅ RESUELTO PARCIAL

**Resuelto en:** 2026-04-06

**Cambios realizados:**
- `expenseStore.ts::createExpense()`: calcula y guarda `amount_usd` con el TC histórico en el momento de creación.
- `SaldoMonedaDura.tsx`: saldo en USD usa `expense.amount_usd` histórico en lugar de dividir `saldoARS / tcBlue` actual.
- `pnlCalculations.ts::calculatePnlRows()`: refactorizado con `usdByItem` map y parámetro `currencyMode`. Usa TC histórico en modo USD.

**Pendiente — pnlUtils.ts::buildLineItems():** Esta función es la que usa el PNL activo (`PnlPage.tsx` → `buildPnlSections()`). Refactorizar requiere cambiar la firma de `buildPnlSections()` para aceptar `currencyMode` y construir `usdAmountMap` por período. Riesgo de regresión en PNL charts. Documentado para próxima sesión.

---

## CRT-103 — Parser de números argentinos ✅ RESUELTO

**Resuelto en:** 2026-04-06

**Cambios realizados:**
- `budgetUtils.ts`: nueva función exportada `parseArgFloat(val: unknown): number` que maneja `"1.500,50"`, `"1500,50"` y formato estándar.
- `validateImportRows()`: reemplazados `parseFloat()` por `parseArgFloat()` en `quantity`, `unitPrice` y `mappedTotal`.

---

## PENDIENTES QUE REQUIEREN MIGRACIÓN A SUPABASE RLS

Los siguientes ítems no pueden resolverse completamente en el entorno mock. Bloqueados hasta la migración a Supabase real:

1. **BLK-003 (PNL callsites)** — `pnlUtils.ts::buildLineItems()` y `ExpenseTable.tsx` / `PaymentTable.tsx` siguen usando `convert()` sobre sumas ARS. Requiere refactor completo de `buildPnlSections()`.

2. **BLK-101 (producción)** — Guard de membresía actual usa `mockProjectMembers` (bypasseable). En producción: query Supabase + RLS policy en `project_members`.

3. **CRT-002 — Admin check server-side** — `AdminGuard` debe validar contra tabla `admin_users` en Supabase con RLS policy.

4. **CRT-005 — Estado de usuario server-side** — Suspensión debe propagarse via RLS policies y webhook Supabase Auth.

5. **CRT-003 — Re-autenticación en impersonación** — Validar password real contra Supabase Auth y migrar audit log a tabla real.

6. **CRT-102 (pendiente parcial)** — `assertNotImpersonating()` aplicado en `expenseStore` y `budgetStore`. Falta aplicar en `projectStore`, `commentStore`, `currencyStore`.
