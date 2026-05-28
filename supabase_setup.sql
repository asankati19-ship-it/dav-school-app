-- ============================================================
-- D.A.V. Mukhyamantri Public School — Supabase Database Setup
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- 1. Create the students table
create table if not exists public.students (
  id            uuid primary key default gen_random_uuid(),
  adm_no        text not null unique,
  name          text not null,
  father_name   text,
  mother_name   text,
  dob           date,
  address       text,
  adm_date      date not null,
  tc_date       date,
  class_of_study text,
  religion      text,
  caste         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- 2. Auto-update the updated_at column on any row change
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger students_updated_at
  before update on public.students
  for each row execute procedure public.handle_updated_at();

-- 3. Enable Row Level Security (keeps data private)
alter table public.students enable row level security;

-- 4. Only authenticated (logged-in) staff can read or write data
create policy "Authenticated users can read students"
  on public.students for select
  to authenticated using (true);

create policy "Authenticated users can insert students"
  on public.students for insert
  to authenticated with check (true);

create policy "Authenticated users can update students"
  on public.students for update
  to authenticated using (true);

create policy "Authenticated users can delete students"
  on public.students for delete
  to authenticated using (true);

-- 5. Optional: insert sample data to test with
insert into public.students (adm_no, name, father_name, mother_name, dob, address, adm_date, class_of_study, religion, caste)
values
  ('101', 'Rahul Kumar',  'Ramesh Kumar', 'Sita Devi',   '2012-05-14', 'Ulloor, Bhopalpatnam',          '2026-06-01', 'Class V',   'Hindu', 'General'),
  ('102', 'Priya Sharma', 'Arun Sharma',  'Meena Sharma', '2013-03-22', 'Ward No. 3, Bhopalpatnam',      '2026-06-01', 'Class IV',  'Hindu', 'OBC'),
  ('103', 'Suresh Naik',  'Raju Naik',    'Kamla Naik',  '2011-11-08', 'Kothagudem Road, Bhopalpatnam', '2026-06-01', 'Class VII', 'Hindu', 'ST');
