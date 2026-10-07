-- DSAViz: one row of progress per user. Run in Supabase: SQL Editor -> New query -> Run.
-- Safe to run more than once.

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default {}::jsonb,
  updated_at timestamptz not null default now()
);

-- Nobody can touch rows unless a policy below allows it
alter table public.user_progress enable row level security;

drop policy if exists "Users can read their own progress" on public.user_progress;
create policy "Users can read their own progress"
  on public.user_progress for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own progress" on public.user_progress;
create policy "Users can insert their own progress"
  on public.user_progress for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own progress" on public.user_progress;
create policy "Users can update their own progress"
  on public.user_progress for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);