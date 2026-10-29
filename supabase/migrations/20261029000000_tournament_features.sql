-- Migration: Add Check-in, Round pairing method, and Registrations table
-- Timestamp: 2026-10-29

-- 1. Add checked_in column to players table
alter table public.players
  add column if not exists checked_in boolean not null default false;

-- 2. Add pairing_method column to rounds table
alter table public.rounds
  add column if not exists pairing_method text default 'swiss_dutch';

-- 3. Create tournament_registrations table
create table if not exists public.tournament_registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  rating int,
  club text,
  email text,
  phone text,
  notes text,
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_tournament_registrations_tid_status
  on public.tournament_registrations (tournament_id, status);

create index if not exists idx_players_checked_in
  on public.players (tournament_id, checked_in);

-- Enable RLS
alter table public.tournament_registrations enable row level security;

-- Policies for tournament_registrations
-- Anyone can insert registration (public registration flow via invite link)
drop policy if exists "Anyone can submit registration" on public.tournament_registrations;
create policy "Anyone can submit registration" on public.tournament_registrations
  for insert with check (true);

-- Anyone can view registrations for a tournament (needed to view status)
drop policy if exists "Registrations viewable by everyone" on public.tournament_registrations;
create policy "Registrations viewable by everyone" on public.tournament_registrations
  for select using (true);

-- Tournament admins can update registrations (accept / reject)
drop policy if exists "Admins can update registrations" on public.tournament_registrations;
create policy "Admins can update registrations" on public.tournament_registrations
  for update using (is_tournament_admin(tournament_id));

-- Tournament admins can delete registrations
drop policy if exists "Admins can delete registrations" on public.tournament_registrations;
create policy "Admins can delete registrations" on public.tournament_registrations
  for delete using (is_tournament_admin(tournament_id));
