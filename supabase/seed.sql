-- ObrasApp Seed Data: Proyecto "La Alejada"
-- NOTE: Run AFTER creating auth users via Supabase dashboard or Auth API.
-- Replace the UUIDs below with real auth.users IDs.

-- Placeholder UUIDs (replace after creating auth users for arq@test.com / cliente@test.com)
do $$
declare
  v_arq_id uuid := '00000000-0000-0000-0000-000000000001';
  v_cli_id uuid := '00000000-0000-0000-0000-000000000002';
  v_project_id uuid := '11111111-1111-1111-1111-111111111111';
  -- budget item IDs (categories)
  v_bi_movimiento uuid;
  v_bi_estructura uuid;
  v_bi_albanileria uuid;
  v_bi_instalaciones uuid;
  v_bi_terminaciones uuid;
  v_bi_aberturas uuid;
  v_bi_equipamiento uuid;
  v_bi_exterior uuid;
  -- budget item IDs (subcategories)
  v_bi_excavacion uuid;
  v_bi_relleno uuid;
  v_bi_retiro uuid;
  v_bi_fundaciones uuid;
  v_bi_columnas uuid;
  v_bi_vigas uuid;
  v_bi_losa uuid;
  v_bi_mamposteria uuid;
  v_bi_revoques uuid;
  v_bi_electrica uuid;
  v_bi_sanitaria uuid;
  v_bi_gas uuid;
  v_bi_pisos uuid;
  v_bi_pintura uuid;
  v_bi_revestimientos uuid;
  v_bi_ventanas uuid;
  v_bi_puertas uuid;
  v_bi_griferias uuid;
  v_bi_mesadas uuid;
  v_bi_vereda uuid;
  v_bi_parquizacion uuid;
begin

  -- ============================================
  -- USERS
  -- ============================================
  insert into public.users (id, email, name, role) values
    (v_arq_id, 'arq@test.com', 'Arquitecto Test', 'arquitecto'),
    (v_cli_id, 'cliente@test.com', 'Cliente Test', 'cliente');

  -- ============================================
  -- PROJECT: La Alejada
  -- Presupuesto total ARS: 149.075.700
  -- TC Blue: 1420
  -- ============================================
  insert into public.projects (id, name, address, architect_id, usd_rate_blue) values
    (v_project_id, 'La Alejada', 'Ruta 40 Km 1234, Mendoza', v_arq_id, 1420);

  -- ============================================
  -- PROJECT MEMBERS
  -- ============================================
  insert into public.project_members (project_id, user_id, role) values
    (v_project_id, v_arq_id, 'arquitecto'),
    (v_project_id, v_cli_id, 'cliente');

  -- ============================================
  -- EXCHANGE RATES
  -- ============================================
  insert into public.exchange_rates (project_id, date, rate_blue, created_by) values
    (v_project_id, '2026-03-01', 1420, v_arq_id),
    (v_project_id, '2026-03-15', 1420, v_arq_id);

  -- ============================================
  -- BUDGET ITEMS (categorías principales + subcategorías)
  -- Presupuesto total: 149.075.700 ARS
  -- ============================================

  -- 1. Movimiento de suelos — 8.500.000
  insert into public.budget_items (id, project_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, '1', 'Movimiento de suelos', 'gl', 1, 'Excavaciones', 8500000, 8500000, 'Movimiento de suelos')
  returning id into v_bi_movimiento;

  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_movimiento, '1.1', 'Excavación para fundaciones', 'm3', 120, 'Excavaciones', 35000, 4200000, 'Movimiento de suelos')
  returning id into v_bi_excavacion;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_movimiento, '1.2', 'Relleno y compactación', 'm3', 80, 'Excavaciones', 28000, 2240000, 'Movimiento de suelos')
  returning id into v_bi_relleno;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_movimiento, '1.3', 'Retiro de sobrante', 'viaje', 10, 'Excavaciones', 206000, 2060000, 'Movimiento de suelos')
  returning id into v_bi_retiro;

  -- 2. Estructura — 35.200.000
  insert into public.budget_items (id, project_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, '2', 'Estructura', 'gl', 1, 'Estructura', 35200000, 35200000, 'Estructura')
  returning id into v_bi_estructura;

  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_estructura, '2.1', 'Fundaciones H°A°', 'm3', 25, 'Estructura', 380000, 9500000, 'Estructura')
  returning id into v_bi_fundaciones;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_estructura, '2.2', 'Columnas H°A°', 'ml', 60, 'Estructura', 185000, 11100000, 'Estructura')
  returning id into v_bi_columnas;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_estructura, '2.3', 'Vigas H°A°', 'ml', 45, 'Estructura', 195000, 8775000, 'Estructura')
  returning id into v_bi_vigas;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_estructura, '2.4', 'Losa H°A°', 'm2', 140, 'Estructura', 41607.14, 5825000, 'Estructura')
  returning id into v_bi_losa;

  -- 3. Albañilería — 22.400.000
  insert into public.budget_items (id, project_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, '3', 'Albañilería', 'gl', 1, 'Albañilería', 22400000, 22400000, 'Albañilería')
  returning id into v_bi_albanileria;

  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_albanileria, '3.1', 'Mampostería de ladrillos', 'm2', 320, 'Albañilería', 42000, 13440000, 'Albañilería')
  returning id into v_bi_mamposteria;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_albanileria, '3.2', 'Revoques grueso y fino', 'm2', 580, 'Albañilería', 15448.28, 8960000, 'Albañilería')
  returning id into v_bi_revoques;

  -- 4. Instalaciones — 28.500.000
  insert into public.budget_items (id, project_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, '4', 'Instalaciones', 'gl', 1, 'Instalaciones', 28500000, 28500000, 'Instalaciones')
  returning id into v_bi_instalaciones;

  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_instalaciones, '4.1', 'Instalación eléctrica', 'gl', 1, 'Electricidad', 12000000, 12000000, 'Instalaciones')
  returning id into v_bi_electrica;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_instalaciones, '4.2', 'Instalación sanitaria', 'gl', 1, 'Plomería', 9500000, 9500000, 'Instalaciones')
  returning id into v_bi_sanitaria;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_instalaciones, '4.3', 'Instalación de gas', 'gl', 1, 'Gasista', 7000000, 7000000, 'Instalaciones')
  returning id into v_bi_gas;

  -- 5. Terminaciones — 25.800.000
  insert into public.budget_items (id, project_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, '5', 'Terminaciones', 'gl', 1, 'Terminaciones', 25800000, 25800000, 'Terminaciones')
  returning id into v_bi_terminaciones;

  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_terminaciones, '5.1', 'Pisos cerámicos', 'm2', 140, 'Terminaciones', 65000, 9100000, 'Terminaciones')
  returning id into v_bi_pisos;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_terminaciones, '5.2', 'Pintura interior/exterior', 'm2', 600, 'Pintura', 18000, 10800000, 'Terminaciones')
  returning id into v_bi_pintura;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_terminaciones, '5.3', 'Revestimientos baños', 'm2', 45, 'Terminaciones', 131111.11, 5900000, 'Terminaciones')
  returning id into v_bi_revestimientos;

  -- 6. Aberturas — 15.200.000
  insert into public.budget_items (id, project_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, '6', 'Aberturas', 'gl', 1, 'Aberturas', 15200000, 15200000, 'Aberturas')
  returning id into v_bi_aberturas;

  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_aberturas, '6.1', 'Ventanas aluminio DVH', 'un', 12, 'Carpintería', 850000, 10200000, 'Aberturas')
  returning id into v_bi_ventanas;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_aberturas, '6.2', 'Puertas interiores', 'un', 8, 'Carpintería', 625000, 5000000, 'Aberturas')
  returning id into v_bi_puertas;

  -- 7. Equipamiento — 8.475.700
  insert into public.budget_items (id, project_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, '7', 'Equipamiento', 'gl', 1, 'Equipamiento', 8475700, 8475700, 'Equipamiento')
  returning id into v_bi_equipamiento;

  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_equipamiento, '7.1', 'Griferías y sanitarios', 'gl', 1, 'Equipamiento', 4500000, 4500000, 'Equipamiento')
  returning id into v_bi_griferias;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_equipamiento, '7.2', 'Mesadas y muebles fijos', 'gl', 1, 'Equipamiento', 3975700, 3975700, 'Equipamiento')
  returning id into v_bi_mesadas;

  -- 8. Exterior — 5.000.000
  insert into public.budget_items (id, project_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, '8', 'Exterior y paisajismo', 'gl', 1, 'Exterior', 5000000, 5000000, 'Exterior')
  returning id into v_bi_exterior;

  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_exterior, '8.1', 'Vereda perimetral', 'm2', 60, 'Albañilería', 45000, 2700000, 'Exterior')
  returning id into v_bi_vereda;
  insert into public.budget_items (id, project_id, parent_id, item_code, description, unit, quantity, gremio, unit_price, total_price, category)
  values (gen_random_uuid(), v_project_id, v_bi_exterior, '8.2', 'Parquización', 'gl', 1, 'Exterior', 2300000, 2300000, 'Exterior')
  returning id into v_bi_parquizacion;

  -- ============================================
  -- EXPENSES (gastos registrados → apuntan a subcategorías)
  -- ============================================

  -- Movimiento de suelos — gastado 8.200.000
  insert into public.expenses (project_id, budget_item_id, date, provider, detail, amount_ars, amount_usd, exchange_rate, payment_method, week_number, created_by) values
    (v_project_id, v_bi_excavacion, '2026-01-15', 'Excavaciones del Sur', 'Excavación completa', 4200000, 2957.75, 1420, 'transferencia', 3, v_arq_id),
    (v_project_id, v_bi_relleno, '2026-01-22', 'Excavaciones del Sur', 'Relleno y compactación', 2100000, 1478.87, 1420, 'transferencia', 4, v_arq_id),
    (v_project_id, v_bi_retiro, '2026-01-29', 'Transportes Ruiz', 'Retiro sobrante 10 viajes', 1900000, 1338.03, 1420, 'efectivo', 5, v_arq_id);

  -- Estructura — gastado 28.750.000
  insert into public.expenses (project_id, budget_item_id, date, provider, detail, amount_ars, amount_usd, exchange_rate, payment_method, week_number, created_by) values
    (v_project_id, v_bi_fundaciones, '2026-02-03', 'Hormigonera Central', 'Hormigón para fundaciones', 9500000, 6690.14, 1420, 'transferencia', 6, v_arq_id),
    (v_project_id, v_bi_columnas, '2026-02-10', 'Hierros Mendoza', 'Hierro para columnas y vigas', 8500000, 5985.92, 1420, 'transferencia', 7, v_arq_id),
    (v_project_id, v_bi_columnas, '2026-02-17', 'Encofrados SRL', 'Encofrado y mano de obra columnas', 5750000, 4049.30, 1420, 'cheque', 8, v_arq_id),
    (v_project_id, v_bi_losa, '2026-02-24', 'Hormigonera Central', 'Hormigón losa + bomba', 5000000, 3521.13, 1420, 'transferencia', 9, v_arq_id);

  -- Albañilería — gastado 15.300.000
  insert into public.expenses (project_id, budget_item_id, date, provider, detail, amount_ars, amount_usd, exchange_rate, payment_method, week_number, created_by) values
    (v_project_id, v_bi_mamposteria, '2026-03-03', 'Corralón El Constructor', 'Ladrillos huecos 18x18x33', 7500000, 5281.69, 1420, 'transferencia', 10, v_arq_id),
    (v_project_id, v_bi_mamposteria, '2026-03-05', 'Cuadrilla García', 'Mano de obra mampostería', 4800000, 3380.28, 1420, 'efectivo', 10, v_arq_id),
    (v_project_id, v_bi_revoques, '2026-03-10', 'Corralón El Constructor', 'Cemento, cal, arena para revoques', 3000000, 2112.68, 1420, 'transferencia', 11, v_arq_id);

  -- Instalaciones — gastado 12.100.000
  insert into public.expenses (project_id, budget_item_id, date, provider, detail, amount_ars, amount_usd, exchange_rate, payment_method, week_number, created_by) values
    (v_project_id, v_bi_electrica, '2026-03-01', 'Electricidad Rodríguez', 'Materiales eléctricos + cableado', 7200000, 5070.42, 1420, 'transferencia', 9, v_arq_id),
    (v_project_id, v_bi_sanitaria, '2026-03-08', 'Sanitarios López', 'Caños, conexiones, tanque', 4900000, 3450.70, 1420, 'transferencia', 10, v_arq_id);

  -- Terminaciones — gastado 5.200.000
  insert into public.expenses (project_id, budget_item_id, date, provider, detail, amount_ars, amount_usd, exchange_rate, payment_method, week_number, created_by) values
    (v_project_id, v_bi_pisos, '2026-03-12', 'Cerámica San Lorenzo', 'Pisos porcellanato 60x60', 5200000, 3661.97, 1420, 'transferencia', 11, v_arq_id);

  -- Aberturas — gastado 2.800.000
  insert into public.expenses (project_id, budget_item_id, date, provider, detail, amount_ars, amount_usd, exchange_rate, payment_method, week_number, created_by) values
    (v_project_id, v_bi_ventanas, '2026-03-14', 'Aluminios Cuyo', 'Seña ventanas DVH (4 unidades)', 2800000, 1971.83, 1420, 'transferencia', 11, v_arq_id);

  -- ============================================
  -- COMMENTS
  -- ============================================
  insert into public.comments (project_id, budget_item_id, expense_id, user_id, text) values
    (v_project_id, v_bi_estructura, null, v_arq_id, 'La estructura está casi completa, falta el curado de la losa.'),
    (v_project_id, v_bi_instalaciones, null, v_cli_id, '¿Cuándo empiezan con la instalación de gas?'),
    (v_project_id, v_bi_aberturas, null, v_arq_id, 'Las ventanas tienen 30 días de entrega desde la seña.');

  -- ============================================
  -- PROVIDERS (proveedores del arquitecto)
  -- ============================================
  insert into public.providers (architect_id, nombre, apellido, rubro, telefono, email) values
    (v_arq_id, 'Carlos', 'Gómez', 'Albañilería', '351-555-0101', 'cgomez@mail.com'),
    (v_arq_id, 'María', 'López', 'Electricidad', '351-555-0202', 'mlopez@mail.com'),
    (v_arq_id, 'Hernán', 'Ruiz', 'Plomería', '351-555-0303', 'hruiz@mail.com'),
    (v_arq_id, 'Corralón', 'El Constructor', 'Materiales', '351-555-0404', null),
    (v_arq_id, 'Cerámica', 'San Lorenzo', 'Revestimientos', '351-555-0505', null);

end $$;
