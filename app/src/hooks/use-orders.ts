'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchListingOrders } from '@/lib/api';

export type OrderData = {
  id: string;
  nullifier: string;
  buyer: string;
  agentAddress: string;
  token: string;
  amount: string;
  status: 'open' | 'fulfilled' | 'cancelled';
  createdAt: string;
  resolvedAt: string | null;
  txHash: string;
  resolveTxHash: string | null;
};

export function useListingOrders(nullifier: string) {
  const { data, isLoading } = useQuery<OrderData[]>({
    queryKey: ['orders', nullifier],
    queryFn: () => fetchListingOrders(nullifier),
    refetchInterval: false,
  });

  return { orders: data ?? [], isLoading };
}

export function useRefetchOrders(nullifier: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['orders', nullifier] });
}
