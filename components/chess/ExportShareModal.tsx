'use client';

import { useState } from 'react';
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCopy,
  IconCheck,
  IconDownload,
  IconPrinter,
  IconShare,
} from '@tabler/icons-react';
import { QRCodeSVG } from 'qrcode.react';
import { notifications } from '@mantine/notifications';

interface ExportShareModalProps {
  opened: boolean;
  onClose: () => void;
  tournamentSlug: string;
  tournamentName: string;
}

export function ExportShareModal({
  opened,
  onClose,
  tournamentSlug,
  tournamentName,
}: ExportShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/t/${tournamentSlug}`
      : `https://openvchess.app/t/${tournamentSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    notifications.show({
      title: 'Link Copied!',
      message: 'Tournament public link copied to clipboard.',
      color: 'green',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadCSV = () => {
    if (typeof window !== 'undefined') {
      window.open(`/api/export/${tournamentSlug}`, '_blank');
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Share & Export Tournament"
      size="md"
      radius="md"
    >
      <Stack gap="lg" align="center" ta="center">
        {/* QR Code */}
        <Paper p="md" withBorder radius="md" bg="white">
          <QRCodeSVG value={shareUrl} size={180} level="M" />
        </Paper>

        <Text size="sm" c="dimmed">
          Spectators and players can scan this QR code on their phones to view live pairings and standings without signing in.
        </Text>

        {/* Copy Link Input */}
        <TextInput
          label="Public Tournament Link"
          value={shareUrl}
          readOnly
          style={{ width: '100%' }}
          rightSection={
            <ActionIcon onClick={handleCopy} variant="subtle" color="yellow">
              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </ActionIcon>
          }
        />

        <Group justify="center" gap="sm" style={{ width: '100%' }}>
          <Button
            variant="default"
            leftSection={<IconDownload size={16} />}
            onClick={handleDownloadCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="default"
            leftSection={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            Print Sheet
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
