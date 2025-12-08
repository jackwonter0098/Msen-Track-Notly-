import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/theme-provider';
import { ChallengeProvider } from '@/context/challenge-context';
import { AppShell } from '@/components/app-shell';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Msen Track Notely',
  description: 'Track your challenges and take notes on your progress.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider defaultTheme="system" storageKey="trackflow-theme">
          <ChallengeProvider>
            <AppShell>
              {children}
            </AppShell>
            <Toaster />
          </ChallengeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
