import './globals.css'; // <--- QUESTA RIGA È FONDAMENTALE
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RealEstateMagic AI',
  description: 'AI-Powered Real Estate Marketing',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
