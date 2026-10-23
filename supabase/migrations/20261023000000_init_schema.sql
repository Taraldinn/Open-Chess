-- ChessFlow Core Database Schema & RLS (Recursion-Free)
create extension if not exists "pgcrypto";

-- Enums
do $$ begin
  create type tournament_format as enum (
    'swiss',
    'round_robin',
    'double_round_robin',
    'knockout',
    'double_elimination',
    'arena',
    'scheveningen',
    'team_swiss'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type tournament_status as enum (
    'draft',
    'registration',
    'running',
    'finished',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type visibility as enum (
    'public',
    'unlisted',
    'private'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type game_result as enum (
    'white_win',
    'black_win',
    'draw',
    'white_forfeit_win',
    'black_forfeit_win',
    'double_forfeit',
    'bye',
    'unplayed'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type player_status as enum (
    'active',
    'withdrawn'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type round_status as enum (
    'draft',
    'published',
    'completed'
  );
exception
  when duplicate_object then null;
end $$;

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Tournaments
create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  slug text unique not null,
  name text not null,
  description text,
  format tournament_format not null default 'swiss',
  status tournament_status not null default 'draft',
  visibility visibility not null default 'public',
  total_rounds int not null default 5,
  current_round int not null default 0,
  time_control text,
  venue text,
  start_date timestamptz default now(),
  settings jsonb not null default '{
    "winPoints": 1,
    "drawPoints": 0.5,
    "byePoints": 1,
    "firstRound": "random",
    "tieBreaks": ["buchholz", "sonneborn_berger", "wins", "direct_encounter"],
    "allowLateEntry": true
  }'::jsonb,
  created_at timestamptz default now()
);

-- Tournament Co-organizers / Arbiters
create table if not exists tournament_members (
  tournament_id uuid not null references tournaments(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'arbiter',
  created_at timestamptz default now(),
  primary key (tournament_id, user_id)
);

-- Teams
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  name text not null,
  created_at timestamptz default now()
);

-- Players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  team_id uuid references teams(id) on delete set null,
  name text not null,
  rating int,
  club text,
  seed int,
  status player_status not null default 'active',
  withdrawn_after_round int,
  created_at timestamptz default now()
);

-- Rounds
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  number int not null,
  status round_status not null default 'draft',
  bracket text,
  created_at timestamptz default now(),
  unique (tournament_id, number, bracket)
);

-- Games
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  round_id uuid not null references rounds(id) on delete cascade,
  board int not null,
  white_id uuid references players(id) on delete cascade,
  black_id uuid references players(id) on delete cascade,
  result game_result not null default 'unplayed',
  pgn text,
  played_at timestamptz,
  unique (round_id, board)
);

-- Indexes
create index if not exists idx_tournaments_slug on tournaments (slug);
create index if not exists idx_tournaments_owner on tournaments (owner_id);
create index if not exists idx_players_tournament on players (tournament_id);
create index if not exists idx_rounds_tournament on rounds (tournament_id);
create index if not exists idx_games_tournament_round on games (tournament_id, round_id);
create index if not exists idx_games_white on games (white_id);
create index if not exists idx_games_black on games (black_id);

-- Helper function: is_tournament_admin (Security Definer with isolated search_path)
create or replace function public.is_tournament_admin(t_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.tournaments
    where id = t_id and (owner_id = auth.uid() or owner_id is null)
  ) or exists (
    select 1 from public.tournament_members
    where tournament_id = t_id and user_id = auth.uid()
  );
$$;

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table tournaments enable row level security;
alter table tournament_members enable row level security;
alter table teams enable row level security;
alter table players enable row level security;
alter table rounds enable row level security;
alter table games enable row level security;

-- Profiles Policies
drop policy if exists "Profiles are viewable by everyone" on profiles;
create policy "Profiles are viewable by everyone" on profiles for select using (true);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on profiles;
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);

-- Tournaments Policies (ZERO cross-table subqueries in SELECT to prevent infinite recursion)
drop policy if exists "Tournaments are viewable by visibility or admin" on tournaments;
drop policy if exists "Tournaments are viewable by visibility or owner" on tournaments;
create policy "Tournaments are viewable by visibility or owner" on tournaments for select
  using (
    visibility in ('public', 'unlisted')
    or owner_id = auth.uid()
    or owner_id is null
  );

drop policy if exists "Anyone can create tournaments" on tournaments;
create policy "Anyone can create tournaments" on tournaments for insert
  with check (true);

drop policy if exists "Owners and members can update tournaments" on tournaments;
create policy "Owners and members can update tournaments" on tournaments for update
  using (
    owner_id = auth.uid()
    or owner_id is null
    or is_tournament_admin(id)
  );

drop policy if exists "Only owners can delete tournaments" on tournaments;
create policy "Only owners can delete tournaments" on tournaments for delete
  using (owner_id = auth.uid() or owner_id is null);

-- Tournament Members Policies (SELECT is public to avoid recursion)
drop policy if exists "Members are viewable by tournament admins" on tournament_members;
drop policy if exists "Members are viewable by everyone" on tournament_members;
create policy "Members are viewable by everyone" on tournament_members for select
  using (true);

drop policy if exists "Tournament owners can manage members" on tournament_members;
create policy "Tournament owners can manage members" on tournament_members for all
  using (
    exists (
      select 1 from tournaments
      where id = tournament_members.tournament_id and (owner_id = auth.uid() or owner_id is null)
    )
  );

-- Teams Policies
drop policy if exists "Teams are viewable according to tournament visibility" on teams;
create policy "Teams are viewable according to tournament visibility" on teams for select
  using (true);

drop policy if exists "Admins can manage teams" on teams;
create policy "Admins can manage teams" on teams for all
  using (is_tournament_admin(tournament_id));

-- Players Policies
drop policy if exists "Players are viewable according to tournament visibility" on players;
create policy "Players are viewable according to tournament visibility" on players for select
  using (true);

drop policy if exists "Tournament admins can manage players" on players;
create policy "Tournament admins can manage players" on players for all
  using (is_tournament_admin(tournament_id));

-- Rounds Policies
drop policy if exists "Rounds viewable according to tournament visibility" on rounds;
create policy "Rounds viewable according to tournament visibility" on rounds for select
  using (true);

drop policy if exists "Tournament admins can manage rounds" on rounds;
create policy "Tournament admins can manage rounds" on rounds for all
  using (is_tournament_admin(tournament_id));

-- Games Policies
drop policy if exists "Games viewable according to tournament visibility" on games;
create policy "Games viewable according to tournament visibility" on games for select
  using (true);

drop policy if exists "Tournament admins can manage games" on games;
create policy "Tournament admins can manage games" on games for all
  using (is_tournament_admin(tournament_id));

-- Auto-create profile trigger on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Realtime Publication
do $$ begin
  alter publication supabase_realtime add table games;
exception
  when duplicate_object then null;
end $$;

do $$ begin
  alter publication supabase_realtime add table rounds;
exception
  when duplicate_object then null;
end $$;
