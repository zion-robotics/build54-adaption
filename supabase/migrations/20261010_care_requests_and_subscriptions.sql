-- CareLink asynchronous care: patient requests are clinician-reviewed records.
create table if not exists public.care_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  provider_id uuid references public.profiles(id) on delete set null,
  complaint text not null check (char_length(complaint) between 10 and 4000),
  ai_summary text,
  ai_questions jsonb not null default '[]'::jsonb,
  ai_answers jsonb not null default '{}'::jsonb,
  urgency text not null default 'routine' check (urgency in ('routine', 'priority', 'urgent')),
  status text not null default 'awaiting_clinician' check (status in ('awaiting_clinician', 'needs_information', 'clinician_reviewed', 'appointment_required', 'closed')),
  clinician_response text,
  clinician_action text check (clinician_action in ('self_care', 'medication', 'ask_questions', 'physical_exam', 'emergency_referral')),
  appointment_id uuid references public.appointments(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists care_requests_patient_created_idx on public.care_requests(patient_id, created_at desc);
create index if not exists care_requests_provider_status_idx on public.care_requests(provider_id, status, created_at asc);

alter table public.care_requests enable row level security;
create policy "Patients can read their care requests" on public.care_requests for select using (patient_id = (select id from public.profiles where auth_id = auth.uid()));
create policy "Patients can create their care requests" on public.care_requests for insert with check (patient_id = (select id from public.profiles where auth_id = auth.uid()));
create policy "Patients can update their unanswered requests" on public.care_requests for update using (patient_id = (select id from public.profiles where auth_id = auth.uid()) and status = 'needs_information');
create policy "Providers can read assigned care requests" on public.care_requests for select using (provider_id = (select id from public.profiles where auth_id = auth.uid()));
create policy "Providers can respond to assigned care requests" on public.care_requests for update using (provider_id = (select id from public.profiles where auth_id = auth.uid()));

-- Subscription records are updated only after a verified server-side payment event.
create table if not exists public.care_subscriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null unique references public.profiles(id) on delete cascade,
  plan_code text not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'past_due', 'cancelled')),
  provider text not null default 'bmoni',
  provider_customer_id text,
  provider_reference text unique,
  current_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.care_subscriptions enable row level security;
create policy "Patients can read their subscription" on public.care_subscriptions for select using (patient_id = (select id from public.profiles where auth_id = auth.uid()));
create policy "Patients can record a pending subscription" on public.care_subscriptions for insert with check (patient_id = (select id from public.profiles where auth_id = auth.uid()) and status = 'pending');
create policy "Patients can refresh their pending subscription" on public.care_subscriptions for update using (patient_id = (select id from public.profiles where auth_id = auth.uid()) and status = 'pending') with check (patient_id = (select id from public.profiles where auth_id = auth.uid()) and status = 'pending');

-- A booked examination expires five minutes after its planned start unless the
-- clinic checks the patient in. Existing appointments are unaffected.
alter table public.appointments add column if not exists check_in_deadline timestamptz;
alter table public.appointments add column if not exists checked_in_at timestamptz;
