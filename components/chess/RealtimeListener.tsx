'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Badge, Group } from '@mantine/core';

interface RealtimeListenerProps {
  tournamentId: string;
}

export function RealtimeListener({ tournamentId }: RealtimeListenerProps) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`tournament-live-${tournamentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          router.refresh();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rounds',
          filter: `tournament_id=eq.${tournamentId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, router]);

  return (
    <Group gap={6}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--mantine-color-mintJoy-5)',
          display: 'inline-block',
          boxShadow: 'none',
        }}
      />
      <Badge color="green" variant="light" size="sm">
        Live Updates On
      </Badge>
    </Group>
  );
}
