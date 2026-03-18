import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'hiss — World ID Verification Marketplace',
  description: 'Trustless on-chain escrow for World ID verification on Base.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexMono.className} bg-[#08080a] text-zinc-300 antialiased scanlines`}
      >
        <Providers>
          <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
