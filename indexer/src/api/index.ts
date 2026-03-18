import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "ponder:api";
import { listing, order, registration } from "ponder:schema";
import { eq, desc, sql } from "ponder";

const app = new Hono();

app.use("/*", cors());

// All listings with registration count per nullifier
app.get("/listings", async (c) => {
  const listings = await db.select().from(listing).orderBy(desc(listing.createdAt));

  const regCounts = await db
    .select({
      humanId: registration.humanId,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(registration)
    .groupBy(registration.humanId);

  const countMap: Record<string, number> = {};
  for (const r of regCounts) {
    countMap[r.humanId.toString()] = r.count;
  }

  const result = listings.map((l) => ({
    ...l,
    price: l.price.toString(),
    createdAt: l.createdAt.toString(),
    registrations: countMap[l.nullifierHash] || 0,
  }));

  return c.json(result);
});

// Orders for a listing (by nullifier)
app.get("/listings/:nullifier/orders", async (c) => {
  const nullifier = c.req.param("nullifier");
  const orders = await db
    .select()
    .from(order)
    .where(eq(order.nullifier, nullifier))
    .orderBy(desc(order.id));

  const result = orders.map((o) => ({
    ...o,
    id: o.id.toString(),
    amount: o.amount.toString(),
    createdAt: o.createdAt.toString(),
    resolvedAt: o.resolvedAt?.toString() || null,
  }));

  return c.json(result);
});

// All orders (filter by buyer or seller address)
app.get("/orders", async (c) => {
  const buyer = c.req.query("buyer");
  const seller = c.req.query("seller");

  let orders;
  if (buyer) {
    orders = await db
      .select()
      .from(order)
      .where(eq(order.buyer, buyer.toLowerCase() as `0x${string}`))
      .orderBy(desc(order.id));
  } else if (seller) {
    // Find listings by this seller, then get orders for those nullifiers
    const sellerListings = await db
      .select()
      .from(listing)
      .where(eq(listing.seller, seller.toLowerCase() as `0x${string}`));
    const nullifiers = sellerListings.map((l) => l.id);
    if (nullifiers.length > 0) {
      const allOrders = await db.select().from(order).orderBy(desc(order.id));
      orders = allOrders.filter((o) => nullifiers.includes(o.nullifier));
    } else {
      orders = [];
    }
  } else {
    orders = await db.select().from(order).orderBy(desc(order.id));
  }

  const result = orders.map((o) => ({
    ...o,
    id: o.id.toString(),
    amount: o.amount.toString(),
    createdAt: o.createdAt.toString(),
    resolvedAt: o.resolvedAt?.toString() || null,
  }));

  return c.json(result);
});

// Registration count for a nullifier
app.get("/registrations/:nullifier", async (c) => {
  const nullifier = c.req.param("nullifier");
  const regs = await db
    .select()
    .from(registration)
    .where(eq(registration.humanId, BigInt(nullifier)));

  return c.json({
    nullifier,
    count: regs.length,
    agents: regs.map((r) => r.agent),
  });
});

export default app;
