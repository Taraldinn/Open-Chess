'use client';

import { Group, Button, Menu, ActionIcon, Badge } from '@mantine/core';
import { IconDotsVertical, IconCheck } from '@tabler/icons-react';
import type { GameResult } from '@/types/database';

interface ResultButtonsProps {
  currentResult: GameResult;
  isBye?: boolean;
  disabled?: boolean;
  onSetResult: (result: GameResult) => void;
}

export function ResultButtons({
  currentResult,
  isBye,
  disabled,
  onSetResult,
}: ResultButtonsProps) {
  if (isBye) {
    return (
      <Badge color="arcadeViolet" size="lg" variant="light">
        1 - 0 (BYE)
      </Badge>
    );
  }

  const isWhiteWin = currentResult === 'white_win' || currentResult === 'black_forfeit_win';
  const isDraw = currentResult === 'draw';
  const isBlackWin = currentResult === 'black_win' || currentResult === 'white_forfeit_win';

  return (
    <Group gap={6} wrap="nowrap">
      <Button
        size="sm"
        variant={isWhiteWin ? 'filled' : 'default'}
        color={isWhiteWin ? 'yellow' : undefined}
        c={isWhiteWin ? 'dark.9' : undefined}
        fw={800}
        radius="xl"
        disabled={disabled}
        onClick={() => onSetResult('white_win')}
      >
        1 - 0
      </Button>

      <Button
        size="sm"
        variant={isDraw ? 'filled' : 'default'}
        color={isDraw ? 'arcadeViolet' : undefined}
        fw={800}
        radius="xl"
        disabled={disabled}
        onClick={() => onSetResult('draw')}
      >
        ½ - ½
      </Button>

      <Button
        size="sm"
        variant={isBlackWin ? 'filled' : 'default'}
        color={isBlackWin ? 'yellow' : undefined}
        c={isBlackWin ? 'dark.9' : undefined}
        fw={800}
        radius="xl"
        disabled={disabled}
        onClick={() => onSetResult('black_win')}
      >
        0 - 1
      </Button>

      <Menu shadow="md" width={180} position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="subtle" size="md" disabled={disabled}>
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Forfeits & Special</Menu.Label>
          <Menu.Item onClick={() => onSetResult('black_forfeit_win')}>
            White Forfeit Win (1F - 0)
          </Menu.Item>
          <Menu.Item onClick={() => onSetResult('white_forfeit_win')}>
            Black Forfeit Win (0 - 1F)
          </Menu.Item>
          <Menu.Item onClick={() => onSetResult('double_forfeit')}>
            Double Forfeit (0F - 0F)
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item color="gray" onClick={() => onSetResult('unplayed')}>
            Reset to Unplayed
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
