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
      address: "0x30230575991055532408db1c36b924347cc34520",
      startBlock: 43542479,
    },
    AgentBook: {
      abi: AgentBookAbi,
      chain: "base",
      address: "0xE1D1D3526A6FAa37eb36bD10B933C1b77f4561a4",
      startBlock: 43542479,
    },
  },
});
