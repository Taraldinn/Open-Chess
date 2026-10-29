'use client';

import { useState } from 'react';
import type { GameResult } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ColorChip } from './ColorChip';

export interface PublicBoardItem {
  id: string;
  board: number;
  whiteId: string | null;
  blackId: string | null;
  result: GameResult;
  whiteName: string;
  whiteRating?: number | null;
  blackName?: string | null;
  blackRating?: number | null;
}

export interface PublicRoundItem {
  number: number;
  status: string;
  games: PublicBoardItem[];
}

interface PublicPairingsProps {
  rounds: PublicRoundItem[];
  currentRound: number;
  limit?: number;
  hideRoundTabs?: boolean;
}

export function formatResultBadge(result: GameResult, isBye: boolean) {
  if (isBye) return <Badge variant="secondary">1 - 0 (BYE)</Badge>;
  switch (result) {
    case 'white_win':
    case 'black_forfeit_win':
      return <Badge>1 - 0</Badge>;
    case 'black_win':
    case 'white_forfeit_win':
      return <Badge>0 - 1</Badge>;
    case 'draw':
      return <Badge variant="secondary">½ - ½</Badge>;
    case 'double_forfeit':
      return <Badge variant="destructive">0F - 0F</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
}

function Side({
  color,
  name,
  rating,
}: {
  color: 'white' | 'black';
  name: string;
  rating?: number | null;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 rounded-lg border px-3 py-2',
        color === 'white' ? 'bg-card' : 'bg-muted',
        color === 'black' && 'md:items-end md:text-right'
      )}
    >
      <ColorChip color={color} />
      <p className="break-words text-sm font-semibold">{name}</p>
      {rating ? <p className="text-xs text-muted-foreground">{rating}</p> : null}
    </div>
  );
}

export function PublicPairings({ rounds, currentRound, limit, hideRoundTabs }: PublicPairingsProps) {
  const [selectedRound, setSelectedRound] = useState<string>(
    String(currentRound || (rounds.length > 0 ? rounds[rounds.length - 1].number : 1))
  );

  const activeRound = rounds.find((r) => r.number === Number(selectedRound));
  const games = activeRound ? (limit ? activeRound.games.slice(0, limit) : activeRound.games) : [];

  return (
    <div className="flex flex-col gap-4">
      {!hideRoundTabs && (
        <div className="overflow-x-auto">
          <Tabs value={selectedRound} onValueChange={(v) => v && setSelectedRound(String(v))}>
            <TabsList>
              {rounds.map((r) => (
                <TabsTrigger key={r.number} value={String(r.number)} className="px-3">
                  Round {r.number}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      {!activeRound || games.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No pairings published for this round yet.
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {games.map((game) => {
            const isBye = game.result === 'bye' || !game.blackId;
            return (
              <Card key={game.id} className="gap-3 p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Board {game.board}</Badge>
                  {formatResultBadge(game.result, isBye)}
                </div>
                <div className="grid grid-cols-1 items-stretch gap-1.5 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <Side color="white" name={game.whiteName} rating={game.whiteRating} />
                  <span className="text-center text-xs font-semibold text-muted-foreground">VS</span>
                  {isBye ? (
                    <div className="rounded-lg border px-3 py-2 md:text-right">
                      <Badge variant="outline">BYE</Badge>
                    </div>
                  ) : (
                    <Side color="black" name={game.blackName || 'TBD'} rating={game.blackRating} />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
