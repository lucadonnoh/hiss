'use client';

import { shortenAddress, addressUrl, txUrl } from '@/lib/utils';

export function AddressLink({ address }: { address: string }) {
  return (
    <a
      href={addressUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-zinc-300 hover:text-emerald-400 transition-colors"
    >
      {shortenAddress(address)}
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
