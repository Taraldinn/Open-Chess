import { ArrowLeftIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ColorChip } from '@/components/chess/ColorChip';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTournamentBySlugAction } from '@/lib/actions/tournaments';
import { computeStandingsEngine } from '@/lib/tiebreaks/engine';
import type { PastGame, PlayerInfo } from '@/lib/formats';

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export default async function PlayerProfilePage({ params }: Props) {
  const { slug, id } = await params;
  const tournament = await getTournamentBySlugAction(slug);

  if (!tournament) notFound();

  const player = (tournament.players || []).find((p: any) => p.id === id);
  if (!player) notFound();

  const playerMap = new Map<string, any>();
  for (const p of tournament.players || []) {
    playerMap.set(p.id, p);
  }

  const allGames: PastGame[] = [];
  for (const r of tournament.rounds || []) {
    for (const g of r.games || []) {
      allGames.push({
        id: g.id,
        roundNumber: r.number,
        board: g.board,
        whiteId: g.white_id,
        blackId: g.black_id,
        result: g.result,
      });
    }
  }

  const players: PlayerInfo[] = (tournament.players || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    rating: p.rating,
    club: p.club,
    seed: p.seed,
    status: p.status,
  }));

  const standings = computeStandingsEngine({
    players,
    games: allGames,
    settings: tournament.settings,
  });

  const playerStanding = standings.find((s) => s.playerId === id);

  // Filter games involving this player
  const playerGames = allGames
    .filter((g) => g.whiteId === id || g.blackId === id)
    .sort((a, b) => a.roundNumber - b.roundNumber);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
      <Link
        href={`/t/${tournament.slug}`}
        className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-4'}
      >
        <ArrowLeftIcon />
        Back to {tournament.name}
      </Link>

      <Card className="mb-6 gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{player.name}</h1>
              <Badge variant="secondary">Seed #{player.seed}</Badge>
              {playerStanding && <Badge>Rank #{playerStanding.rank}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              {player.club ? `${player.club} • ` : ''}Rating: {player.rating || 'Unrated'}
            </p>
          </div>

          <div className="rounded-lg border px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">Total score</p>
            <p className="text-2xl font-bold">{playerStanding?.score ?? 0}</p>
          </div>
        </div>

        {playerStanding && playerStanding.colorHistory.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-muted px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground">Color sequence</span>
            {playerStanding.colorHistory.map((col, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                R{idx + 1}
                <ColorChip color={col === 'W' ? 'white' : 'black'} showLabel={false} />
              </span>
            ))}
          </div>
        )}
      </Card>

      <h2 className="mb-3 text-lg font-semibold">Tournament game history</h2>

      {playerGames.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">No games played yet.</Card>
      ) : (
        <Card className="p-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Round</TableHead>
                <TableHead>Board</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Opponent</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {playerGames.map((g) => {
                const isBye = g.result === 'bye' || g.blackId === null;
                const isWhite = g.whiteId === id;
                const oppId = isWhite ? g.blackId : g.whiteId;
                const opp = oppId ? playerMap.get(oppId) : null;

                let outcomeText = 'Unplayed';
                let outcomeClass = 'bg-muted text-muted-foreground';
                let pts = 0;

                if (isBye) {
                  outcomeText = '1 - 0 (Bye)';
                  outcomeClass = 'bg-secondary text-secondary-foreground';
                  pts = 1;
                } else if (g.result === 'draw') {
                  outcomeText = '½ - ½';
                  outcomeClass = 'bg-secondary text-secondary-foreground';
                  pts = 0.5;
                } else if (
                  (isWhite && (g.result === 'white_win' || g.result === 'black_forfeit_win')) ||
                  (!isWhite && (g.result === 'black_win' || g.result === 'white_forfeit_win'))
                ) {
                  outcomeText = 'Won';
                  outcomeClass = 'bg-emerald-600 text-white';
                  pts = 1;
                } else if (g.result !== 'unplayed') {
                  outcomeText = 'Lost';
                  outcomeClass = 'bg-destructive/10 text-destructive';
                  pts = 0;
                }

                return (
                  <TableRow key={g.id}>
                    <TableCell className="font-bold">R{g.roundNumber}</TableCell>
                    <TableCell>#{g.board}</TableCell>
                    <TableCell>
                      {isBye ? '-' : <ColorChip color={isWhite ? 'white' : 'black'} />}
                    </TableCell>
                    <TableCell>
                      {isBye ? (
                        <Badge variant="secondary">BYE</Badge>
                      ) : opp ? (
                        <Link href={`/t/${tournament.slug}/players/${opp.id}`} className="font-medium hover:underline">
                          {opp.name} {opp.rating ? `(${opp.rating})` : ''}
                        </Link>
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={outcomeClass}>{outcomeText}</Badge>
                    </TableCell>
                    <TableCell className="font-bold">{g.result === 'unplayed' ? '-' : pts}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
