'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createWorldBridgeStore, VerificationState } from '@worldcoin/idkit-core';
import { QRCodeSVG } from 'qrcode.react';

const APP_ID = 'app_a7c3e2b6b83927251a0db5345bd7146a' as const;
const ACTION = 'agentbook-registration';

interface Props {
  onVerified: (nullifierHash: string) => void;
}

export function WorldIdVerify({ onVerified }: Props) {
  const [state, setState] = useState<'idle' | 'connecting' | 'waiting' | 'done' | 'error'>('idle');
  const [connectorURI, setConnectorURI] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const pollingRef = useRef(false);

  const startVerification = useCallback(async () => {
    setState('connecting');
    setErrorMsg('');

    try {
      const store = createWorldBridgeStore();
      const bridgeState = store.getState();

      await bridgeState.createClient({
        app_id: APP_ID,
        action: ACTION,
      });

      const uri = store.getState().connectorURI;
      setConnectorURI(uri);
      setState('connecting');

      // Poll for updates
      pollingRef.current = true;
      const poll = async () => {
        while (pollingRef.current) {
          await store.getState().pollForUpdates();
          const s = store.getState();

          if (s.verificationState === VerificationState.WaitingForApp) {
            setState('waiting');
          }

          if (s.verificationState === VerificationState.Confirmed && s.result) {
            pollingRef.current = false;
            const nullifierDecimal = BigInt(s.result.nullifier_hash).toString();
            onVerified(nullifierDecimal);
            setState('done');
            return;
          }

          if (s.verificationState === VerificationState.Failed) {
            pollingRef.current = false;
            setErrorMsg(s.errorCode || 'Verification failed');
            setState('error');
            return;
          }

          await new Promise((r) => setTimeout(r, 2000));
        }
      };

      poll();
    } catch (err) {
      setState('error');
      setErrorMsg((err as Error).message?.slice(0, 80) || 'Failed to connect');
    }
  }, [onVerified]);

  useEffect(() => {
    return () => {
      pollingRef.current = false;
    };
  }, []);

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-emerald-400 text-xs">VERIFIED</span>
      </div>
    );
  }

  if (state === 'connecting' || state === 'waiting') {
    return (
      <div className="space-y-2">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
          {state === 'waiting' ? 'CONFIRM IN WORLD APP' : 'SCAN WITH WORLD APP'}
        </div>
        {connectorURI && (
          <div className="flex flex-col items-center gap-2">
            <a href={connectorURI} target="_blank" rel="noopener noreferrer">
              <QRCodeSVG
                value={connectorURI}
                size={160}
                bgColor="#0c0c0f"
                fgColor="#e4e4e7"
                level="L"
              />
            </a>
            <a
              href={connectorURI}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-400 hover:text-emerald-300 underline"
            >
              Open in World App
            </a>
          </div>
        )}
        <div className="text-[10px] text-zinc-600 animate-pulse">
          {state === 'waiting' ? 'Waiting for confirmation...' : 'Waiting for connection...'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={startVerification}
        className="w-full py-2 text-xs font-medium text-zinc-300 border border-[#1a1a1f] hover:border-zinc-600 bg-[#08080a] transition-all"
      >
        VERIFY WITH WORLD ID
      </button>
      {state === 'error' && (
        <div className="text-red-400 text-[10px]">{errorMsg}</div>
      )}
    </div>
  );
}
