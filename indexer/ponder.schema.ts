import { onchainTable } from "ponder";

export const listing = onchainTable("listing", (t) => ({
  id: t.text().primaryKey(), // nullifierHash as string
  seller: t.hex().notNull(),
  nullifierHash: t.text().notNull(),
  token: t.hex().notNull(),
  price: t.bigint().notNull(),
  active: t.boolean().notNull(),
  createdAt: t.bigint().notNull(),
}));

export const order = onchainTable("order", (t) => ({
  id: t.bigint().primaryKey(),
  nullifier: t.text().notNull(), // links to listing.id
  buyer: t.hex().notNull(),
  agentAddress: t.hex().notNull(),
  token: t.hex().notNull(),
  amount: t.bigint().notNull(),
  status: t.text().notNull(), // 'open' | 'fulfilled' | 'cancelled'
  createdAt: t.bigint().notNull(),
  resolvedAt: t.bigint(),
  txHash: t.hex().notNull(),
  resolveTxHash: t.hex(),
}));

export const registration = onchainTable("registration", (t) => ({
  id: t.text().primaryKey(),
  agent: t.hex().notNull(),
  humanId: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
}));
