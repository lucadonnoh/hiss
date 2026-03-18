import { formatEther, formatUnits } from 'viem';
import { USDC_ADDRESS } from './contracts';

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBounty(amount: bigint, token: string): string {
  if (token === '0x0000000000000000000000000000000000000000') {
    const val = formatEther(amount);
    const num = parseFloat(val);
    if (num === 0) return '0 ETH';
    const decimals = Math.max(4, (val.split('.')[1] || '').replace(/0+$/, '').length);
    return `${num.toFixed(decimals)} ETH`;
  }
  if (token.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
    return `${parseFloat(formatUnits(amount, 6)).toFixed(2)} USDC`;
  }
  return `${amount.toString()} ???`;
}

export function formatUsd(amount: bigint, token: string, ethPrice: number | null): string | null {
  if (!ethPrice) return null;
  if (token === '0x0000000000000000000000000000000000000000') {
    const eth = parseFloat(formatEther(amount));
    const usd = eth * ethPrice;
    if (usd < 0.01) return '<$0.01';
    return `$${usd.toFixed(2)}`;
  }
  if (token.toLowerCase() === USDC_ADDRESS.toLowerCase()) {
    const usd = parseFloat(formatUnits(amount, 6));
    return `$${usd.toFixed(2)}`;
  }
  return null;
}

export type OrderStatus = 'open' | 'resolved';

export function getOrderStatus(resolved: boolean): OrderStatus {
  return resolved ? 'resolved' : 'open';
}

const EXPLORER = 'https://basescan.org';

export function addressUrl(address: string): string {
  return `${EXPLORER}/address/${address}`;
}

export function txUrl(hash: string): string {
  return `${EXPLORER}/tx/${hash}`;
}
