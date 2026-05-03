-- Supabase/Postgres schema for AI Startup Validator
-- For existing databases, run the ALTER TABLE section after the CREATE TABLE section

create table if not exists users (
  id bigserial primary key,
  username text not null,
  email text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

create table if not exists startup_validations (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  startup_name text not null,
  industry text not null,
  location text not null,
  stage text not null,
  team_size integer not null,
  funding_stage text not null,
  target_audience text not null,
  problem_statement text not null,
  proposed_solution text not null,
  unique_value_proposition text not null,
  competition text not null,
  traction text not null,
  go_to_market text not null,
  revenue_model text not null,
  pricing text not null,
  timeline text not null,
  ai_feedback text not null,
  ai_insights text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_startup_validations_user_created_at
  on startup_validations (user_id, created_at desc);

-- Existing database upgrades (run if startup_validations already exists)
alter table startup_validations
  add column if not exists location text,
  add column if not exists stage text,
  add column if not exists team_size integer,
  add column if not exists funding_stage text,
  add column if not exists unique_value_proposition text,
  add column if not exists competition text,
  add column if not exists traction text,
  add column if not exists go_to_market text,
  add column if not exists pricing text,
  add column if not exists timeline text,
  add column if not exists ai_insights text;
