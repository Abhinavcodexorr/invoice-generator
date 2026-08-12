-- Run this in the Supabase SQL editor

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  business_name text,
  business_address text,
  logo_url text,
  default_currency text not null default 'USD',
  theme text not null default 'classic',
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'invoice',
  number text not null default '1',
  currency text not null default 'USD',
  theme text not null default 'classic',
  status text not null default 'draft',
  from_text text not null default '',
  to_text text not null default '',
  ship_to_text text not null default '',
  date text not null default '',
  due_date text not null default '',
  payment_terms text not null default '',
  po_number text not null default '',
  labels jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  tax_mode text not null default 'percent',
  tax_value numeric not null default 0,
  discount_mode text not null default 'off',
  discount_value numeric not null default 0,
  shipping_mode text not null default 'off',
  shipping_value numeric not null default 0,
  amount_paid numeric not null default 0,
  notes text not null default '',
  terms text not null default '',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists documents_user_id_idx on public.documents (user_id);
create index if not exists documents_updated_at_idx on public.documents (updated_at desc);

alter table public.profiles enable row level security;
alter table public.documents enable row level security;

create policy "profiles select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles insert own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "documents select own"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "documents insert own"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "documents update own"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "documents delete own"
  on public.documents for delete
  using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

create policy "logo upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logo update own"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logo delete own"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "logo public read"
  on storage.objects for select
  using (bucket_id = 'logos');
