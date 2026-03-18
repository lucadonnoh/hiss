'use client';

import { useReadContract } from 'wagmi';
import { base } from 'wagmi/chains';
import { useTx } from '@/hooks/use-tx';
import { AGENTBOOK_ABI, AGENTBOOK_ADDRESS, HISS_ESCROW_ABI, HISS_ESCROW_ADDRESS } from '@/lib/contracts';
import { TxLink } from './explorer-link';
import { API_BASE } from '@/lib/api';
import type { OrderData } from '@/hooks/use-orders';

export function SellerOrderActions({
  order,
  nullifierHash,
  onUpdate,
}: {
  order: OrderData;
  nullifierHash: bigint;
  onUpdate: () => void;
}) {
  const { data: registeredNullifier, isLoading: lookupLoading } = useReadContract({
    address: AGENTBOOK_ADDRESS,
    abi: AGENTBOOK_ABI,
    functionName: 'lookupHuman',
    args: [order.agentAddress as `0x${string}`],
    chainId: base.id,
  });

  const isRegistered = !lookupLoading && registeredNullifier !== undefined && registeredNullifier !== BigInt(0);

  const registerTx = useTx(onUpdate, `${API_BASE}/listings`);
  const resolveTx = useTx(onUpdate, `${API_BASE}/listings`);

  if (lookupLoading) {
    return (
      <div className="flex-1">
        <div className="w-full py-2 bg-zinc-800/50 animate-pulse rounded" />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="flex-1 space-y-1">
        <button
          onClick={() => {
            navigator.clipboard.writeText(`npx @worldcoin/agentkit-cli register ${order.agentAddress} --network base`);
            alert('Command copied! Run it in your terminal to register the agent via World ID.');
          }}
          className="w-full py-2 text-[11px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all"
        >
          1. REGISTER AGENT (COPY CMD)
        </button>
        <span className="text-[10px] text-zinc-600 block">Requires World ID verification via CLI</span>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1">
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
        className="w-full py-2 text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 disabled:opacity-40 transition-all"
      >
        {resolveTx.status === 'pending' ? 'CONFIRM...' : resolveTx.status === 'confirming' ? 'CLAIMING...' : '2. RESOLVE & CLAIM'}
      </button>
      {resolveTx.hash && <div className="text-[10px]"><TxLink hash={resolveTx.hash} label="View tx" /></div>}
      {resolveTx.error && <div className="text-red-400 text-[10px]">{resolveTx.error}</div>}
    </div>
  );
}

export function BuyerOrderActions({
  order,
  onUpdate,
}: {
  order: OrderData;
  onUpdate: () => void;
}) {
  const cancelTx = useTx(onUpdate, `${API_BASE}/listings`);

  return (
    <div className="flex-1 space-y-1">
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
        className="w-full py-2 text-[11px] font-medium text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 disabled:opacity-40 transition-all"
      >
        {cancelTx.status === 'pending' ? 'CONFIRM...' : cancelTx.status === 'confirming' ? 'CANCELLING...' : 'CANCEL & REFUND'}
      </button>
      {cancelTx.hash && <div className="text-[10px]"><TxLink hash={cancelTx.hash} label="View tx" /></div>}
      {cancelTx.error && <div className="text-red-400 text-[10px]">{cancelTx.error}</div>}
    </div>
  );
}
