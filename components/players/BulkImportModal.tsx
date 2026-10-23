'use client';

import { useState } from 'react';
import {
  Modal,
  Button,
  Textarea,
  Stack,
  Text,
  Table,
  Group,
  Badge,
  FileInput,
} from '@mantine/core';
import { IconUpload, IconFileSpreadsheet, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { bulkAddPlayersAction } from '@/lib/actions/players';

interface BulkImportModalProps {
  opened: boolean;
  onClose: () => void;
  tournamentId: string;
  onSuccess: () => void;
}

interface ParsedPlayer {
  name: string;
  rating: number | null;
  club: string | null;
}

export function BulkImportModal({
  opened,
  onClose,
  tournamentId,
  onSuccess,
}: BulkImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [parsed, setParsed] = useState<ParsedPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  const parseLines = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const result: ParsedPlayer[] = [];

    for (const line of lines) {
      // Split by comma or tab
      const parts = line.split(/[,;\t]+/).map((p) => p.trim());
      if (parts.length === 0 || !parts[0]) continue;

      const name = parts[0];
      let rating: number | null = null;
      let club: string | null = null;

      if (parts.length >= 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num)) {
          rating = num;
          club = parts.slice(2).join(', ') || null;
        } else {
          club = parts.slice(1).join(', ') || null;
        }
      }

      result.push({ name, rating, club });
    }

    setParsed(result);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.currentTarget.value;
    setRawText(val);
    parseLines(val);
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawText(content);
        parseLines(content);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsed.length === 0) return;
    setLoading(true);
    try {
      await bulkAddPlayersAction(tournamentId, parsed);
      notifications.show({
        title: 'Import Successful',
        message: `Imported ${parsed.length} players.`,
        color: 'green',
      });
      setRawText('');
      setParsed([]);
      onSuccess();
      onClose();
    } catch (err: any) {
      notifications.show({
        title: 'Import Failed',
        message: err.message,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Bulk Import Players"
      size="lg"
      radius="md"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Paste a list of players (one per line). Format: <code>Name, Rating, Club</code> or simply <code>Name</code>. You can also upload a CSV.
        </Text>

        <FileInput
          placeholder="Upload CSV file"
          leftSection={<IconFileSpreadsheet size={16} />}
          accept=".csv,.txt"
          onChange={handleFileUpload}
        />

        <Textarea
          placeholder={"Magnus Carlsen, 2882, Norway\nHikaru Nakamura, 2875, USA\nFabiano Caruana, 2805"}
          minRows={5}
          maxRows={10}
          value={rawText}
          onChange={handleTextChange}
        />

        {parsed.length > 0 && (
          <div>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600}>
                Preview Parsed Players
              </Text>
              <Badge color="yellow" variant="light">
                {parsed.length} players detected
              </Badge>
            </Group>

            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Rating</Table.Th>
                  <Table.Th>Club</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {parsed.slice(0, 8).map((p, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{i + 1}</Table.Td>
                    <Table.Td fw={500}>{p.name}</Table.Td>
                    <Table.Td>{p.rating || '-'}</Table.Td>
                    <Table.Td>{p.club || '-'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {parsed.length > 8 && (
              <Text size="xs" c="dimmed" mt="xs" ta="center">
                + {parsed.length - 8} more players
              </Text>
            )}
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="yellow"
            c="dark.9"
            fw={700}
            onClick={handleImport}
            disabled={parsed.length === 0}
            loading={loading}
            leftSection={<IconUpload size={16} />}
          >
            Import {parsed.length > 0 ? `${parsed.length} Players` : ''}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
