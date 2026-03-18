-- ObrasApp Row Level Security Policies
-- Run after schema.sql

-- ============================================
-- Enable RLS on all tables
-- ============================================
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.budget_items enable row level security;
alter table public.expenses enable row level security;
alter table public.comments enable row level security;
alter table public.exchange_rates enable row level security;

-- ============================================
-- Helper: check if user is member of a project
-- ============================================
create or replace function public.is_project_member(p_project_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project_id
      and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Helper: check if user is the architect of a project
create or replace function public.is_project_architect(p_project_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.projects
    where id = p_project_id
      and architect_id = auth.uid()
  );
$$ language sql security definer stable;

-- ============================================
-- USERS
-- ============================================
create policy "Users can read own profile"
  on public.users for select
  using (id = auth.uid());

create policy "Users can update own profile"
  on public.users for update
  using (id = auth.uid());

-- ============================================
-- PROJECTS
-- ============================================
-- Arquitecto: ve y edita solo sus proyectos
create policy "Architect can select own projects"
  on public.projects for select
  using (
    architect_id = auth.uid()
    or public.is_project_member(id)
  );

create policy "Architect can insert projects"
  on public.projects for insert
  with check (architect_id = auth.uid());

create policy "Architect can update own projects"
  on public.projects for update
  using (architect_id = auth.uid());

create policy "Architect can delete own projects"
  on public.projects for delete
  using (architect_id = auth.uid());

-- ============================================
-- PROJECT MEMBERS
-- ============================================
create policy "Members visible to project participants"
  on public.project_members for select
  using (public.is_project_member(project_id) or public.is_project_architect(project_id));

create policy "Only architect can manage members"
  on public.project_members for insert
  with check (public.is_project_architect(project_id));

create policy "Only architect can remove members"
  on public.project_members for delete
  using (public.is_project_architect(project_id));

-- ============================================
-- BUDGET ITEMS
-- Solo el arquitecto puede crear/editar
-- ============================================
create policy "Project participants can view budget items"
  on public.budget_items for select
  using (public.is_project_member(project_id) or public.is_project_architect(project_id));

create policy "Only architect can insert budget items"
  on public.budget_items for insert
  with check (public.is_project_architect(project_id));

create policy "Only architect can update budget items"
  on public.budget_items for update
  using (public.is_project_architect(project_id));

create policy "Only architect can delete budget items"
  on public.budget_items for delete
  using (public.is_project_architect(project_id));

-- ============================================
-- EXPENSES
-- Cliente y arquitecto pueden crear en sus proyectos
-- ============================================
create policy "Project participants can view expenses"
  on public.expenses for select
  using (public.is_project_member(project_id) or public.is_project_architect(project_id));

create policy "Project participants can create expenses"
  on public.expenses for insert
  with check (
    (public.is_project_member(project_id) or public.is_project_architect(project_id))
    and created_by = auth.uid()
  );

create policy "Creator or architect can update expenses"
  on public.expenses for update
  using (
    created_by = auth.uid()
    or public.is_project_architect(project_id)
  );

create policy "Creator or architect can delete expenses"
  on public.expenses for delete
  using (
    created_by = auth.uid()
    or public.is_project_architect(project_id)
  );

-- ============================================
-- COMMENTS
-- Cliente y arquitecto pueden crear en sus proyectos
-- ============================================
create policy "Project participants can view comments"
  on public.comments for select
  using (public.is_project_member(project_id) or public.is_project_architect(project_id));

create policy "Project participants can create comments"
  on public.comments for insert
  with check (
    (public.is_project_member(project_id) or public.is_project_architect(project_id))
    and user_id = auth.uid()
  );

-- ============================================
-- EXCHANGE RATES
-- ============================================
create policy "Project participants can view exchange rates"
  on public.exchange_rates for select
  using (public.is_project_member(project_id) or public.is_project_architect(project_id));

create policy "Only architect can set exchange rates"
  on public.exchange_rates for insert
  with check (public.is_project_architect(project_id) and created_by = auth.uid());

create policy "Only architect can update exchange rates"
  on public.exchange_rates for update
  using (public.is_project_architect(project_id));
