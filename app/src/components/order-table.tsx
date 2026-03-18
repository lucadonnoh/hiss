'use client';

import { useState } from 'react';
import { useListings, useRefetchListings, type ListingData } from '@/hooks/use-listings';
import { useAccount } from 'wagmi';
import { useTx } from '@/hooks/use-tx';
import { HISS_ESCROW_ABI, HISS_ESCROW_ADDRESS } from '@/lib/contracts';
import { formatBounty, formatUsd } from '@/lib/utils';
import { useEthPrice } from '@/hooks/use-eth-price';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AddressLink } from './explorer-link';
import { API_BASE } from '@/lib/api';

function ListingActions({
  listing,
  isSeller,
}: {
  listing: ListingData;
  isSeller: boolean;
}) {
  const refetchListings = useRefetchListings();
  const delistTx = useTx(refetchListings, `${API_BASE}/listings`);
  const busy = delistTx.status === 'pending' || delistTx.status === 'confirming';

  if (!listing.active) {
    return <span className="text-zinc-600 text-[10px]">INACTIVE</span>;
  }

  if (isSeller) {
    return (
      <div className="flex items-center gap-1.5">
        <Link
          href={`/listing/${listing.id}`}
          onClick={(e) => e.stopPropagation()}
          className="px-2 py-0.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-600 transition-all"
        >
          VIEW
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            delistTx.send({
              address: HISS_ESCROW_ADDRESS,
              abi: HISS_ESCROW_ABI,
              functionName: 'deactivateListing',
              args: [BigInt(listing.id)],
            });
          }}
          disabled={busy}
          className="px-2 py-0.5 text-[11px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-zinc-800 hover:border-red-500/30 transition-all disabled:opacity-40"
        >
          {busy ? 'WAIT' : 'DELIST'}
        </button>
      </div>
    );
  }

  return (
    <Link
      href={`/listing/${listing.id}`}
      onClick={(e) => e.stopPropagation()}
      className="px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
    >
      BUY
    </Link>
  );
}

export function OrderTable() {
  const { listings, isLoading } = useListings();
  const { address } = useAccount();
  const ethPrice = useEthPrice();
  const router = useRouter();

  const [sortBy, setSortBy] = useState<'regs' | 'price'>('price');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const activeListings = listings.filter((l) => l.active).sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'regs') {
      const diff = a.registrations - b.registrations;
      if (diff !== 0) return diff * dir;
      return (Number(BigInt(a.price) - BigInt(b.price))) * dir;
    }
    const diff = Number(BigInt(a.price) - BigInt(b.price));
    if (diff !== 0) return diff * dir;
    return (a.registrations - b.registrations) * dir;
  });

  function toggleSort(col: 'regs' | 'price') {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-[#1a1a1f] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Sellers
          </span>
          {activeListings.length > 0 && (
            <span className="text-[10px] text-zinc-600">
              {activeListings.length} active
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="text-zinc-600 text-xs animate-pulse">LOADING...</span>
        </div>
      ) : activeListings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <span className="text-zinc-600 text-xs">NO ACTIVE SELLERS</span>
          <span className="text-zinc-700 text-[10px]">Verify with World ID and post a listing to start selling</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[1fr_100px_140px_120px] gap-0 px-4 py-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider border-b border-[#1a1a1f] bg-[#0a0a0c]">
            <div>Seller</div>
            <button onClick={() => toggleSort('regs')} className={`text-center cursor-pointer hover:text-zinc-400 transition-colors ${sortBy === 'regs' ? 'text-zinc-300' : ''}`}>
              Registrations {sortBy === 'regs' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
            </button>
            <button onClick={() => toggleSort('price')} className={`text-right cursor-pointer hover:text-zinc-400 transition-colors ${sortBy === 'price' ? 'text-zinc-300' : ''}`}>
              Price {sortBy === 'price' && (sortDir === 'asc' ? '\u2191' : '\u2193')}
            </button>
            <div className="text-right">Action</div>
          </div>

          {activeListings.map((listing) => (
            <div
              key={listing.id}
              onClick={() => router.push(`/listing/${listing.id}`)}
              className="order-row grid grid-cols-[1fr_100px_140px_120px] gap-0 px-4 py-2 border-b border-[#111114] items-center cursor-pointer"
            >
              <div className="text-xs font-medium flex items-center gap-1.5">
                <AddressLink address={listing.seller} />
                {address?.toLowerCase() === listing.seller.toLowerCase() && (
                  <span className="text-[10px] text-emerald-400/70 bg-emerald-400/10 px-1.5 py-0.5 rounded">YOU</span>
                )}
              </div>
              <div className="text-xs text-center">
                <span className={listing.registrations === 0 ? 'text-zinc-600' : listing.registrations <= 3 ? 'text-zinc-400' : 'text-yellow-500'}>
                  {listing.registrations}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-400 font-medium glow-accent">
                  {formatBounty(BigInt(listing.price), listing.token)}
                </div>
                {formatUsd(BigInt(listing.price), listing.token, ethPrice) && (
                  <div className="text-[10px] text-zinc-600">
                    {formatUsd(BigInt(listing.price), listing.token, ethPrice)}
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <ListingActions
                  listing={listing}
                  isSeller={address?.toLowerCase() === listing.seller.toLowerCase()}
                />
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
