'use client';

import { useEffect, useState } from 'react';
import { API_BASE } from '@/lib/api';

export function useEthPrice() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch(`${API_BASE}/eth-price`);
        const data = await res.json();
        if (data.usd) setPrice(data.usd);
      } catch {
        // silently fail
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, []);

  return price;
}
