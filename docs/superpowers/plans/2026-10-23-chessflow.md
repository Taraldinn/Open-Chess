# ChessFlow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build ChessFlow, a complete chess tournament management web application using Next.js 16, Mantine v9, and Supabase, featuring pure mathematical pairing engines (Swiss, Round Robin, Knockout), tie-break calculations, live public pairings/standings, and mobile-friendly result entry.

**Architecture:** A pure TypeScript domain engine (`lib/formats/`, `lib/tiebreaks/`) decoupled from the database and UI, backed by Vitest property-based tests. The UI is built with Next.js 16 App Router and Mantine v9, with Supabase handling Auth, Postgres RLS, and Realtime live subscriptions.

**Tech Stack:** Next.js 16, React 19, TypeScript, Mantine v9 (`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`), Tabler Icons, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), Zod, Vitest, `fast-check`, `edmonds-blossom`.

**Spec:** `docs/superpowers/specs/2026-10-23-chessflow-design.md`

## Global Constraints
- TypeScript strict mode enabled throughout; no `any`.
- Pairing algorithms and tiebreak computations must remain in pure functions (`lib/formats/`, `lib/tiebreaks/`) with no database or UI imports.
- All database write mutations must go through Next.js Server Actions with Zod input validation.
- Responsive, mobile-first design with touch-friendly result entry targets.
- Supabase queries must respect Row Level Security (RLS).

---

### Task 1: Project Scaffolding & Mantine Setup
**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `theme.ts`
- Test: Build verification (`npm run build`)

- [ ] **Step 1: Initialize Next.js 16 project structure with package.json**
- [ ] **Step 2: Install dependencies (Mantine v9, tabler icons, postcss, zod, supabase, vitest, fast-check, edmonds-blossom)**
- [ ] **Step 3: Configure PostCSS with Mantine preset and theme configuration**
- [ ] **Step 4: Create root layout with `MantineProvider`, `ColorSchemeScript`, and `Notifications`**
- [ ] **Step 5: Verify build succeeds**

---

### Task 2: Supabase Schema, RLS & Client Configuration
**Files:**
- Create: `supabase/migrations/20261023000000_init_schema.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/middleware.ts`
- Create: `middleware.ts`
- Create: `types/database.ts`

- [ ] **Step 1: Write SQL migration file with tables, enums, triggers, RLS policies, and `is_tournament_admin()` helper**
- [ ] **Step 2: Create TypeScript database types matching the schema in `types/database.ts`**
- [ ] **Step 3: Implement browser client (`lib/supabase/client.ts`) and server client (`lib/supabase/server.ts`) using `@supabase/ssr`**
- [ ] **Step 4: Implement middleware for session refresh (`middleware.ts`)**
- [ ] **Step 5: Provide `.env.example` and `.env.local` templates**

---

### Task 3: Pure Swiss Pairing Engine & Property Tests
**Files:**
- Create: `lib/formats/types.ts`
- Create: `lib/formats/swiss/byes.ts`
- Create: `lib/formats/swiss/colors.ts`
- Create: `lib/formats/swiss/matching.ts`
- Create: `lib/formats/swiss/index.ts`
- Test: `tests/formats/swiss.test.ts`

- [ ] **Step 1: Define `FormatEngine`, `PairingContext`, `PairingResult`, `StandingRow` interfaces in `lib/formats/types.ts`**
- [ ] **Step 2: Implement bye selection algorithm (`lib/formats/swiss/byes.ts`)**
- [ ] **Step 3: Implement color balance & preference tracker (`lib/formats/swiss/colors.ts`)**
- [ ] **Step 4: Implement Edmonds' Blossom min-cost graph matching solver (`lib/formats/swiss/matching.ts`)**
- [ ] **Step 5: Implement `SwissEngine` with relaxation ladder and round limit validation (`lib/formats/swiss/index.ts`)**
- [ ] **Step 6: Write Vitest unit & property-based tests (`tests/formats/swiss.test.ts`) using `fast-check` and verify all pass**

---

### Task 4: Tiebreak Calculators & Standings Engine
**Files:**
- Create: `lib/tiebreaks/types.ts`
- Create: `lib/tiebreaks/buchholz.ts`
- Create: `lib/tiebreaks/sonnebornBerger.ts`
- Create: `lib/tiebreaks/directEncounter.ts`
- Create: `lib/tiebreaks/wins.ts`
- Create: `lib/tiebreaks/engine.ts`
- Test: `tests/tiebreaks/tiebreaks.test.ts`

- [ ] **Step 1: Implement Buchholz, Buchholz Cut-1, and Median Buchholz calculators**
- [ ] **Step 2: Implement Sonneborn-Berger calculator**
- [ ] **Step 3: Implement Direct Encounter and Total Wins calculators**
- [ ] **Step 4: Implement unified `computeStandings` function with multi-tier tiebreak sorting**
- [ ] **Step 5: Write unit tests verifying against hand-calculated tournament fixtures**

---

### Task 5: Round Robin & Knockout Engines
**Files:**
- Create: `lib/formats/roundRobin/index.ts`
- Create: `lib/formats/knockout/index.ts`
- Test: `tests/formats/roundRobin.test.ts`
- Test: `tests/formats/knockout.test.ts`

- [ ] **Step 1: Implement Round Robin engine using Berger tables (single & double cycle, rotating bye)**
- [ ] **Step 2: Write tests for Round Robin pairings, colors, and standings**
- [ ] **Step 3: Implement Knockout engine (seeded bracket, bye assignment for non-power-of-2, match progression)**
- [ ] **Step 4: Write tests for Knockout bracket generation and winner progression**

---

### Task 6: Tournament Management & Creation Wizard
**Files:**
- Create: `lib/actions/tournaments.ts`
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `app/(dashboard)/t/new/page.tsx`
- Create: `components/tournament/CreateTournamentWizard.tsx`

- [ ] **Step 1: Implement Zod schema and Server Actions for tournament CRUD and slug generation**
- [ ] **Step 2: Build the 4-step Mantine creation wizard (Basics -> Format & Rounds -> Scoring & Tiebreaks -> Review)**
- [ ] **Step 3: Implement Organizer Dashboard showing active/draft/completed tournaments with status badges**

---

### Task 7: Player Management System
**Files:**
- Create: `lib/actions/players.ts`
- Create: `app/(dashboard)/t/[slug]/manage/players/page.tsx`
- Create: `components/players/PlayerList.tsx`
- Create: `components/players/BulkImportModal.tsx`

- [ ] **Step 1: Implement Server Actions for adding, updating, withdrawing, and bulk-importing players**
- [ ] **Step 2: Build Player Management UI with single player addition and quick-action menu**
- [ ] **Step 3: Build multi-line paste and CSV import modal with live preview**
- [ ] **Step 4: Implement manual seed reordering and withdrawal toggles**

---

### Task 8: Rounds Execution & Result Entry
**Files:**
- Create: `lib/actions/rounds.ts`
- Create: `lib/actions/games.ts`
- Create: `app/(dashboard)/t/[slug]/manage/rounds/page.tsx`
- Create: `components/chess/PairingBoard.tsx`
- Create: `components/chess/ResultButtons.tsx`

- [ ] **Step 1: Implement Server Actions: `startTournament`, `generateNextRound`, `publishRound`, `setResult`, `swapBoards`**
- [ ] **Step 2: Build Round Management dashboard with round tabs and board lists**
- [ ] **Step 3: Build high-contrast, mobile-friendly result buttons (1-0, ½-½, 0-1, forfeit, bye)**
- [ ] **Step 4: Implement pairing edit / manual board swap modal before publishing**
- [ ] **Step 5: Implement round completion validation and Next Round generation trigger**

---

### Task 9: Live Public Pages & Realtime Updates
**Files:**
- Create: `app/t/[slug]/page.tsx`
- Create: `app/t/[slug]/players/[id]/page.tsx`
- Create: `components/chess/StandingsTable.tsx`
- Create: `components/chess/Crosstable.tsx`
- Create: `components/chess/PublicPairings.tsx`
- Create: `components/chess/RealtimeListener.tsx`

- [ ] **Step 1: Build public tournament overview with tabs: Pairings, Standings, Crosstable, Players, Info**
- [ ] **Step 2: Build responsive Standings Table with tie-break breakdowns**
- [ ] **Step 3: Build Matrix Crosstable showing opponent scores and results**
- [ ] **Step 4: Implement Supabase Realtime subscription component to update pairings and standings live without page reload**
- [ ] **Step 5: Build Player Profile page showing game history and color sequence (W/B/W...)**

---

### Task 10: Share, QR Code & Export (CSV / Print)
**Files:**
- Create: `components/chess/ExportShareModal.tsx`
- Create: `lib/export/csv.ts`
- Create: `app/api/export/[slug]/route.ts`

- [ ] **Step 1: Implement CSV export generator for players, pairings, and final standings**
- [ ] **Step 2: Build Share Modal with QR code rendering and one-click copy tournament link**
- [ ] **Step 3: Add clean print stylesheet for pairings and standings sheet export**
- [ ] **Step 4: Run comprehensive test suite and verify end-to-end functionality**
