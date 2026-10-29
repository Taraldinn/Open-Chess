'use client';

import Link from 'next/link';
import type { StandingRow } from '@/lib/formats/types';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ColorChip } from './ColorChip';

interface StandingsTableProps {
  standings: StandingRow[];
  tournamentSlug: string;
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) return <Badge>1st</Badge>;
  if (rank === 2) return <Badge variant="secondary">2nd</Badge>;
  if (rank === 3) return <Badge variant="outline">3rd</Badge>;
  return <span className="text-muted-foreground">#{rank}</span>;
}

export function StandingsTable({ standings, tournamentSlug }: StandingsTableProps) {
  if (standings.length === 0) {
    return <p className="text-sm text-muted-foreground">No standings data available yet.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-16">Rank</TableHead>
          <TableHead>Player</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>W-D-L</TableHead>
          <TableHead>Buchholz</TableHead>
          <TableHead>S-B</TableHead>
          <TableHead>Colors</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {standings.map((row) => (
          <TableRow key={row.playerId}>
            <TableCell>
              <RankCell rank={row.rank} />
            </TableCell>
            <TableCell>
              <Link
                href={`/t/${tournamentSlug}/players/${row.playerId}`}
                className="font-semibold hover:underline"
              >
                {row.playerName}
              </Link>
              {row.club && <p className="text-xs text-muted-foreground">{row.club}</p>}
            </TableCell>
            <TableCell>{row.rating || '-'}</TableCell>
            <TableCell className="font-bold">{row.score}</TableCell>
            <TableCell>
              {row.wins}-{row.draws}-{row.losses}
            </TableCell>
            <TableCell>{row.tiebreaks?.buchholz?.toFixed(1) ?? '-'}</TableCell>
            <TableCell>{row.tiebreaks?.sonneborn_berger?.toFixed(2) ?? '-'}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                {row.colorHistory.map((col, idx) => (
                  <ColorChip key={idx} color={col === 'W' ? 'white' : 'black'} showLabel={false} />
                ))}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
