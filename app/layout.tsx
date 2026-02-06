import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'RealEstateMagic AI',
  description: 'AI-Powered Real Estate Marketing',
  appleWebApp: { title: 'RE-Magic', statusBarStyle: 'black-translucent', capable: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Impedisce alle scritte di rimpicciolirsi o ballare
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="antialiased">
      <body className="bg-slate-50 overflow-x-hidden selection:bg-blue-100 italic-none">
        {children}
      </body>
    </html>
  );
}
