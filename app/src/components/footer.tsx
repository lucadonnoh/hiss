'use client';

import Link from 'next/link';
import { HISS_ESCROW_ADDRESS } from '@/lib/contracts';

export function Footer() {
  return (
    <footer className="border-t border-[#1a1a1f] bg-[#0c0c0f] shrink-0">
      <div className="max-w-4xl mx-auto px-4 h-9 flex items-center justify-center gap-4 text-[10px] text-zinc-600">
        <Link
          href="/about"
          className="hover:text-zinc-400 transition-colors"
        >
          How it works
        </Link>
        <span className="text-zinc-800">|</span>
        <a
          href={`https://basescan.org/address/${HISS_ESCROW_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-400 transition-colors"
        >
          Contract
        </a>
        <span className="text-zinc-800">|</span>
        <a
          href="https://github.com/lucadonnoh/hiss"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-zinc-400 transition-colors"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}
