'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { useTx } from '@/hooks/use-tx';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { HISS_ESCROW_ABI, HISS_ESCROW_ADDRESS, USDC_ADDRESS } from '@/lib/contracts';
import { WorldIdVerify } from './world-id-verify';
import { useListings, useRefetchListings } from '@/hooks/use-listings';
import { useEthPrice } from '@/hooks/use-eth-price';
import { API_BASE } from '@/lib/api';
import { formatBounty } from '@/lib/utils';
import Link from 'next/link';

type Token = 'ETH' | 'USDC';

export function CreateListingForm() {
  const { isConnected, address } = useAccount();
  const ethPrice = useEthPrice();
  const { listings } = useListings();
  const refetchListings = useRefetchListings();
  const [nullifierHash, setNullifierHash] = useState('');
  const [price, setPrice] = useState('');
  const [token, setToken] = useState<Token>('ETH');
  const [mounted, setMounted] = useState(false);

  const tx = useTx(refetchListings, `${API_BASE}/listings`);

  useEffect(() => setMounted(true), []);

  const existingListing = listings.find(
    (l) => l.active && l.seller.toLowerCase() === address?.toLowerCase()
  );

  const isValidPrice =
    price === '' || (parseFloat(price) > 0 && !isNaN(parseFloat(price)));
  const canSubmit =
    nullifierHash !== '' && parseFloat(price) > 0 && tx.status !== 'pending' && tx.status !== 'confirming';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const tokenAddress =
      token === 'ETH' ? '0x0000000000000000000000000000000000000000' : USDC_ADDRESS;
    const parsedPrice = token === 'ETH' ? parseEther(price) : parseUnits(price, 6);
    tx.send({
      address: HISS_ESCROW_ADDRESS,
      abi: HISS_ESCROW_ABI,
      functionName: 'createListing',
      args: [BigInt(nullifierHash), tokenAddress as `0x${string}`, parsedPrice] as readonly [bigint, `0x${string}`, bigint],
    });
  }

  const showForm = !mounted || isConnected;

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-[#1a1a1f] px-4 py-2">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Create Listing
        </span>
      </div>

      {!showForm ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <ConnectButton />
        </div>
      ) : existingListing ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-4 py-6 text-center">
          <span className="text-zinc-400 text-xs">YOUR LISTING IS ACTIVE</span>
          <span className="text-emerald-400 text-sm font-semibold">
            {formatBounty(BigInt(existingListing.price), existingListing.token)}
          </span>
          <Link
            href={`/listing/${existingListing.id}`}
            className="px-3 py-1.5 text-[11px] font-medium text-zinc-300 border border-zinc-700 hover:border-zinc-500 transition-all"
          >
            VIEW LISTING
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col px-4 py-3 gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
              World ID
            </label>
            <WorldIdVerify onVerified={setNullifierHash} />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
              Token
            </label>
            <div className="flex border border-[#1a1a1f] bg-[#08080a]">
              <button
                type="button"
                onClick={() => setToken('ETH')}
                className={`flex-1 py-2.5 md:py-1.5 text-xs font-medium transition-all ${
                  token === 'ETH'
                    ? 'bg-emerald-500/10 text-emerald-400 border-r border-emerald-500/20'
                    : 'text-zinc-600 hover:text-zinc-400 border-r border-[#1a1a1f]'
                }`}
              >
                ETH
              </button>
              <button
                type="button"
                onClick={() => setToken('USDC')}
                className={`flex-1 py-2.5 md:py-1.5 text-xs font-medium transition-all ${
                  token === 'USDC'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-zinc-600 hover:text-zinc-400'
                }`}
              >
                USDC
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
              Price ({token})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              placeholder={token === 'ETH' ? '0.05' : '100'}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`w-full bg-[#08080a] border px-3 py-3 md:py-2 text-sm md:text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 ${
                !isValidPrice ? 'border-red-500/50' : 'border-[#1a1a1f]'
              }`}
            />
            {token === 'ETH' && ethPrice && price && parseFloat(price) > 0 && (
              <span className="text-zinc-600 text-[10px] mt-0.5 block">
                ~${(parseFloat(price) * ethPrice).toFixed(2)} USD
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 md:py-2.5 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800 transition-all"
          >
            {tx.status === 'pending'
              ? 'CONFIRM IN WALLET...'
              : tx.status === 'confirming'
                ? 'CONFIRMING...'
                : 'POST LISTING'}
          </button>

          {tx.status === 'success' && (
            <div className="text-emerald-400 text-[10px] text-center py-1.5 bg-emerald-500/5 border border-emerald-500/10">
              LISTING POSTED
            </div>
          )}
          {tx.error && (
            <div className="text-red-400 text-[10px] text-center py-1.5 bg-red-500/5 border border-red-500/10 break-all">
              {tx.error}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
