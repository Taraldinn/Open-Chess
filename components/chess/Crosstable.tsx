'use client';

import type { StandingRow, PastGame } from '@/lib/formats/types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface CrosstableProps {
  standings: StandingRow[];
  games: PastGame[];
  totalRounds: number;
}

export function Crosstable({ standings, games, totalRounds }: CrosstableProps) {
  if (standings.length === 0) {
    return <p className="text-sm text-muted-foreground">No tournament data to display.</p>;
  }

  const rankMap = new Map<string, number>();
  standings.forEach((s) => rankMap.set(s.playerId, s.rank));

  const roundsArray = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Rating</TableHead>
          {roundsArray.map((r) => (
            <TableHead key={r} className="text-center">
              R{r}
            </TableHead>
          ))}
          <TableHead className="text-center">Pts</TableHead>
          <TableHead className="text-center">SB</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((row) => (
          <TableRow key={row.playerId}>
            <TableCell className="font-bold">{row.rank}</TableCell>
            <TableCell className="font-semibold">{row.playerName}</TableCell>
            <TableCell>{row.rating || '-'}</TableCell>
            {roundsArray.map((r) => {
              const game = games.find(
                (g) =>
                  g.roundNumber === r && (g.whiteId === row.playerId || g.blackId === row.playerId)
              );

              if (!game || game.result === 'unplayed') {
                return (
                  <TableCell key={r} className="text-center text-muted-foreground">
                    -
                  </TableCell>
                );
              }

              if (game.result === 'bye' || game.blackId === null) {
                return (
                  <TableCell key={r} className="text-center">
                    <Badge variant="secondary">BYE</Badge>
                  </TableCell>
                );
              }

              const isWhite = game.whiteId === row.playerId;
              const oppId = isWhite ? game.blackId : game.whiteId;
              const oppRank = oppId ? rankMap.get(oppId) : '?';

              let scoreChar = '0';
              if (
                (isWhite && (game.result === 'white_win' || game.result === 'black_forfeit_win')) ||
                (!isWhite && (game.result === 'black_win' || game.result === 'white_forfeit_win'))
              ) {
                scoreChar = '1';
              } else if (game.result === 'draw') {
                scoreChar = '½';
              }

              return (
                <TableCell key={r} className="text-center">
                  <span className={cn('text-xs', scoreChar === '1' ? 'font-bold' : 'font-normal')}>
                    {oppRank}
                    <span className={isWhite ? 'text-foreground' : 'text-muted-foreground'}>
                      {isWhite ? 'w' : 'b'}
                    </span>
                    {scoreChar}
                  </span>
                </TableCell>
              );
            })}
            <TableCell className="text-center font-bold">{row.score}</TableCell>
            <TableCell className="text-center">
              {row.tiebreaks?.sonneborn_berger?.toFixed(1) ?? '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
