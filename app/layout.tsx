// Update di emergenza per forzare il design
import './globals.css';

export const metadata = {
  title: 'RealEstateMagic AI',
  description: 'AI-Powered Real Estate Marketing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        {/* Questo forza il telefono a non rimpicciolire il sito */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc' }}>
        {children}
      </body>
    </html>
  );
}
