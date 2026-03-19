import { createConfig } from "ponder";
import { http } from "viem";
import { HissEscrowAbi } from "./abis/HissEscrow";
import { AgentBookAbi } from "./abis/AgentBook";

export default createConfig({
  chains: {
    base: {
      id: 8453,
      rpc: http(process.env.PONDER_RPC_URL_8453),
    },
  },
  contracts: {
    HissEscrow: {
      abi: HissEscrowAbi,
      chain: "base",
      address: "0x229b238242b73b0cb1c5a493c183426bf68cc5be",
      startBlock: 43568450,
    },
    AgentBook: {
      abi: AgentBookAbi,
      chain: "base",
      address: "0xE1D1D3526A6FAa37eb36bD10B933C1b77f4561a4",
      startBlock: 43542479,
    },
  },
});
