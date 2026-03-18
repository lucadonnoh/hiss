import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  injectedWallet,
  coinbaseWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Popular',
      wallets: [injectedWallet, coinbaseWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Hiss',
    projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_PROJECT_ID',
  }
);

export const config = createConfig({
  connectors,
  chains: [base],
  transports: {
    [base.id]: http(),
  },
});
