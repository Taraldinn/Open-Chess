# ChessFlow Design Spec

*Stack: Next.js 16 (App Router), Mantine v9, Supabase (Postgres, Auth, Realtime), TypeScript (Strict), Vitest.*

## 1. System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Next.js 16 App Router UI                 │
│  (Mantine v9: AppShell, Modals, Notifications, Forms)  │
├──────────────────────────┬─────────────────────────────┤
│   Public Client Views    │     Organizer Dashboard     │
│   (/t/[slug] Realtime)   │  (/dashboard, /t/[slug]/...) │
└─────────────┬────────────┴──────────────┬──────────────┘
              │                           │
              ▼                           ▼
┌──────────────────────────┐ ┌───────────────────────────┐
│     Supabase Client      │ │      Server Actions       │
│  (Realtime Subscriptions)│ │  (Zod-validated mutations) │
└─────────────┬────────────┘ └────────────┬──────────────┘
              │                           │
              │              ┌────────────┴──────────────┐
              │              │    Pure Pairing Engines   │
              │              │  (Swiss, RoundRobin, KO)  │
              │              │   Zero DB/UI dependencies │
              │              └────────────┬──────────────┘
              ▼                           ▼
┌────────────────────────────────────────────────────────┐
│                   Supabase Backend                     │
│    PostgreSQL + RLS + is_tournament_admin() + Auth     │
└────────────────────────────────────────────────────────┘
```

## 2. Directory Layout

```
app/
  layout.tsx                          # MantineProvider, ColorSchemeScript, Notifications
  page.tsx                            # Landing page: hero, featured public tournaments
  (auth)/
    login/page.tsx                    # Magic link + Google Auth
  (dashboard)/
    dashboard/page.tsx                # Organizer tournaments list + status badges
    t/new/page.tsx                    # Tournament creation wizard
    t/[slug]/manage/
      page.tsx                        # Overview & quick actions
      players/page.tsx                # Player management (paste, CSV, seed reordering, withdraw)
      rounds/page.tsx                 # Round board result entry, publish, next round
      settings/page.tsx               # Edit tournament settings, arbiter invites
  t/[slug]/
    page.tsx                          # Public live tournament view (Tabs: Pairings, Standings, Crosstable, Players)
    players/[id]/page.tsx             # Player public game history & color sequence
lib/
  supabase/
    client.ts                         # Browser Supabase client
    server.ts                         # Server Component / Server Action Supabase client (@supabase/ssr)
    middleware.ts                     # Session refresh middleware
  formats/
    types.ts                          # FormatEngine interface & shared pairing types
    swiss/
      index.ts                        # SwissEngine implementation (pure function)
      matching.ts                     # Edmonds' blossom / min-cost matching graph solver
      colors.ts                       # Color assignment & conflict resolution rules
      byes.ts                         # Odd-player bye selection
    roundRobin/
      index.ts                        # RoundRobinEngine implementation (Berger tables)
    knockout/
      index.ts                        # KnockoutEngine implementation (bracket seeding & advancement)
  tiebreaks/
    types.ts                          # Tiebreak calculator signatures
    buchholz.ts                       # Buchholz, Buchholz Cut-1, Median Buchholz
    sonnebornBerger.ts                # Sonneborn-Berger
    directEncounter.ts                # Head-to-head encounter
    wins.ts                           # Number of wins
    engine.ts                         # Combined standings & tiebreak computer
  actions/
    tournaments.ts                    # Tournament CRUD server actions
    players.ts                        # Add, bulk import, update, withdraw players
    rounds.ts                         # Generate round, publish round, swap boards
    games.ts                          # Set result, edit result
types/
  database.ts                         # Database type definitions
components/
  chess/
    PairingBoard.tsx                  # Board pairing row with result buttons
    StandingsTable.tsx                # Dynamic standings table with selected tiebreak columns
    Crosstable.tsx                    # Matrix crosstable
    TournamentHeader.tsx              # Name, format, round badge, time control, venue
    ExportShareModal.tsx              # QR code, copy link, CSV export
tests/
  formats/
    swiss.test.ts                     # Vitest + fast-check property tests
    roundRobin.test.ts                # Berger table validation tests
    knockout.test.ts                  # Elimination bracket tests
    tiebreaks.test.ts                 # Hand-calculated tiebreak validation tests
supabase/
  migrations/
    20261023000000_init_schema.sql    # Core tables, enums, triggers, RLS policies
```

## 3. Data Model & RLS Rules

1. `profiles`: `id`, `display_name`, `avatar_url`, `created_at`.
2. `tournaments`: `id`, `owner_id`, `slug`, `name`, `description`, `format`, `status`, `visibility`, `total_rounds`, `current_round`, `time_control`, `venue`, `start_date`, `settings (jsonb)`.
3. `tournament_members`: `tournament_id`, `user_id`, `role`.
4. `players`: `id`, `tournament_id`, `user_id`, `name`, `rating`, `club`, `seed`, `status`, `withdrawn_after_round`.
5. `rounds`: `id`, `tournament_id`, `number`, `status`, `bracket`.
6. `games`: `id`, `tournament_id`, `round_id`, `board`, `white_id`, `black_id`, `result`, `pgn`, `played_at`.
7. Security: `is_tournament_admin(tournament_id)` verifies current session owns or arbitrates the tournament. RLS on every table restricts write operations.
