'use client';

import Link from 'next/link';
import { LayoutDashboardIcon, MenuIcon, PlusIcon, TrophyIcon } from 'lucide-react';
import { GithubIcon } from '@/components/icons/github-icon';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserMenu } from './UserMenu';

const GITHUB_URL = 'https://github.com/Taraldinn';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <TrophyIcon className="size-5 text-primary" />
          OpenVChess
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/dashboard" className={buttonVariants({ variant: 'ghost' })}>
            Dashboard
          </Link>
          <Link href="/t/new" className={buttonVariants()}>
            <PlusIcon />
            New tournament
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub: Taraldinn"
            className={buttonVariants({ variant: 'outline', size: 'icon' })}
          >
            <GithubIcon />
          </a>
          <UserMenu />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <UserMenu />
          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" size="icon" aria-label="Open navigation" />}
            >
              <MenuIcon />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <TrophyIcon className="size-5 text-primary" />
                  OpenVChess
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 px-4">
                <SheetClose
                  nativeButton={false}
                  render={<Link href="/dashboard" className={buttonVariants({ variant: 'secondary' })} />}
                >
                  <LayoutDashboardIcon />
                  Dashboard
                </SheetClose>
                <SheetClose nativeButton={false} render={<Link href="/t/new" className={buttonVariants()} />}>
                  <PlusIcon />
                  New tournament
                </SheetClose>
                <Separator className="my-1" />
                <SheetClose nativeButton={false} render={<Link href="/" className={buttonVariants({ variant: 'ghost' })} />}>
                  Home
                </SheetClose>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'outline' })}
                >
                  <GithubIcon />
                  github.com/Taraldinn
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
