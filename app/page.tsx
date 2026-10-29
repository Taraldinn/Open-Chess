import Link from 'next/link';
import {
  ArrowRightIcon,
  BarChart3Icon,
  FlameIcon,
  PlayIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: TrophyIcon,
    title: 'Multiple formats',
    text: 'Swiss system, Round Robin (single/double), and exciting Single Elimination Knockouts.',
  },
  {
    icon: FlameIcon,
    title: 'Rule-based pairings',
    text: 'Zero repeat pairings, balanced colors, strict float-down handling, and odd-player byes.',
  },
  {
    icon: BarChart3Icon,
    title: 'Live standings',
    text: 'Buchholz, Sonneborn-Berger, Direct Encounter, and Wins computed automatically in real-time.',
  },
  {
    icon: UsersIcon,
    title: 'Public live pages',
    text: 'No login needed for players and spectators. Live pairings, crosstables, and quick QR codes.',
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      <section className="my-8 flex flex-col items-center gap-5 text-center sm:my-14">
        <Badge variant="secondary" className="h-6 px-3">
          <SparklesIcon />
          Fast, fair chess tournament manager
        </Badge>

        <h1 className="max-w-3xl text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          Run chess tournaments in minutes
        </h1>

        <p className="max-w-2xl text-balance text-muted-foreground">
          Swiss pairings with perfect Edmonds-Blossom matching, Round Robin tables, instant
          brackets, mobile-ready live score entry, and public standings.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {['Swiss', 'Round Robin', 'Knockout', 'Live sync'].map((f) => (
            <Badge key={f} variant="outline">
              {f}
            </Badge>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Link href="/dashboard" className={buttonVariants({ size: 'lg' })}>
            Go to dashboard
            <ArrowRightIcon />
          </Link>
          <Link href="/t/new" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
            <PlayIcon />
            Create tournament
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-5" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>
    </div>
  );
}
