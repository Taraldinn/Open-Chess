import { TrophyIcon } from 'lucide-react';
import { GithubIcon } from '@/components/icons/github-icon';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const GITHUB_URL = 'https://github.com/Taraldinn';

export function Footer() {
  return (
    <footer className="pb-6 pt-8">
      <Separator className="mb-6" />
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 font-bold">
              <TrophyIcon className="size-[18px] text-primary" />
              OpenVChess
            </div>
            <p className="text-xs text-muted-foreground">
              Swiss, Round Robin and Knockout tournaments with live pairings.
            </p>
          </div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            <GithubIcon />
            github.com/Taraldinn
          </a>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} OpenVChess · Built by{' '}
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-foreground hover:underline"
          >
            Taraldinn
          </a>
        </p>
      </div>
    </footer>
  );
}
