import { notFound } from 'next/navigation';
import { getTournamentBySlugAction } from '@/lib/actions/tournaments';
import { RegisterClient } from './RegisterClient';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function RegisterPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { token } = await searchParams;

  const tournament = await getTournamentBySlugAction(slug);
  if (!tournament) {
    notFound();
  }

  return <RegisterClient tournament={tournament} token={token || null} />;
}
