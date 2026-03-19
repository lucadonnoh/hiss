import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'hiss — World ID Verification Marketplace',
  description: 'Trustless on-chain escrow for World ID verification on Base.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexMono.className} bg-[#08080a] text-zinc-300 antialiased scanlines`}
      >
        <Providers>
          <div className="flex flex-col min-h-dvh md:h-dvh md:overflow-hidden">
            <Header />
            <main className="flex-1 md:overflow-auto">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
