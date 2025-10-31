import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QRP Talk - Chat Online em Tempo Real',
  description: 'Mantenha contato com seus amigos e familiares em tempo real',
  keywords: ['chat', 'mensagens', 'tempo real', 'comunicação'],
  authors: [{ name: 'QRP Talk' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
