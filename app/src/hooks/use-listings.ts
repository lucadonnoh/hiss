'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchListings } from '@/lib/api';

export type ListingData = {
  id: string; // nullifierHash as string
  seller: string;
  nullifierHash: string;
  token: string;
  price: string;
  active: boolean;
  createdAt: string;
  registrations: number;
};

export function useListings() {
  const { data, isLoading } = useQuery<ListingData[]>({
    queryKey: ['listings'],
    queryFn: fetchListings,
    refetchInterval: false,
  });

  return { listings: data ?? [], isLoading };
}

export function useRefetchListings() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['listings'] });
}
