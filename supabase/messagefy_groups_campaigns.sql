-- Messagefy: vincula campanhas a grupos e permite membros nos grupos.
-- Execute este SQL no Supabase SQL Editor uma vez.

alter table public.campaigns
  add column if not exists group_id uuid references public.contact_groups(id) on delete set null;

create table if not exists public.contact_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.contact_groups(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, contact_id)
);

alter table public.contact_group_members enable row level security;

-- Usuários só enxergam membros dos próprios grupos/contatos.
drop policy if exists "group members select own" on public.contact_group_members;
create policy "group members select own"
on public.contact_group_members for select
using (
  exists (
    select 1 from public.contact_groups g
    where g.id = contact_group_members.group_id
      and g.user_id = auth.uid()
  )
);

drop policy if exists "group members insert own" on public.contact_group_members;
create policy "group members insert own"
on public.contact_group_members for insert
with check (
  exists (
    select 1 from public.contact_groups g
    where g.id = contact_group_members.group_id
      and g.user_id = auth.uid()
  )
  and exists (
    select 1 from public.contacts c
    where c.id = contact_group_members.contact_id
      and c.user_id = auth.uid()
  )
);

drop policy if exists "group members delete own" on public.contact_group_members;
create policy "group members delete own"
on public.contact_group_members for delete
using (
  exists (
    select 1 from public.contact_groups g
    where g.id = contact_group_members.group_id
      and g.user_id = auth.uid()
  )
);
