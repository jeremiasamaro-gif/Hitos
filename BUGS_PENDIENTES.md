# Bugs Pendientes de Fix

Bugs detectados durante la auditoría QA que NO se pudieron arreglar sin riesgo de romper otros módulos.

**Última actualización:** 2026-03-25

---

## BLK-003 (parcial) — Migrar callsites a `convertExpenseAmount()`

**Estado:** Función `convertExpenseAmount()` creada en `src/utils/currency.ts`. TC se lockea en `createExpense()`. Pero los callsites existentes siguen usando `convert()` global.

**Motivo por el que no se arregló completamente:**
Los siguientes archivos usan `convert()` de `currencyStore` que aplica `latestRate` global en vez del `exchange_rate` individual de cada gasto:
- `src/lib/pnlUtils.ts` — `buildLineItems()` recibe `convert` como callback
- `src/utils/pnlCalculations.ts` — `calculatePnlRows()` recibe `convert` como callback
- `src/components/expenses/ExpenseTable.tsx` — `convert(exp.amount_ars)`
- `src/components/payments/PaymentTable.tsx` — `convert(p.amount_ars)`
- `src/components/dashboard/SaldoMonedaDura.tsx` — cálculo de saldo
- `src/components/pnl/PNL.tsx` — pasa `convert` a buildPnlSections

Son 6+ archivos con cambios no triviales (los de PNL pasan `convert` como callback en cadena). Cambiar el callback para que use `expense.exchange_rate` requiere refactorizar la firma de `buildLineItems()` y `calculatePnlRows()` para recibir el TC por gasto en vez de una función genérica.

**Qué habría que hacer para arreglarlo correctamente:**
1. Cambiar `buildLineItems()` en `pnlUtils.ts` para que en vez de llamar `convert(amountMap.get(child.id))`, itere los expenses originales y use `convertExpenseAmount()` de cada uno.
2. Cambiar `calculatePnlRows()` en `pnlCalculations.ts` para que sume gastos ya convertidos individualmente.
3. Cambiar `ExpenseTable.tsx` y `PaymentTable.tsx` para usar `convertExpenseAmount(exp, mode, latestRate)`.
4. Actualizar `SaldoMonedaDura.tsx` para sumar gastos ya convertidos con TC individual.

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

## CRT-004 — Firma y logo NO se pasan al PDF

**Motivo por el que no se arregló:**
El fix requiere:
1. Leer `firma_url` y `firma_en_pdf` desde `useAuthStore` en `ExportPDFButton`.
2. Pasarlos como props a `ProjectReport` → `FooterNote`.
3. Agregar try-catch + placeholder en `<Image>` de `@react-pdf/renderer`.

El cambio afecta el pipeline de generación de PDF (3 archivos: ExportPDFButton, ProjectReport, FooterNote) y requiere testing manual del PDF generado para verificar que no crashee con URLs inválidas. Se documenta para fix dedicado.

---

## CRT-007 — Imagen inválida crashea PDF silenciosamente

**Motivo por el que no se arregló:**
Ligado a CRT-004. El fix de `FooterNote` requiere wrap de `<Image>` en error boundary o try-catch, más validación de URL antes de renderizar. Se arregla junto con CRT-004.

---

## MAJ-001 — Sin validación de montos negativos en gastos

**Motivo por el que no se arregló:**
Requiere agregar validación en `ExpenseFormModal` (UI) y en `createExpense` (store). El modal de gastos es complejo y un cambio incorrecto podría bloquear la carga de gastos legítimos.

**Qué habría que hacer:**
1. En `ExpenseFormModal`: validar `amount_ars > 0` antes de submit.
2. En `createExpense`: throw si `data.amount_ars < 0`.
3. En `updateExpense`: mismo check.

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
