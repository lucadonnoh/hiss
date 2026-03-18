# Hiss

Trustless on-chain marketplace for World ID verification on Base.

World ID holders sell their verification to buyers who need it for agent wallets. Sellers list offers, buyers pick a seller and lock funds, the seller registers the buyer's agent via [AgentBook](https://github.com/worldcoin/agentkit), and the escrow contract verifies the registration landed on-chain before releasing payment.

## How it works

```
Seller                          Contract                         Buyer
  │                                │                                │
  │── createListing(nullifier) ──▶│                                │
  │                                │◀── acceptListing(agent) ──────│
  │                                │    (funds locked)              │
  │                                │                                │
  │── AgentBook.register(agent) ──▶│  (off-chain: World ID scan)   │
  │── resolve(orderId) ──────────▶│                                │
  │   (gets paid)                  │── verify lookupHuman(agent) ──│
  │                                │   (nullifier must match)       │
```

### Seller flow
1. Verify with World ID to get your nullifier hash
2. Post a listing with your price (ETH or USDC)
3. When a buyer accepts, register their agent address via the AgentBook CLI:
   ```
   npx @worldcoin/agentkit-cli register <agent-address> --network base
   ```
4. Call `resolve()` to claim payment

### Buyer flow
1. Browse active sellers, check their registration count
2. Accept a listing — your funds are locked in escrow
3. Wait for the seller to register your agent
4. Once registered, the seller claims payment. You can cancel anytime before registration.

## Contract

**HissEscrow** on Base: [`0x30230575991055532408db1c36b924347cc34520`](https://basescan.org/address/0x30230575991055532408db1c36b924347cc34520)

One listing per World ID (nullifier hash is the listing key). No protocol fee. No admin. No upgradability.

### Functions

| Function | Who | What |
|---|---|---|
| `createListing(nullifier, token, price)` | Seller | Post or update a listing |
| `deactivateListing(nullifier)` | Seller | Stop accepting new orders |
| `acceptListing(nullifier, agentAddress)` | Buyer | Lock funds for a specific seller |
| `cancelOrder(orderId)` | Buyer | Refund if agent not registered by correct seller |
| `resolve(orderId)` | Anyone | Verify registration and pay seller |

## Security & Griefing Analysis

### Seller griefing buyer

**Seller delists after buyer deposits** — Safe. Delisting only prevents new orders. Existing orders are unaffected. The buyer can still cancel, and the seller can still register + resolve.

**Seller changes price after buyer deposits** — Safe. The order locks the price at acceptance time. `order.amount` is what gets paid, not the listing's current price.

**Seller never registers the agent** — Safe. The buyer can call `cancelOrder()` at any time to get a full refund, as long as the agent hasn't been registered with the correct nullifier.

### Buyer griefing seller

**Buyer cancels after seller registers** — Safe. `cancelOrder()` checks that `lookupHuman(agentAddress) != order.nullifier`. If the seller registered the agent with their correct nullifier, cancel reverts with `AgentAlreadyRegistered`.

### Third-party griefing

**Someone registers the agent with a wrong nullifier** — Safe. This was a critical bug that was found and fixed. If a third party registers the agent with a different nullifier:
- `resolve()` reverts with `NullifierMismatch` (correct — wrong seller)
- `cancelOrder()` succeeds (the registered nullifier ≠ order nullifier, so the cancel check passes)
- Buyer gets their funds back. No funds stuck.

**Someone claims the same nullifier for a listing** — Safe. `createListing()` reverts with `AlreadyHasListing` if a different address tries to create a listing with the same nullifier.

**Buyer sends ETH with an ERC20 order** — Safe. `acceptListing()` reverts with `WrongPayment` if `msg.value != 0` for ERC20 listings.

## Project Structure

```
hiss/
├── contracts/          # Foundry — HissEscrow.sol
│   ├── src/
│   ├── test/           # 32 tests, 100% line coverage
│   └── script/
├── app/                # Next.js — frontend
│   └── src/
│       ├── components/ # Terminal-style UI
│       ├── hooks/      # wagmi + react-query
│       └── lib/        # contracts, utils, api
└── indexer/            # Ponder — event indexer
    ├── src/            # Event handlers + REST API
    └── abis/
```

## Running locally

```bash
# Indexer (port 42069)
cd indexer && npx ponder dev

# Frontend (port 3000)
cd app && npm run dev
```

## Dependencies

- [AgentBook](https://github.com/worldcoin/agentkit) — World ID agent registration contract on Base
- [Ponder](https://ponder.sh) — Event indexer
- [RainbowKit](https://www.rainbowkit.com) — Wallet connection
- [wagmi](https://wagmi.sh) + [viem](https://viem.sh) — Contract interaction
