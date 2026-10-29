import Link from 'next/link';
import { ArrowLeftIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { CreateTournamentWizard } from '@/components/tournament/CreateTournamentWizard';

export default function NewTournamentPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <Link href="/dashboard" className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' mb-4'}>
        <ArrowLeftIcon />
        Back to dashboard
      </Link>
      <CreateTournamentWizard />
    </div>
  );
}
