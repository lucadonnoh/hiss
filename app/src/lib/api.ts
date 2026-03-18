export const API_BASE = process.env.NEXT_PUBLIC_INDEXER_URL || 'http://localhost:42069';

export async function fetchListings() {
  const res = await fetch(`${API_BASE}/listings`);
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}

export async function fetchListingOrders(nullifier: string) {
  const res = await fetch(`${API_BASE}/listings/${nullifier}/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchOrders(buyer?: string) {
  const url = buyer ? `${API_BASE}/orders?buyer=${buyer}` : `${API_BASE}/orders`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchRegistrations(nullifier: string) {
  const res = await fetch(`${API_BASE}/registrations/${nullifier}`);
  if (!res.ok) throw new Error('Failed to fetch registrations');
  return res.json();
}
