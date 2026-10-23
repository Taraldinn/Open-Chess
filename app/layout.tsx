import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './playful.css';

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Navbar } from '@/components/navigation/Navbar';
import { theme } from '../theme';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'ChessFlow — Chess Tournament Manager',
  description: 'Create and run Swiss, Round Robin, and Knockout chess tournaments with live pairings and standings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={plusJakarta.variable}>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <Notifications position="top-right" zIndex={1000} />
          <Navbar />
          <main>{children}</main>
        </MantineProvider>
      </body>
    </html>
  );
}
