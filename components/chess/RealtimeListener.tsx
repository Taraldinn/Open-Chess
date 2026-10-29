'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

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
        { event: '*', schema: 'public', table: 'games', filter: `tournament_id=eq.${tournamentId}` },
        () => router.refresh()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds', filter: `tournament_id=eq.${tournamentId}` },
        () => router.refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tournamentId, router]);

  return (
    <Badge variant="outline" className="gap-1.5">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Live updates on
    </Badge>
  );
}
