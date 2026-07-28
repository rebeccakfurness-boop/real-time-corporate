import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'chnnl — Psychological Safety & Wellbeing Intelligence',
  description:
    'chnnl is an enterprise platform for continuously measuring workforce wellbeing, psychological safety and psychosocial risk.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
