'use client';

import { useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { shortenAddress, addressUrl, txUrl } from '@/lib/utils';

export function AddressLink({ address }: { address: string }) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: mainnet.id,
    query: { staleTime: 24 * 60 * 60 * 1000 }, // cache for 24h
  });

  return (
    <a
      href={addressUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-zinc-300 hover:text-emerald-400 transition-colors"
      title={address}
    >
      {ensName || shortenAddress(address)}
    </a>
  );
}

export function TxLink({ hash, label }: { hash: string; label?: string }) {
  return (
    <a
      href={txUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-zinc-500 hover:text-emerald-400 transition-colors"
    >
      {label || shortenAddress(hash)}
    </a>
  );
}
