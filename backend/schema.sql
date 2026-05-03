-- AI Startup Validator - Supabase/PostgreSQL Schema

-- USERS TABLE
create table if not exists users (
  id bigserial primary key,
  username text not null,
  email text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

-- STARTUP VALIDATIONS TABLE
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

-- REPORTS TABLE (UPDATED SCHEMA)
create table if not exists reports (
  id bigserial primary key,
  validation_id bigint not null references startup_validations(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_size bigint,
  generated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reports_user_created_at
  on reports (user_id, created_at desc);

create index if not exists idx_reports_validation_id
  on reports (validation_id);