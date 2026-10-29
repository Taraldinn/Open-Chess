import Link from 'next/link';
import { CalendarIcon, ExternalLinkIcon, PlusIcon, TimerIcon, TrophyIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getTournamentsAction } from '@/lib/actions/tournaments';

export const revalidate = 0;

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'running':
      return (
        <Badge className="gap-1.5 bg-emerald-600 text-white">
          <span className="size-1.5 rounded-full bg-white" />
          Live
        </Badge>
      );
    case 'registration':
      return <Badge variant="secondary">Registration</Badge>;
    case 'finished':
      return <Badge variant="outline">Finished</Badge>;
    default:
      return <Badge variant="secondary">Draft</Badge>;
  }
}

export default async function DashboardPage() {
  const tournaments = await getTournamentsAction();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Manage your chess tournaments, pairings, and results
          </p>
        </div>
        <Link href="/t/new" className={buttonVariants()}>
          <PlusIcon />
          New tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <Card className="my-10 items-center px-6 py-12 text-center">
          <TrophyIcon className="size-12 text-muted-foreground" />
          <h2 className="mt-2 text-lg font-semibold">No tournaments yet</h2>
          <p className="mb-4 max-w-md text-sm text-muted-foreground">
            Ready to host your next chess showdown? Create your first Swiss, Round Robin, or
            Knockout event in under 3 minutes.
          </p>
          <Link href="/t/new" className={buttonVariants({ size: 'lg' })}>
            <PlusIcon />
            Create tournament
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Card key={t.id}>
              <CardHeader>
                <div className="mb-1 flex items-center justify-between">
                  <StatusBadge status={t.status} />
                  <Badge variant="outline">{t.format.replace(/_/g, ' ')}</Badge>
                </div>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {t.description || 'No description provided'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="size-4" />
                  Rounds: {t.current_round} / {t.total_rounds}
                </div>
                <div className="flex items-center gap-2">
                  <TimerIcon className="size-4" />
                  {t.time_control || 'Standard time control'}
                </div>
              </CardContent>
              <CardFooter className="mt-auto gap-2">
                <Link
                  href={`/t/${t.slug}/manage/players`}
                  className={buttonVariants({ variant: 'secondary' }) + ' flex-1'}
                >
                  Manage
                </Link>
                <Link href={`/t/${t.slug}`} className={buttonVariants({ variant: 'outline' })}>
                  Live page
                  <ExternalLinkIcon />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
