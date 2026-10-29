'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeftIcon, ExternalLinkIcon, FlameIcon, UsersIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeaderProps {
  name: string;
  slug: string;
  format: string;
  status: string;
  currentRound: number;
  totalRounds: number;
}

export function TournamentManageHeader({
  name,
  slug,
  format,
  status,
  currentRound,
  totalRounds,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.includes('/manage/rounds')) return 'rounds';
    if (pathname.includes('/manage/settings')) return 'settings';
    return 'players';
  };

  return (
    <div className="mb-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <ArrowLeftIcon />
          Back
        </Link>
        <Link
          href={`/t/${slug}`}
          target="_blank"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Public link
          <ExternalLinkIcon />
        </Link>
      </div>

      <div className="mb-4">
        <h1 className="mb-1 break-words text-xl font-bold tracking-tight sm:text-2xl">{name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="uppercase">
            {format.replace(/_/g, ' ')}
          </Badge>
          <Badge variant={status === 'running' ? 'default' : 'secondary'}>
            {status === 'draft' ? 'Draft' : status === 'running' ? 'Live' : status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Round {currentRound} / {totalRounds}
          </span>
        </div>
      </div>

      <Tabs value={getActiveTab()} onValueChange={(val) => router.push(`/t/${slug}/manage/${val}`)}>
        <TabsList>
          <TabsTrigger value="players" className="px-3">
            <UsersIcon />
            Players
          </TabsTrigger>
          <TabsTrigger value="rounds" className="px-3">
            <FlameIcon />
            Rounds &amp; results
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
