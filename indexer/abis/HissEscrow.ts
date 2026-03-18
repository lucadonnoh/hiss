export const HissEscrowAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "nullifier", type: "uint256" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "token", type: "address" },
      { indexed: false, name: "price", type: "uint256" },
    ],
    name: "ListingCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "nullifier", type: "uint256" }],
    name: "ListingDeactivated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "uint256" },
      { indexed: true, name: "nullifier", type: "uint256" },
      { indexed: true, name: "buyer", type: "address" },
      { indexed: false, name: "agentAddress", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "OrderCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "orderId", type: "uint256" },
      { indexed: true, name: "seller", type: "address" },
      { indexed: false, name: "payout", type: "uint256" },
    ],
    name: "OrderResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "orderId", type: "uint256" }],
    name: "OrderCancelled",
    type: "event",
  },
] as const;
