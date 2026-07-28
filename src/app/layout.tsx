import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Brand display serif for H1–H4 and editorial moments (report titles, board summary
// headlines). Google Fonts' "Fraunces" — the brief's "Fruances" spelling doesn't match
// any published font; this is the closest real, freely-licensed match by name and by
// character (a soft, editorial display serif), so it's used as the actual rendered
// typeface pending confirmation. Swap the import if a different licensed Fruances font
// file is intended instead.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600'],
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'chnnl — Psychological Safety & Wellbeing Intelligence',
  description:
    'chnnl is an enterprise platform for continuously measuring workforce wellbeing, psychological safety and psychosocial risk.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
