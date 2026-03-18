'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchOrders } from '@/lib/api';
import { formatBounty } from '@/lib/utils';
import { AddressLink, TxLink } from './explorer-link';
import type { OrderData } from '@/hooks/use-orders';

export function RecentActivity() {
  const { data: orders } = useQuery<OrderData[]>({
    queryKey: ['all-orders'],
    queryFn: () => fetchOrders(),
    refetchInterval: false,
  });

  const doneOrders = (orders ?? []).filter((o) => o.status !== 'open').slice(0, 10);

  if (doneOrders.length === 0) return null;

  return (
    <div className="border-t border-[#1a1a1f]">
      <div className="px-4 py-2 border-b border-[#1a1a1f] bg-[#0a0a0c]">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Recent Activity
        </span>
      </div>
      {doneOrders.map((order) => (
        <div
          key={order.id}
          className="px-4 py-2.5 border-b border-[#111114] text-xs"
        >
          {/* Desktop: single row */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center gap-3">
              {order.status === 'fulfilled' ? (
                <span className="text-emerald-400/60 text-[10px] w-16">FILLED</span>
              ) : (
                <span className="text-red-400/40 text-[10px] w-16">CANCELLED</span>
              )}
              <AddressLink address={order.agentAddress} />
              <span className="text-zinc-600">&larr;</span>
              <AddressLink address={order.buyer} />
            </div>
            <div className="flex items-center gap-3">
              <span className={order.status === 'fulfilled' ? 'text-emerald-400/70' : 'text-zinc-600'}>
                {formatBounty(BigInt(order.amount), order.token)}
              </span>
              {order.resolveTxHash && (
                <TxLink hash={order.resolveTxHash} label="tx" />
              )}
            </div>
          </div>

          {/* Mobile: stacked */}
          <div className="sm:hidden space-y-1">
            <div className="flex items-center justify-between">
              {order.status === 'fulfilled' ? (
                <span className="text-emerald-400/60 text-[10px]">FILLED</span>
              ) : (
                <span className="text-red-400/40 text-[10px]">CANCELLED</span>
              )}
              <span className={order.status === 'fulfilled' ? 'text-emerald-400/70' : 'text-zinc-600'}>
                {formatBounty(BigInt(order.amount), order.token)}
              </span>
            </div>
            <div className="flex items-center justify-between text-zinc-500">
              <AddressLink address={order.agentAddress} />
              {order.resolveTxHash && (
                <TxLink hash={order.resolveTxHash} label="tx" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
