'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3Icon,
  ClockIcon,
  FlameIcon,
  HomeIcon,
  InfoIcon,
  MapPinIcon,
  Share2Icon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PublicPairings, PublicRoundItem } from '@/components/chess/PublicPairings';
import { StandingsTable } from '@/components/chess/StandingsTable';
import { Crosstable } from '@/components/chess/Crosstable';
import { RealtimeListener } from '@/components/chess/RealtimeListener';
import { ExportShareModal } from '@/components/chess/ExportShareModal';
import type { PastGame, PlayerInfo, StandingRow } from '@/lib/formats';

interface Props {
  tournament: any;
  players: PlayerInfo[];
  allGames: PastGame[];
  publicRounds: PublicRoundItem[];
  standings: StandingRow[];
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="text-2xl font-bold leading-tight tracking-tight">{value}</div>
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{children}</p>
    </div>
  );
}

export function PublicPageClient({ tournament, players, allGames, publicRounds, standings }: Props) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [shareModalOpened, setShareModalOpened] = useState(false);

  const gamesPlayed = allGames.filter((g) => g.result !== 'unplayed').length;
  const gamesTotal = allGames.length;
  const activePlayers = players.filter((p) => p.status === 'active').length;
  const roundPct = tournament.total_rounds
    ? Math.min(100, Math.round((tournament.current_round / tournament.total_rounds) * 100))
    : 0;
  const leaders = standings.slice(0, 3);
  const isFinished = tournament.status === 'finished';

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <Card className="mb-6 gap-5 bg-muted/40 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="uppercase">
                {tournament.format.replace(/_/g, ' ')}
              </Badge>
              <Badge variant={tournament.status === 'running' ? 'default' : 'secondary'}>
                {tournament.status === 'draft'
                  ? 'Draft'
                  : tournament.status === 'running'
                  ? 'Live'
                  : tournament.status}
              </Badge>
              <RealtimeListener tournamentId={tournament.id} />
            </div>
            <h1 className="mb-1.5 text-2xl font-bold tracking-tight sm:text-3xl">{tournament.name}</h1>
            {tournament.description && (
              <p className="mb-2 line-clamp-3 text-sm text-muted-foreground">{tournament.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {tournament.time_control && (
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="size-3.5" />
                  {tournament.time_control}
                </span>
              )}
              {tournament.venue && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPinIcon className="size-3.5" />
                  {tournament.venue}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setShareModalOpened(true)}>
              <Share2Icon />
              Share
            </Button>
            <Link
              href={`/t/${tournament.slug}/manage/rounds`}
              className={buttonVariants({ variant: 'outline' })}
            >
              Arbiter
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={activePlayers} label="Players" />
          <Stat value={`${tournament.current_round}/${tournament.total_rounds}`} label="Round" />
          <Stat
            value={
              <>
                {gamesPlayed}
                <span className="text-sm font-normal text-muted-foreground"> / {gamesTotal}</span>
              </>
            }
            label="Games played"
          />
          <Stat value={leaders[0] ? leaders[0].score : '-'} label="Top score" />
        </div>
        <Progress value={roundPct} />
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => v && setActiveTab(String(v))}>
        <div className="mb-4 max-w-full overflow-x-auto">
          <TabsList className="w-max">
            <TabsTrigger value="overview" className="px-3">
              <HomeIcon />
              Overview
            </TabsTrigger>
            <TabsTrigger value="pairings" className="px-3">
              <FlameIcon />
              Pairings
            </TabsTrigger>
            <TabsTrigger value="standings" className="px-3">
              <TrophyIcon />
              Standings
            </TabsTrigger>
            <TabsTrigger value="crosstable" className="px-3">
              <BarChart3Icon />
              Crosstable
            </TabsTrigger>
            <TabsTrigger value="players" className="px-3">
              <UsersIcon />
              Players ({players.length})
            </TabsTrigger>
            <TabsTrigger value="info" className="px-3">
              <InfoIcon />
              Info
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="gap-3 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{isFinished ? 'Final podium' : 'Leaderboard'}</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('standings')}>
                  Full standings
                </Button>
              </div>
              {leaders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Standings appear once results are in.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {leaders.map((row) => (
                    <div
                      key={row.playerId}
                      className="flex items-center justify-between gap-3 rounded-lg border p-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="w-6 text-center text-lg font-bold">
                          {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `#${row.rank}`}
                        </span>
                        <div className="min-w-0">
                          <Link
                            href={`/t/${tournament.slug}/players/${row.playerId}`}
                            className="break-words text-sm font-semibold hover:underline"
                          >
                            {row.playerName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {row.wins}W {row.draws}D {row.losses}L
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary">{row.score} pts</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="gap-3 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Round {tournament.current_round || 1} boards</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('pairings')}>
                  All pairings
                </Button>
              </div>
              <PublicPairings
                rounds={publicRounds}
                currentRound={tournament.current_round}
                limit={4}
                hideRoundTabs
              />
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pairings">
          <PublicPairings rounds={publicRounds} currentRound={tournament.current_round} />
        </TabsContent>

        <TabsContent value="standings">
          <Card className="p-3">
            <StandingsTable standings={standings} tournamentSlug={tournament.slug} />
          </Card>
        </TabsContent>

        <TabsContent value="crosstable">
          <Card className="p-3">
            <Crosstable standings={standings} games={allGames} totalRounds={tournament.total_rounds} />
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <Card className="p-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Seed</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Club / Country</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold">#{p.seed}</TableCell>
                    <TableCell>
                      <Link
                        href={`/t/${tournament.slug}/players/${p.id}`}
                        className="font-semibold hover:underline"
                      >
                        {p.name}
                      </Link>
                    </TableCell>
                    <TableCell>{p.rating || '-'}</TableCell>
                    <TableCell>{p.club || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'active' ? 'secondary' : 'destructive'}>{p.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="info">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="gap-3 p-4">
              <h2 className="font-semibold">Tournament details</h2>
              <Detail label="Format">
                <span className="capitalize">{tournament.format.replace(/_/g, ' ')}</span>
              </Detail>
              <Detail label="Total rounds">{tournament.total_rounds} rounds</Detail>
              <Detail label="Time control">{tournament.time_control || 'Unspecified'}</Detail>
              <Detail label="Venue">{tournament.venue || 'Online'}</Detail>
            </Card>

            <Card className="gap-3 p-4">
              <h2 className="font-semibold">Scoring &amp; tie-breaks</h2>
              <Detail label="Points system">
                Win: {tournament.settings?.winPoints ?? 1} pt | Draw: {tournament.settings?.drawPoints ?? 0.5}{' '}
                pt | Bye: {tournament.settings?.byePoints ?? 1} pt
              </Detail>
              <div>
                <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Tie-break order</p>
                <div className="flex flex-wrap gap-1.5">
                  {(tournament.settings?.tieBreaks || ['buchholz', 'sonneborn_berger', 'wins']).map(
                    (tb: string) => (
                      <Badge key={tb} variant="outline">
                        {tb.replace(/_/g, ' ')}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Powered by OpenVChess ·{' '}
        <a
          href="https://github.com/Taraldinn"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground hover:underline"
        >
          github.com/Taraldinn
        </a>
      </p>

      <ExportShareModal
        opened={shareModalOpened}
        onClose={() => setShareModalOpened(false)}
        tournamentSlug={tournament.slug}
        tournamentName={tournament.name}
      />
    </div>
  );
}
