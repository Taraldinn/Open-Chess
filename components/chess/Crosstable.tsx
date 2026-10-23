'use client';

import { Table, Text, Badge } from '@mantine/core';
import type { StandingRow, PastGame } from '@/lib/formats/types';

interface CrosstableProps {
  standings: StandingRow[];
  games: PastGame[];
  totalRounds: number;
}

export function Crosstable({ standings, games, totalRounds }: CrosstableProps) {
  if (standings.length === 0) {
    return <Text c="dimmed">No tournament data to display.</Text>;
  }

  // Create lookup for player ranks
  const rankMap = new Map<string, number>();
  standings.forEach((s) => rankMap.set(s.playerId, s.rank));

  const roundsArray = Array.from({ length: totalRounds }, (_, i) => i + 1);

  return (
    <div style={{ overflowX: 'auto' }}>
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 50 }}>#</Table.Th>
            <Table.Th>Player</Table.Th>
            <Table.Th style={{ width: 70 }}>Rating</Table.Th>
            {roundsArray.map((r) => (
              <Table.Th key={r} style={{ width: 65, textAlign: 'center' }}>
                R{r}
              </Table.Th>
            ))}
            <Table.Th style={{ width: 70, textAlign: 'center' }}>Pts</Table.Th>
            <Table.Th style={{ width: 70, textAlign: 'center' }}>SB</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {standings.map((row) => (
            <Table.Tr key={row.playerId}>
              <Table.Td fw={700}>{row.rank}</Table.Td>
              <Table.Td fw={600}>{row.playerName}</Table.Td>
              <Table.Td>{row.rating || '-'}</Table.Td>
              {roundsArray.map((r) => {
                const game = games.find(
                  (g) =>
                    g.roundNumber === r &&
                    (g.whiteId === row.playerId || g.blackId === row.playerId)
                );

                if (!game || game.result === 'unplayed') {
                  return (
                    <Table.Td key={r} ta="center" c="dimmed">
                      -
                    </Table.Td>
                  );
                }

                if (game.result === 'bye' || game.blackId === null) {
                  return (
                    <Table.Td key={r} ta="center">
                      <Badge size="xs" color="blue" variant="light">
                        BYE
                      </Badge>
                    </Table.Td>
                  );
                }

                const isWhite = game.whiteId === row.playerId;
                const oppId = isWhite ? game.blackId : game.whiteId;
                const oppRank = oppId ? rankMap.get(oppId) : '?';
                const colorChar = isWhite ? 'w' : 'b';

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
                  <Table.Td key={r} ta="center">
                    <Text size="xs" fw={scoreChar === '1' ? 700 : 400}>
                      {oppRank}
                      <span style={{ color: isWhite ? '#ffd54f' : '#9e9e9e' }}>
                        {colorChar}
                      </span>
                      {scoreChar}
                    </Text>
                  </Table.Td>
                );
              })}
              <Table.Td ta="center" fw={700}>
                {row.score}
              </Table.Td>
              <Table.Td ta="center">
                {row.tiebreaks?.sonneborn_berger?.toFixed(1) ?? '-'}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
