'use client';

import { Table, Badge, Text, Group } from '@mantine/core';
import type { StandingRow } from '@/lib/formats/types';
import Link from 'next/link';

interface StandingsTableProps {
  standings: StandingRow[];
  tournamentSlug: string;
}

export function StandingsTable({ standings, tournamentSlug }: StandingsTableProps) {
  if (standings.length === 0) {
    return <Text c="dimmed">No standings data available yet.</Text>;
  }

  return (
    <Table striped highlightOnHover withTableBorder>
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ width: 60 }}>Rank</Table.Th>
          <Table.Th>Player</Table.Th>
          <Table.Th style={{ width: 80 }}>Rating</Table.Th>
          <Table.Th style={{ width: 80 }}>Score</Table.Th>
          <Table.Th style={{ width: 70 }}>W-D-L</Table.Th>
          <Table.Th style={{ width: 100 }}>Buchholz</Table.Th>
          <Table.Th style={{ width: 100 }}>Sonneborn-Berger</Table.Th>
          <Table.Th style={{ width: 100 }}>Colors</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {standings.map((row) => (
          <Table.Tr key={row.playerId}>
            <Table.Td fw={700}>
              {row.rank === 1 ? (
                <Badge color="yellow" c="dark.9" variant="filled" size="md">
                  🥇 1
                </Badge>
              ) : row.rank === 2 ? (
                <Badge color="gray" variant="filled" size="md">
                  🥈 2
                </Badge>
              ) : row.rank === 3 ? (
                <Badge color="coral" variant="filled" size="md">
                  🥉 3
                </Badge>
              ) : (
                `#${row.rank}`
              )}
            </Table.Td>
            <Table.Td>
              <Text
                component={Link}
                href={`/t/${tournamentSlug}/players/${row.playerId}`}
                fw={600}
                c="yellow.4"
                style={{ textDecoration: 'none' }}
              >
                {row.playerName}
              </Text>
              {row.club && (
                <Text size="xs" c="dimmed">
                  {row.club}
                </Text>
              )}
            </Table.Td>
            <Table.Td>{row.rating || '-'}</Table.Td>
            <Table.Td fw={700} fz="md">
              {row.score}
            </Table.Td>
            <Table.Td>
              <Text size="sm">
                {row.wins}-{row.draws}-{row.losses}
              </Text>
            </Table.Td>
            <Table.Td>{row.tiebreaks?.buchholz?.toFixed(1) ?? '-'}</Table.Td>
            <Table.Td>{row.tiebreaks?.sonneborn_berger?.toFixed(2) ?? '-'}</Table.Td>
            <Table.Td>
              <Group gap={3}>
                {row.colorHistory.map((col, idx) => (
                  <span
                    key={idx}
                    title={col === 'W' ? 'White' : 'Black'}
                    style={{ fontSize: '11px' }}
                  >
                    {col === 'W' ? '⚪' : '⚫'}
                  </span>
                ))}
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
