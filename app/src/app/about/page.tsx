import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 text-sm text-zinc-400 leading-relaxed">
      <Link
        href="/"
        className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-wider py-2 inline-block"
      >
        &larr; BACK
      </Link>

      <div>
        <h1 className="text-xl font-bold text-white mb-2">How Hiss Works</h1>
        <p className="text-zinc-500">
          A trustless marketplace for World ID verification on Base.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">The Problem</h2>
        <p>
          <a href="https://github.com/worldcoin/agentkit" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">AgentBook</a> lets
          World ID holders register agent wallets as human-backed. Some people need agent
          registration but don&apos;t have a World ID. Others have a World ID but don&apos;t
          need it. Hiss connects them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">The Flow</h2>
        <div className="border border-[#1a1a1f] bg-[#0c0c0f] p-4 space-y-4 text-xs">
          <div className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">1.</span>
            <div>
              <span className="text-zinc-200 font-medium">Seller lists an offer.</span>{' '}
              A World ID holder posts a listing with their price (ETH or USDC).
              Their World ID nullifier hash is stored on-chain as the listing key.
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">2.</span>
            <div>
              <span className="text-zinc-200 font-medium">Buyer picks a seller.</span>{' '}
              The buyer browses listings, checks the seller&apos;s registration history,
              and accepts by locking funds in the escrow contract with their agent address.
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">3.</span>
            <div>
              <span className="text-zinc-200 font-medium">Seller registers the agent.</span>{' '}
              The seller runs the AgentBook CLI, scans a QR code with World App,
              and submits a World ID proof that registers the buyer&apos;s agent address.
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-emerald-400 font-bold shrink-0">4.</span>
            <div>
              <span className="text-zinc-200 font-medium">Seller claims payment.</span>{' '}
              The seller calls <code className="text-emerald-400/70">resolve()</code>. The contract
              verifies the agent is registered with the correct nullifier, then releases
              the escrowed funds to the seller.
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Trust Model</h2>
        <p>
          Neither party needs to trust the other. The escrow contract enforces every guarantee:
        </p>
        <ul className="space-y-2 text-xs">
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span><span className="text-zinc-200">Buyer can&apos;t lose funds.</span> Cancel anytime before the seller registers the agent with the correct nullifier.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span><span className="text-zinc-200">Seller can&apos;t steal.</span> Payment only releases after on-chain verification that the agent was registered by the correct World ID.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span><span className="text-zinc-200">No stuck funds.</span> If a third party griefs by registering the agent with a wrong nullifier, the buyer can still cancel and get a full refund.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400 shrink-0">-</span>
            <span><span className="text-zinc-200">Price is locked.</span> The seller can change their listing price, but existing orders keep the original amount.</span>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Registration Count</h2>
        <p>
          Each listing shows how many agents the seller&apos;s World ID has registered across
          all platforms — not just Hiss. This is indexed from{' '}
          <code className="text-emerald-400/70">AgentRegistered</code> events on the AgentBook
          contract. Buyers can use this to gauge whether a seller&apos;s World ID is
          &quot;fresh&quot; or heavily used.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Contract</h2>
        <p>
          <a
            href="https://basescan.org/address/0x229b238242b73b0cb1c5a493c183426bf68cc5be"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            HissEscrow
          </a>{' '}
          is deployed on Base mainnet and verified on Basescan. No admin, no protocol fee,
          no upgradability. Audited with Slither — no actionable findings. 32 tests with
          100% line coverage.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Source</h2>
        <p>
          Fully open source at{' '}
          <a
            href="https://github.com/lucadonnoh/hiss"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            github.com/lucadonnoh/hiss
          </a>.
        </p>
      </section>
    </div>
  );
}
