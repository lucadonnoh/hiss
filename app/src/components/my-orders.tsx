'use client';

import { useAccount, useReadContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_BASE, fetchOrders } from '@/lib/api';
import { formatBounty } from '@/lib/utils';
import { AddressLink, TxLink } from './explorer-link';
import { useTx } from '@/hooks/use-tx';
import { HISS_ESCROW_ABI, HISS_ESCROW_ADDRESS, AGENTBOOK_ABI, AGENTBOOK_ADDRESS } from '@/lib/contracts';
import Link from 'next/link';
import type { OrderData } from '@/hooks/use-orders';

async function fetchMyOrders(address: string) {
  const [buyerOrders, sellerOrders] = await Promise.all([
    fetch(`${API_BASE}/orders?buyer=${address}`).then((r) => r.json()),
    fetch(`${API_BASE}/orders?seller=${address}`).then((r) => r.json()),
  ]);
  // Deduplicate by order id
  const seen = new Set<string>();
  const all: OrderData[] = [];
  for (const o of [...sellerOrders, ...buyerOrders]) {
    if (!seen.has(o.id)) {
      seen.add(o.id);
      all.push(o);
    }
  }
  return all;
}

export function MyOrders() {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const { data: orders } = useQuery<OrderData[]>({
    queryKey: ['my-orders', address],
    queryFn: () => fetchMyOrders(address!),
    enabled: !!address,
    refetchInterval: false,
  });

  const openOrders = (orders ?? []).filter((o) => o.status === 'open');

  if (!address || openOrders.length === 0) return null;

  return (
    <div className="border-t border-[#1a1a1f] empty:hidden [&:not(:has(.my-order-row))]:hidden">
      <div className="px-4 py-2 border-b border-[#1a1a1f] bg-[#0a0a0c]">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          My Open Orders
        </span>
      </div>
      {openOrders.map((order) => (
        <MyOrderRow
          key={order.id}
          order={order}
          address={address}
          onUpdate={() => queryClient.invalidateQueries({ queryKey: ['my-orders'] })}
        />
      ))}
    </div>
  );
}

function MyOrderRow({ order, address, onUpdate }: { order: OrderData; address: string; onUpdate: () => void }) {
  const isBuyer = address.toLowerCase() === order.buyer.toLowerCase();
  const isSeller = !isBuyer;

  const { data: registeredNullifier, queryKey: lookupKey, isLoading: lookupLoading } = useReadContract({
    address: AGENTBOOK_ADDRESS,
    abi: AGENTBOOK_ABI,
    functionName: 'lookupHuman',
    args: [order.agentAddress as `0x${string}`],
    chainId: base.id,
  });
  const isRegistered = !lookupLoading && registeredNullifier !== undefined && registeredNullifier !== BigInt(0);

  const queryClient = useQueryClient();
  function onTxSuccess() {
    onUpdate();
    queryClient.invalidateQueries({ queryKey: lookupKey });
  }

  const cancelTx = useTx(onUpdate, `${API_BASE}/orders?buyer=${order.buyer}`);
  const registerTx = useTx(onTxSuccess, `${API_BASE}/listings`);
  const resolveTx = useTx(onTxSuccess, `${API_BASE}/listings`);

  // Buyer's order is done once agent is registered — hide while loading too to avoid flash
  if (isBuyer && (lookupLoading || isRegistered)) return <></>;

  return (
    <div className="my-order-row px-4 py-3 border-b border-[#111114] text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-zinc-500">ORDER #{order.id}</span>
          <span className="text-[10px] text-emerald-400/70 bg-emerald-400/10 px-1.5 py-0.5 rounded">
            {isBuyer ? 'BUYER' : 'SELLER'}
          </span>
          <Link
            href={`/listing/${order.nullifier}`}
            className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            VIEW LISTING
          </Link>
        </div>
        <span className="text-emerald-400 text-[10px] flex items-center gap-1 shrink-0">
          <span className="w-1 h-1 rounded-full bg-emerald-400 pulse-dot" />
          PENDING
        </span>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-zinc-500 min-w-0">
          <span className="truncate">Agent: <AddressLink address={order.agentAddress} /></span>
          <span className="shrink-0">{formatBounty(BigInt(order.amount), order.token)}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isSeller && !lookupLoading && !isRegistered && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(`npx @worldcoin/agentkit-cli register ${order.agentAddress} --network base`);
                alert('Command copied! Run it in your terminal to register the agent via World ID.');
              }}
              className="px-3 py-1.5 md:px-2 md:py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
            >
              1. REGISTER (COPY CMD)
            </button>
          )}
          {isSeller && !lookupLoading && isRegistered && (
            <button
              onClick={() =>
                resolveTx.send({
                  address: HISS_ESCROW_ADDRESS,
                  abi: HISS_ESCROW_ABI,
                  functionName: 'resolve',
                  args: [BigInt(order.id)],
                })
              }
              disabled={resolveTx.status === 'pending' || resolveTx.status === 'confirming'}
              className="px-3 py-1.5 md:px-2 md:py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-40 transition-all"
            >
              {resolveTx.status === 'pending' ? 'CONFIRM...' : resolveTx.status === 'confirming' ? 'CLAIM...' : '2. RESOLVE'}
            </button>
          )}
          {isBuyer && !isRegistered && (
            <button
              onClick={() =>
                cancelTx.send({
                  address: HISS_ESCROW_ADDRESS,
                  abi: HISS_ESCROW_ABI,
                  functionName: 'cancelOrder',
                  args: [BigInt(order.id)],
                })
              }
              disabled={cancelTx.status === 'pending' || cancelTx.status === 'confirming'}
              className="px-3 py-1.5 md:px-2 md:py-0.5 text-[11px] font-medium text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 disabled:opacity-40 transition-all"
            >
              {cancelTx.status === 'pending' ? 'CONFIRM...' : cancelTx.status === 'confirming' ? 'CANCELLING...' : 'CANCEL'}
            </button>
          )}
        </div>
      </div>
      {(cancelTx.hash || registerTx.hash || resolveTx.hash) && (
        <div className="mt-1 text-[10px]">
          <TxLink hash={(cancelTx.hash || registerTx.hash || resolveTx.hash)!} label="View tx" />
        </div>
      )}
      {(cancelTx.error || registerTx.error || resolveTx.error) && (
        <div className="mt-1 text-red-400 text-[10px]">{cancelTx.error || registerTx.error || resolveTx.error}</div>
      )}
    </div>
  );
}
