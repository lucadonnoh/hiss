'use client';

import { useState, useRef } from 'react';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { useWriteContract } from 'wagmi';

type TxStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export function useTx(onSuccess?: () => void, indexerUrl?: string) {
  const { writeContractAsync } = useWriteContract();
  const [status, setStatus] = useState<TxStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const snapshotRef = useRef<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function send(args: any) {
    try {
      setStatus('pending');
      setError(null);
      setHash(null);

      // Snapshot indexer state before tx
      if (indexerUrl) {
        snapshotRef.current = await fetch(indexerUrl).then((r) => r.text()).catch(() => '');
      }

      const txHash = await writeContractAsync(args);
      setHash(txHash);
      setStatus('confirming');
      await publicClient.waitForTransactionReceipt({ hash: txHash, confirmations: 1, pollingInterval: 1_000 });
      setStatus('success');

      // Wait for indexer to reflect the change
      if (indexerUrl) {
        for (let i = 0; i < 10; i++) {
          await new Promise((r) => setTimeout(r, 500));
          const current = await fetch(indexerUrl).then((r) => r.text()).catch(() => '');
          if (current !== snapshotRef.current) break;
        }
      } else {
        // No indexer URL — just wait a bit
        await new Promise((r) => setTimeout(r, 1_500));
      }

      onSuccess?.();
    } catch (e) {
      setStatus('error');
      setError((e as Error).message?.slice(0, 100) || 'Transaction failed');
    }
  }

  return { send, status, error, hash };
}
