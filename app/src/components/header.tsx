'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useListings } from '@/hooks/use-listings';

export function Header() {
  const { listings, isLoading } = useListings();
  const activeCount = listings.filter((l) => l.active).length;

  return (
    <header className="border-b border-[#1a1a1f] bg-[#0c0c0f] shrink-0">
      <div className="max-w-4xl mx-auto px-4 h-11 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-emerald-400 glow-accent">
              HISS
            </span>
            <span className="text-[10px] text-zinc-600">v0</span>
          </Link>

          <div className="hidden sm:flex items-center gap-4 text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span>
                SELLERS{' '}
                {isLoading ? (
                  <span className="inline-block w-3 h-3 bg-zinc-800 rounded animate-pulse align-middle" />
                ) : (
                  <span className="text-zinc-300">{activeCount}</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-zinc-600 text-[10px]">BASE</span>
          <ConnectButton
            accountStatus="address"
            chainStatus="none"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
