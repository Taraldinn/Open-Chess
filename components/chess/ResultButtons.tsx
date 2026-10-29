'use client';

import { MoreVerticalIcon } from 'lucide-react';
import type { GameResult } from '@/types/database';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ResultButtonsProps {
  currentResult: GameResult;
  isBye?: boolean;
  disabled?: boolean;
  onSetResult: (result: GameResult) => void;
}

export function ResultButtons({ currentResult, isBye, disabled, onSetResult }: ResultButtonsProps) {
  if (isBye) {
    return <Badge variant="secondary">1 - 0 (BYE)</Badge>;
  }

  const isWhiteWin = currentResult === 'white_win' || currentResult === 'black_forfeit_win';
  const isDraw = currentResult === 'draw';
  const isBlackWin = currentResult === 'black_win' || currentResult === 'white_forfeit_win';

  return (
    <div className="flex items-center gap-1.5">
      <Button
        variant={isWhiteWin ? 'default' : 'outline'}
        disabled={disabled}
        onClick={() => onSetResult('white_win')}
        className="font-semibold"
      >
        1 - 0
      </Button>
      <Button
        variant={isDraw ? 'default' : 'outline'}
        disabled={disabled}
        onClick={() => onSetResult('draw')}
        className="font-semibold"
      >
        ½ - ½
      </Button>
      <Button
        variant={isBlackWin ? 'default' : 'outline'}
        disabled={disabled}
        onClick={() => onSetResult('black_win')}
        className="font-semibold"
      >
        0 - 1
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon" disabled={disabled} aria-label="More results" />}
        >
          <MoreVerticalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Forfeits &amp; special</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onSetResult('black_forfeit_win')}>
              White forfeit win (1F - 0)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetResult('white_forfeit_win')}>
              Black forfeit win (0 - 1F)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetResult('double_forfeit')}>
              Double forfeit (0F - 0F)
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSetResult('unplayed')}>Reset to unplayed</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
