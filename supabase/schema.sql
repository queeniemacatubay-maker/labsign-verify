-- LabSign Verify database schema
-- Run this in Supabase SQL Editor after creating your Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  designation text not null default 'Registered Medical Technologist',
  facility_name text not null default '',
  role text not null default 'pending' check (role in ('admin','pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.date_authorizations (
  id uuid primary key default gen_random_uuid(),
  approved_date date not null unique,
  approved_at timestamptz not null default now(),
  approved_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists date_authorizations_date_idx on public.date_authorizations(approved_date desc);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  event_type text not null,
  event_date date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.date_authorizations enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "admin reads own profile" on public.profiles;
create policy "admin reads own profile" on public.profiles for select to authenticated
using (id = auth.uid() and role = 'admin');
drop policy if exists "admin updates own profile" on public.profiles;
create policy "admin updates own profile" on public.profiles for update to authenticated
using (id = auth.uid() and role = 'admin')
with check (id = auth.uid() and role = 'admin');

drop policy if exists "admin reads authorization history" on public.date_authorizations;
create policy "admin reads authorization history" on public.date_authorizations for select to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

drop policy if exists "admin reads audit events" on public.audit_events;
create policy "admin reads audit events" on public.audit_events for select to authenticated
using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

-- Create a private profile automatically for each Auth user. New users are pending,
-- and cannot administer the system until manually promoted by the owner in SQL.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'pending');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.philippine_today()
returns date language sql stable security invoker
as $$ select (now() at time zone 'Asia/Manila')::date $$;
grant execute on function public.philippine_today() to authenticated;

create or replace function public.approve_current_date()
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_date date; v_id uuid; v_time timestamptz;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'
  ) then raise exception 'Administrator access required'; end if;

  v_date := (now() at time zone 'Asia/Manila')::date;
  v_time := now();
  insert into public.date_authorizations(approved_date, approved_at, approved_by)
  values (v_date, v_time, auth.uid())
  on conflict (approved_date) do nothing
  returning id into v_id;

  if v_id is null then raise exception 'Date already approved'; end if;

  insert into public.audit_events(actor_id,event_type,event_date)
  values(auth.uid(),'date_approved',v_date);

  return jsonb_build_object('approved_date',v_date,'approved_at',v_time);
end;
$$;
revoke all on function public.approve_current_date() from public, anon;
grant execute on function public.approve_current_date() to authenticated;

-- Public verification returns only the approved date and configured professional
-- identity/facility details. No patient or report data is collected.
create or replace function public.verify_issuance_date(p_date date)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_auth public.date_authorizations%rowtype;
declare v_profile public.profiles%rowtype;
begin
  select * into v_auth from public.date_authorizations where approved_date=p_date limit 1;
  if not found then
    return jsonb_build_object('status','not_authorized');
  end if;

  select * into v_profile from public.profiles where id=v_auth.approved_by;
  return jsonb_build_object(
    'status','authorized',
    'approved_date',v_auth.approved_date,
    'approved_at',v_auth.approved_at,
    'signatory',v_profile.full_name,
    'designation',v_profile.designation,
    'facility',v_profile.facility_name
  );
end;
$$;
revoke all on function public.verify_issuance_date(date) from public;
grant execute on function public.verify_issuance_date(date) to anon, authenticated;

-- Restrict direct writes: only the security-definer approval RPC can insert approvals.
revoke insert, update, delete on public.date_authorizations from anon, authenticated;
revoke insert, update, delete on public.audit_events from anon, authenticated;
