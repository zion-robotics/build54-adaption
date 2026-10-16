-- Required foundation for CareLink authentication. Apply this migration to the
-- same Supabase project named by VITE_PUBLIC_SUPABASE_URL.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  role text not null check (role in ('patient', 'provider')),
  full_name text not null,
  first_name text,
  email text,
  specialty text,
  hospital text,
  insurance text,
  primary_doctor text,
  avatar_url text,
  title text,
  license_number text,
  years_experience integer,
  phone text,
  practice_address text,
  bio text,
  languages text[],
  consultation_modes text[],
  working_days text[],
  working_hours text,
  accepting_patients boolean default true,
  onboarding_completed boolean default false,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read profiles" on public.profiles
  for select to authenticated using (true);
create policy "Users can create their own profile" on public.profiles
  for insert to authenticated with check (auth_id = auth.uid());
create policy "Users can update their own profile" on public.profiles
  for update to authenticated using (auth_id = auth.uid()) with check (auth_id = auth.uid());

-- Core scheduling table. It is defined here because care-request migrations
-- and the existing patient/provider portals both depend on it.
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid references public.profiles(id) on delete set null,
  doctor_name text not null,
  specialty text,
  clinic text,
  type text not null default 'In-person',
  date date not null,
  time text not null,
  status text not null default 'upcoming',
  reason text,
  created_at timestamptz not null default now()
);
alter table public.appointments enable row level security;
create policy "Patients can manage their appointments" on public.appointments
  for all to authenticated using (patient_id = (select id from public.profiles where auth_id = auth.uid())) with check (patient_id = (select id from public.profiles where auth_id = auth.uid()));
create policy "Providers can manage their appointments" on public.appointments
  for all to authenticated using (provider_id = (select id from public.profiles where auth_id = auth.uid())) with check (provider_id = (select id from public.profiles where auth_id = auth.uid()));
