export const AgentBookAbi = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "agent", type: "address" },
      { indexed: true, name: "humanId", type: "uint256" },
    ],
    name: "AgentRegistered",
    type: "event",
  },
] as const;
