import { ponder } from "ponder:registry";
import { listing, order, registration } from "ponder:schema";

// ===== HissEscrow events =====

ponder.on("HissEscrow:ListingCreated", async ({ event, context }) => {
  const nullId = event.args.nullifier.toString();
  await context.db
    .insert(listing)
    .values({
      id: nullId,
      seller: event.args.seller,
      nullifierHash: nullId,
      token: event.args.token,
      price: event.args.price,
      active: true,
      createdAt: event.block.number,
    })
    .onConflictDoUpdate({
      seller: event.args.seller,
      token: event.args.token,
      price: event.args.price,
      active: true,
    });
});

ponder.on("HissEscrow:ListingDeactivated", async ({ event, context }) => {
  const nullId = event.args.nullifier.toString();
  try {
    await context.db
      .update(listing, { id: nullId })
      .set({ active: false });
  } catch {
    // Listing may not exist if from old contract deployment
  }
});

ponder.on("HissEscrow:OrderCreated", async ({ event, context }) => {
  const nullId = event.args.nullifier.toString();

  // Look up the listing to get the token
  const parentListing = await context.db.find(listing, { id: nullId });
  const token = parentListing?.token ?? ("0x0000000000000000000000000000000000000000" as `0x${string}`);

  await context.db.insert(order).values({
    id: event.args.orderId,
    nullifier: nullId,
    buyer: event.args.buyer,
    agentAddress: event.args.agentAddress,
    token,
    amount: event.args.amount,
    status: "open",
    createdAt: event.block.number,
    txHash: event.transaction.hash,
  });
});

ponder.on("HissEscrow:OrderResolved", async ({ event, context }) => {
  await context.db
    .update(order, { id: event.args.orderId })
    .set({
      status: "fulfilled",
      resolvedAt: event.block.number,
      resolveTxHash: event.transaction.hash,
    });
});

ponder.on("HissEscrow:OrderCancelled", async ({ event, context }) => {
  await context.db
    .update(order, { id: event.args.orderId })
    .set({
      status: "cancelled",
      resolvedAt: event.block.number,
      resolveTxHash: event.transaction.hash,
    });
});

// ===== AgentBook events =====

ponder.on("AgentBook:AgentRegistered", async ({ event, context }) => {
  await context.db
    .insert(registration)
    .values({
      id: event.args.agent.toLowerCase(),
      agent: event.args.agent,
      humanId: event.args.humanId,
      blockNumber: event.block.number,
    })
    .onConflictDoUpdate({
      humanId: event.args.humanId,
      blockNumber: event.block.number,
    });
});
