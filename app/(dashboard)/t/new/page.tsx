'use client';

import { Container, Button, Group } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { CreateTournamentWizard } from '@/components/tournament/CreateTournamentWizard';

export default function NewTournamentPage() {
  return (
    <Container size="lg" py="xl">
      <Group mb="md">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Button
            variant="subtle"
            className="subtle-nav-btn"
            leftSection={<IconArrowLeft size={16} />}
          >
            Back to Dashboard
          </Button>
        </Link>
      </Group>
      <CreateTournamentWizard />
    </Container>
  );
}
