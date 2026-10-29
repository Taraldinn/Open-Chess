import './globals.css';

import { Space_Grotesk } from 'next/font/google';
import { Navbar } from '@/components/navigation/Navbar';
import { Footer } from '@/components/navigation/Footer';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-sans' });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  authors: [{ name: 'Taraldinn', url: 'https://github.com/Taraldinn' }],
  creator: 'Taraldinn',
  title: 'OpenVChess — Chess Tournament Manager',
  description:
    'Create and run Swiss, Round Robin, and Knockout chess tournaments with live pairings and standings.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn('font-sans', spaceGrotesk.variable)}>
      <body className="flex min-h-dvh flex-col">
        <ThemeProvider>
          <TooltipProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="top-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
