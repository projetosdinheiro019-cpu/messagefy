-- Integração de créditos com PanteraPay.
-- Execute este arquivo no Supabase SQL Editor.

create table if not exists public.panterapay_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id uuid not null references public.credit_packages(id) on delete restrict,
  provider_transaction_id text unique,
  amount_cents integer not null check (amount_cents > 0),
  credits integer not null check (credits > 0),
  status text not null default 'pending' check (status in ('pending','paid','failed')),
  qr_code text,
  copy_paste text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index if not exists panterapay_payments_user_idx on public.panterapay_payments(user_id, created_at desc);
create index if not exists panterapay_payments_status_idx on public.panterapay_payments(status);

alter table public.panterapay_payments enable row level security;

drop policy if exists "Users can view own PanteraPay payments" on public.panterapay_payments;
create policy "Users can view own PanteraPay payments"
on public.panterapay_payments for select
using (auth.uid() = user_id);

create or replace function public.confirm_panterapay_payment(
  p_payment_id uuid,
  p_provider_transaction_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment public.panterapay_payments%rowtype;
  v_new_balance integer;
begin
  select * into v_payment
  from public.panterapay_payments
  where id = p_payment_id
    and provider_transaction_id = p_provider_transaction_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'payment_not_found');
  end if;

  if v_payment.status = 'paid' then
    select balance into v_new_balance from public.credits where user_id = v_payment.user_id;
    return jsonb_build_object('ok', true, 'already_processed', true, 'balance', coalesce(v_new_balance, 0));
  end if;

  update public.panterapay_payments
  set status = 'paid', paid_at = now()
  where id = v_payment.id;

  update public.credits
  set balance = coalesce(balance, 0) + v_payment.credits
  where user_id = v_payment.user_id;

  if not found then
    insert into public.credits(user_id, balance)
    values (v_payment.user_id, v_payment.credits);
  end if;

  select balance into v_new_balance from public.credits where user_id = v_payment.user_id;
  return jsonb_build_object('ok', true, 'credits_added', v_payment.credits, 'balance', coalesce(v_new_balance, 0));
end;
$$;

revoke all on function public.confirm_panterapay_payment(uuid, text) from public;
grant execute on function public.confirm_panterapay_payment(uuid, text) to service_role;
