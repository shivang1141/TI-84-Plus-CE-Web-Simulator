import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TI-84 Plus CE Simulator',
  description: 'A high-fidelity, pixel-perfect web-based TI-84 Plus CE graphing calculator simulator. Supports arithmetic, algebra, graphing, statistics, matrices, and TI-BASIC programs.',
  keywords: ['TI-84', 'graphing calculator', 'simulator', 'Texas Instruments', 'math', 'graphing'],
  openGraph: {
    title: 'TI-84 Plus CE Simulator',
    description: 'Full-featured TI-84 Plus CE graphing calculator in your browser',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
