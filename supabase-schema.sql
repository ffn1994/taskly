-- =============================================
-- Taskly Database Schema — Full Production Setup
-- Run this in your Supabase SQL Editor
-- =============================================

-- Tasks table with user_id
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  priority text not null check (priority in (
    'urgent-important',
    'important-not-urgent',
    'urgent-not-important',
    'not-urgent-not-important'
  )),
  category text not null check (category in (
    'meetings', 'finance', 'planning', 'review',
    'communication', 'admin', 'personal', 'other'
  )),
  due_date date,
  due_time time,
  estimated_duration integer,
  status text not null default 'pending' check (status in ('pending', 'in-progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User profiles table
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text default 'مستخدم',
  working_hours_start text default '09:00',
  working_hours_end text default '17:00',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'مستخدم'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable RLS
alter table tasks enable row level security;
alter table profiles enable row level security;

-- RLS Policies for tasks
create policy "Users can view their own tasks"
  on tasks for select using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on tasks for insert with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on tasks for update using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on tasks for delete using (auth.uid() = user_id);

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Indexes
create index if not exists tasks_user_id_idx on tasks(user_id);
create index if not exists tasks_status_idx on tasks(status);
create index if not exists tasks_due_date_idx on tasks(due_date);
create index if not exists tasks_priority_idx on tasks(priority);
create index if not exists tasks_completed_at_idx on tasks(completed_at);
