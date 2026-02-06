// app/layout.tsx
export const metadata = {
  title: 'RealEstateMagic AI',
  description: 'AI-Powered Real Estate Marketing',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  themeColor: '#2563eb',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
