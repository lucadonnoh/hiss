'use client';

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { isAddress } from 'viem';
import { useTx } from '@/hooks/use-tx';
import { useListings, useRefetchListings } from '@/hooks/use-listings';
import { useListingOrders, useRefetchOrders, type OrderData } from '@/hooks/use-orders';
import { HISS_ESCROW_ABI, HISS_ESCROW_ADDRESS, ERC20_ABI, AGENTBOOK_ABI, AGENTBOOK_ADDRESS } from '@/lib/contracts';
import { formatBounty, formatUsd } from '@/lib/utils';
import { useEthPrice } from '@/hooks/use-eth-price';
import { AddressLink, TxLink } from './explorer-link';
import { API_BASE } from '@/lib/api';
import { SellerOrderActions, BuyerOrderActions } from './order-actions';

export function ListingDetail({ nullifier }: { nullifier: string }) {
  const { address } = useAccount();
  const ethPrice = useEthPrice();
  const [agentAddress, setAgentAddress] = useState('');

  const { listings } = useListings();
  const listing = listings.find((l) => l.id === nullifier);

  const { orders } = useListingOrders(nullifier);
  const refetchListings = useRefetchListings();
  const refetchOrders = useRefetchOrders(nullifier);

  function onUpdate() {
    refetchListings();
    refetchOrders();
  }

  const ordersUrl = `${API_BASE}/listings/${nullifier}/orders`;
  const listingsUrl = `${API_BASE}/listings`;
  const acceptTx = useTx(onUpdate, ordersUrl);
  const deactivateTx = useTx(onUpdate, listingsUrl);

  // Check if agent is already registered (must be before early returns)
  const { data: agentNullifier } = useReadContract({
    address: AGENTBOOK_ADDRESS,
    abi: AGENTBOOK_ABI,
    functionName: 'lookupHuman',
    args: [agentAddress as `0x${string}`],
    chainId: base.id,
    query: { enabled: isAddress(agentAddress) },
  });
  const agentAlreadyRegistered = agentNullifier !== undefined && agentNullifier !== BigInt(0);

  if (!listing) {
    return (
      <div className="max-w-lg mx-auto space-y-4 px-4 md:px-0">
        <div className="border border-[#1a1a1f] bg-[#0c0c0f] animate-pulse">
          <div className="px-4 py-2.5 border-b border-[#1a1a1f] flex items-center justify-between">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
            <div className="h-4 w-24 bg-zinc-800 rounded" />
          </div>
          <div className="divide-y divide-[#111114]">
            <div className="flex justify-between px-4 py-2.5">
              <div className="h-3 w-12 bg-zinc-800 rounded" />
              <div className="h-3 w-28 bg-zinc-800 rounded" />
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <div className="h-3 w-12 bg-zinc-800 rounded" />
              <div className="h-3 w-10 bg-zinc-800 rounded" />
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <div className="h-3 w-24 bg-zinc-800 rounded" />
              <div className="h-3 w-6 bg-zinc-800 rounded" />
            </div>
          </div>
          <div className="px-4 py-3 border-t border-[#1a1a1f] space-y-3">
            <div className="h-3 w-28 bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-zinc-800 rounded" />
            <div className="h-10 w-full bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (listing.seller === '0x0000000000000000000000000000000000000000') {
    return (
      <div className="text-center py-20">
        <span className="text-zinc-600 text-xs">LISTING NOT FOUND</span>
      </div>
    );
  }

  const isSeller = address?.toLowerCase() === listing.seller.toLowerCase();
  const isEth = listing.token === '0x0000000000000000000000000000000000000000';
  const validAgent = agentAddress === '' || isAddress(agentAddress);

  const canAccept = listing.active && isAddress(agentAddress) && !agentAlreadyRegistered && acceptTx.status !== 'pending' && acceptTx.status !== 'confirming';

  function handleAccept() {
    if (!canAccept || !listing) return;
    if (isEth) {
      acceptTx.send({
        address: HISS_ESCROW_ADDRESS,
        abi: HISS_ESCROW_ABI,
        functionName: 'acceptListing',
        args: [BigInt(nullifier), agentAddress as `0x${string}`],
        value: BigInt(listing.price),
      });
    } else {
      acceptTx.send({
        address: listing.token as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [HISS_ESCROW_ADDRESS, BigInt(listing.price)],
      });
    }
  }

  function getButtonText() {
    if (acceptTx.status === 'pending') return 'CONFIRM IN WALLET...';
    if (acceptTx.status === 'confirming') return 'CONFIRMING...';
    if (!isEth) return 'APPROVE & BUY';
    return 'BUY VERIFICATION';
  }

  const pendingOrders = orders.filter((o) => o.status === 'open');
  const doneOrders = orders.filter((o) => o.status !== 'open');

  return (
    <div className="max-w-lg mx-auto space-y-4 px-4 md:px-0">
      <div className="border border-[#1a1a1f] bg-[#0c0c0f]">
        <div className="px-4 py-2.5 border-b border-[#1a1a1f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Listing
            </span>
            {listing.active ? (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                ACTIVE
              </span>
            ) : (
              <span className="text-[10px] text-zinc-600">INACTIVE</span>
            )}
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-emerald-400 glow-accent">
              {formatBounty(BigInt(listing.price), listing.token)}
            </span>
            {formatUsd(BigInt(listing.price), listing.token, ethPrice) && (
              <div className="text-[10px] text-zinc-600">
                {formatUsd(BigInt(listing.price), listing.token, ethPrice)}
              </div>
            )}
          </div>
        </div>

        <div className="text-xs divide-y divide-[#111114]">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-zinc-600">SELLER</span>
            <AddressLink address={listing.seller} />
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-zinc-600">TOKEN</span>
            <span className="text-zinc-200">{isEth ? 'ETH' : 'USDC'}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-zinc-600">REGISTRATIONS</span>
            <span className={listing.registrations === 0 ? 'text-zinc-600' : listing.registrations <= 3 ? 'text-zinc-200' : 'text-yellow-500'}>
              {listing.registrations}
            </span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-zinc-600">WORLD ID</span>
            <span className="text-zinc-500 text-[10px] font-mono">{listing.nullifierHash.slice(0, 12)}...{listing.nullifierHash.slice(-6)}</span>
          </div>
        </div>

        {listing.active && !isSeller && (
          <div className="px-4 py-3 border-t border-[#1a1a1f] space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1.5">
                Your Agent Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={agentAddress}
                onChange={(e) => setAgentAddress(e.target.value)}
                className={`w-full bg-[#08080a] border px-3 py-3 md:py-2 text-sm md:text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 ${
                  !validAgent ? 'border-red-500/50' : 'border-[#1a1a1f]'
                }`}
              />
              {!validAgent && (
                <span className="text-red-400 text-[10px] mt-0.5 block">INVALID ADDRESS</span>
              )}
              {validAgent && agentAlreadyRegistered && (
                <span className="text-red-400 text-[10px] mt-0.5 block">THIS AGENT IS ALREADY REGISTERED</span>
              )}
            </div>

            <button
              onClick={handleAccept}
              disabled={!canAccept}
              className="w-full py-3 md:py-2.5 text-xs font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-800 transition-all"
            >
              {getButtonText()}
            </button>

            {acceptTx.status === 'success' && (
              <div className="text-emerald-400 text-[10px] text-center py-1.5 bg-emerald-500/5 border border-emerald-500/10">
                ORDER CREATED {acceptTx.hash && <TxLink hash={acceptTx.hash} label="View tx" />}
              </div>
            )}
            {acceptTx.error && (
              <div className="text-red-400 text-[10px] text-center py-1.5 bg-red-500/5 border border-red-500/10 break-all">
                {acceptTx.error}
              </div>
            )}
          </div>
        )}

        {listing.active && isSeller && (
          <div className="px-4 py-3 border-t border-[#1a1a1f]">
            <button
              onClick={() =>
                deactivateTx.send({
                  address: HISS_ESCROW_ADDRESS,
                  abi: HISS_ESCROW_ABI,
                  functionName: 'deactivateListing',
                  args: [BigInt(nullifier)],
                })
              }
              disabled={deactivateTx.status === 'pending' || deactivateTx.status === 'confirming'}
              className="w-full py-2 text-xs font-medium text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 disabled:opacity-40 transition-all"
            >
              {deactivateTx.status === 'pending' ? 'CONFIRM...' : deactivateTx.status === 'confirming' ? 'CONFIRMING...' : 'DEACTIVATE LISTING'}
            </button>
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div className="border border-[#1a1a1f] bg-[#0c0c0f]">
          <div className="px-4 py-2 border-b border-[#1a1a1f]">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Orders ({pendingOrders.length} pending, {doneOrders.length} done)
            </span>
          </div>

          {orders.map((order) => {
            const isBuyer = address?.toLowerCase() === order.buyer.toLowerCase();

            return (
              <div
                key={order.id}
                className={`px-4 py-3 border-b border-[#111114] text-xs ${order.status !== 'open' ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500">ORDER #{order.id}</span>
                    {isBuyer && <span className="text-[10px] text-emerald-400/70 bg-emerald-400/10 px-1.5 py-0.5 rounded">YOU</span>}
                    {order.txHash && <TxLink hash={order.txHash} label="tx" />}
                  </div>
                  {order.status === 'open' ? (
                    <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 pulse-dot" />
                      PENDING
                    </span>
                  ) : order.status === 'fulfilled' ? (
                    <span className="text-zinc-400 text-[10px]">FULFILLED</span>
                  ) : (
                    <span className="text-red-400/60 text-[10px]">CANCELLED</span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Agent</span>
                    <AddressLink address={order.agentAddress} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Buyer</span>
                    <AddressLink address={order.buyer} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Amount</span>
                    <span className="text-zinc-300">{formatBounty(BigInt(order.amount), order.token)}</span>
                  </div>
                  {order.resolveTxHash && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600">{order.status === 'fulfilled' ? 'Resolve tx' : 'Cancel tx'}</span>
                      <TxLink hash={order.resolveTxHash} />
                    </div>
                  )}
                </div>

                {order.status === 'open' && (
                  <div className="flex gap-2 mt-3">
                    {isSeller && (
                      <SellerOrderActions
                        order={order}
                        nullifierHash={BigInt(listing.nullifierHash)}
                        onUpdate={onUpdate}
                      />
                    )}
                    {isBuyer && (
                      <BuyerOrderActions order={order} onUpdate={onUpdate} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
