-- Finance Toolkit: tool_states migration
-- Run this in your Supabase SQL editor to set up the database.
--
-- Table: one row per user per tool, storing the full JSON state blob.

create table public.tool_states (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tool        text not null,
  data        jsonb not null default '{}',
  updated_at  timestamptz not null default now(),
  unique (user_id, tool)
);

create index tool_states_user_id_idx on public.tool_states(user_id);

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_tool_states_updated_at
  before update on public.tool_states
  for each row execute function public.set_updated_at();

-- Row Level Security: users can only access their own data
alter table public.tool_states enable row level security;

create policy "Users can read own tool states"
  on public.tool_states for select
  using (auth.uid() = user_id);

create policy "Users can insert own tool states"
  on public.tool_states for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tool states"
  on public.tool_states for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own tool states"
  on public.tool_states for delete
  using (auth.uid() = user_id);
