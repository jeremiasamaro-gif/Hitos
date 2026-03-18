-- ObrasApp Schema
-- Run: supabase db push

-- ============================================
-- USERS
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  role text not null check (role in ('arquitecto', 'cliente')),
  honorario_direccion numeric(5,2) not null default 0,
  honorario_proyecto numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- PROJECTS
-- ============================================
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  architect_id uuid not null references public.users(id) on delete cascade,
  usd_rate_blue numeric(12,2) not null default 0,
  obra_type text,
  description text,
  start_date date,
  end_date_estimated date,
  weeks_estimated integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- PROJECT MEMBERS
-- ============================================
create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('arquitecto', 'cliente')),
  created_at timestamptz not null default now(),
  unique (project_id, user_id)
);

-- ============================================
-- BUDGET ITEMS
-- ============================================
create table public.budget_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_id uuid references public.budget_items(id) on delete cascade,
  item_code text,
  description text not null,
  unit text,
  quantity numeric(12,2) not null default 0,
  gremio text,
  unit_price numeric(14,2) not null default 0,
  total_price numeric(14,2) not null default 0,
  category text,
  week_number integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- EXPENSES
-- ============================================
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  budget_item_id uuid references public.budget_items(id) on delete set null,
  date date not null default current_date,
  provider text,
  detail text,
  amount_ars numeric(14,2) not null default 0,
  amount_usd numeric(14,2) not null default 0,
  exchange_rate numeric(12,2),
  payment_method text,
  week_number int,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- COMMENTS
-- ============================================
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  budget_item_id uuid references public.budget_items(id) on delete cascade,
  expense_id uuid references public.expenses(id) on delete cascade,
  user_id uuid not null references public.users(id),
  text text not null,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================
-- EXCHANGE RATES
-- ============================================
create table public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  date date not null default current_date,
  rate_blue numeric(12,2) not null,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  unique (project_id, date)
);

-- ============================================
-- PROVIDERS
-- ============================================
create table public.providers (
  id uuid primary key default gen_random_uuid(),
  architect_id uuid not null references public.users(id) on delete cascade,
  nombre text not null,
  apellido text,
  rubro text,
  telefono text,
  email text,
  notas text,
  created_at timestamptz not null default now()
);

-- RLS for providers
-- create policy "arquitecto gestiona sus proveedores"
-- on providers for all
-- using (architect_id = auth.uid());

-- ============================================
-- INDEXES
-- ============================================
create index idx_projects_architect on public.projects(architect_id);
create index idx_project_members_project on public.project_members(project_id);
create index idx_project_members_user on public.project_members(user_id);
create index idx_budget_items_project on public.budget_items(project_id);
create index idx_budget_items_parent on public.budget_items(parent_id);
create index idx_expenses_project on public.expenses(project_id);
create index idx_expenses_budget_item on public.expenses(budget_item_id);
create index idx_expenses_date on public.expenses(date);
create index idx_comments_project on public.comments(project_id);
create index idx_exchange_rates_project_date on public.exchange_rates(project_id, date);
create index idx_providers_architect on public.providers(architect_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.projects
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.budget_items
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.expenses
  for each row execute function public.handle_updated_at();
