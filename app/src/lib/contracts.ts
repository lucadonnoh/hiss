export const HISS_ESCROW_ADDRESS = '0x30230575991055532408db1c36b924347cc34520' as const;

// Real AgentBook on Base mainnet
export const AGENTBOOK_ADDRESS = '0xE1D1D3526A6FAa37eb36bD10B933C1b77f4561a4' as const;

// USDC on Base mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

export const HISS_ESCROW_ABI = [
  // Listings (keyed by nullifier)
  {
    inputs: [{ name: 'nullifier', type: 'uint256' }],
    name: 'getListing',
    outputs: [
      {
        components: [
          { name: 'seller', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'price', type: 'uint256' },
          { name: 'active', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'nullifier', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'price', type: 'uint256' },
    ],
    name: 'createListing',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'nullifier', type: 'uint256' }],
    name: 'deactivateListing',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Orders
  {
    inputs: [{ name: 'orderId', type: 'uint256' }],
    name: 'getOrder',
    outputs: [
      {
        components: [
          { name: 'nullifier', type: 'uint256' },
          { name: 'buyer', type: 'address' },
          { name: 'agentAddress', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'resolved', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextOrderId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'nullifier', type: 'uint256' },
      { name: 'agentAddress', type: 'address' },
    ],
    name: 'acceptListing',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderId', type: 'uint256' }],
    name: 'cancelOrder',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'orderId', type: 'uint256' }],
    name: 'resolve',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'nullifier', type: 'uint256' },
      { indexed: true, name: 'seller', type: 'address' },
      { indexed: false, name: 'token', type: 'address' },
      { indexed: false, name: 'price', type: 'uint256' },
    ],
    name: 'ListingCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'nullifier', type: 'uint256' }],
    name: 'ListingDeactivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'orderId', type: 'uint256' },
      { indexed: true, name: 'nullifier', type: 'uint256' },
      { indexed: true, name: 'buyer', type: 'address' },
      { indexed: false, name: 'agentAddress', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
    ],
    name: 'OrderCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'orderId', type: 'uint256' },
      { indexed: true, name: 'seller', type: 'address' },
      { indexed: false, name: 'payout', type: 'uint256' },
    ],
    name: 'OrderResolved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: 'orderId', type: 'uint256' }],
    name: 'OrderCancelled',
    type: 'event',
  },
] as const;

// Real AgentBook ABI — register requires full World ID proof
export const AGENTBOOK_ABI = [
  {
    inputs: [
      { name: 'agent', type: 'address' },
      { name: 'root', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'nullifierHash', type: 'uint256' },
      { name: 'proof', type: 'uint256[8]' },
    ],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: 'agent', type: 'address' }],
    name: 'lookupHuman',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'agent', type: 'address' }],
    name: 'getNextNonce',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'agent', type: 'address' },
      { indexed: true, name: 'humanId', type: 'uint256' },
    ],
    name: 'AgentRegistered',
    type: 'event',
  },
] as const;

export const ERC20_ABI = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
