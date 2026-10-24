// Totaled's real-time core.
// - claim / claim_event: live tracker of each claim's progress.
// - agent_step: the AI agents (Reader, Appraiser, Negotiator, Shopper, Droid) posting their work as it happens.
// - auction / dealer / bid: a reverse auction where dealers compete live to sell the replacement car to a
//   verified, prequalified buyer. Bidding rules are enforced here, in the database, so no client can cheat.
// Public tables hold no personal data: claim ids, cars, dollar amounts, step names, dealer display names.
import { schema, table, t, SenderError, type InferSchema, type ReducerCtx } from 'spacetimedb/server';
import { Timestamp } from 'spacetimedb';

const ANTI_SNIPE_MICROS = 30_000_000n; // a bid in the last 30 s extends the auction by 30 s

const spacetimedb = schema({
  // Identities allowed to write claim data and run auctions (the Totaled backend).
  writer: table({ name: 'writer' }, { identity: t.identity().primaryKey() }),
  claim: table(
    { name: 'claim', public: true },
    {
      claimId: t.string().primaryKey(),
      vehicle: t.string(),
      step: t.string(),
      offerTotal: t.f64(),
      counterofferTotal: t.f64(),
      checksFailed: t.u32(),
      walkAway: t.f64(),
      deposit: t.f64(),
      updatedAt: t.timestamp(),
    }
  ),
  claimEvent: table(
    { name: 'claim_event', public: true },
    {
      id: t.u64().primaryKey().autoInc(),
      claimId: t.string().index('btree'),
      kind: t.string(),
      detail: t.string(), // JSON
      at: t.timestamp(),
    }
  ),
  agentStep: table(
    { name: 'agent_step', public: true },
    {
      id: t.u64().primaryKey().autoInc(),
      claimId: t.string().index('btree'),
      agent: t.string(), // Reader | Appraiser | Negotiator | Shopper | Droid
      status: t.string(), // working | done | error
      text: t.string(),
      at: t.timestamp(),
    }
  ),
  auction: table(
    { name: 'auction', public: true },
    {
      auctionId: t.string().primaryKey(), // the claim id
      wanted: t.string(), // e.g. "2019–2021 Honda Civic"
      budget: t.f64(), // verified: audited payout + prequalified financing
      buyerVerified: t.bool(),
      financingApproved: t.f64(),
      zip3: t.string(), // area only, never the full address
      status: t.string(), // open | awarded | closed
      endsAt: t.timestamp(),
      winningBidId: t.u64(),
      createdAt: t.timestamp(),
    }
  ),
  dealer: table(
    { name: 'dealer', public: true },
    {
      identity: t.identity().primaryKey(),
      name: t.string(),
      joinedAt: t.timestamp(),
    }
  ),
  bid: table(
    { name: 'bid', public: true },
    {
      id: t.u64().primaryKey().autoInc(),
      auctionId: t.string().index('btree'),
      dealer: t.identity(),
      dealerName: t.string(),
      car: t.string(),
      vin: t.string(),
      mileage: t.u32(),
      price: t.f64(),
      at: t.timestamp(),
    }
  ),
});
export default spacetimedb;

type Ctx = ReducerCtx<InferSchema<typeof spacetimedb>>;

function requireWriter(ctx: Ctx) {
  if (!ctx.db.writer.identity.find(ctx.sender)) throw new SenderError('Not authorized');
}

export const claimWriter = spacetimedb.reducer(ctx => {
  if (ctx.db.writer.count() > 0n) throw new SenderError('A writer is already registered');
  ctx.db.writer.insert({ identity: ctx.sender });
});

export const recordEvent = spacetimedb.reducer(
  {
    claimId: t.string(),
    kind: t.string(),
    detail: t.string(),
    vehicle: t.string(),
    offerTotal: t.f64(),
    counterofferTotal: t.f64(),
    checksFailed: t.u32(),
    walkAway: t.f64(),
    deposit: t.f64(),
  },
  (ctx, a) => {
    requireWriter(ctx);
    ctx.db.claimEvent.insert({ id: 0n, claimId: a.claimId, kind: a.kind, detail: a.detail, at: ctx.timestamp });
    const row = {
      claimId: a.claimId,
      vehicle: a.vehicle,
      step: a.kind,
      offerTotal: a.offerTotal,
      counterofferTotal: a.counterofferTotal,
      checksFailed: a.checksFailed,
      walkAway: a.walkAway,
      deposit: a.deposit,
      updatedAt: ctx.timestamp,
    };
    if (ctx.db.claim.claimId.find(a.claimId)) ctx.db.claim.claimId.update(row);
    else ctx.db.claim.insert(row);
  }
);

export const recordAgentStep = spacetimedb.reducer(
  { claimId: t.string(), agent: t.string(), status: t.string(), text: t.string() },
  (ctx, a) => {
    requireWriter(ctx);
    ctx.db.agentStep.insert({ id: 0n, claimId: a.claimId, agent: a.agent, status: a.status, text: a.text, at: ctx.timestamp });
  }
);

// --- Reverse auction -----------------------------------------------------------------------

export const openAuction = spacetimedb.reducer(
  {
    auctionId: t.string(),
    wanted: t.string(),
    budget: t.f64(),
    buyerVerified: t.bool(),
    financingApproved: t.f64(),
    zip3: t.string(),
    durationSecs: t.u32(),
  },
  (ctx, a) => {
    requireWriter(ctx);
    if (a.budget <= 0) throw new SenderError('Budget must be positive');
    if (!a.buyerVerified) throw new SenderError('Buyer must be verified before opening an auction');
    if (a.durationSecs < 60 || a.durationSecs > 1800) throw new SenderError('Auction duration must be between 60 and 1800 seconds');
    const existing = ctx.db.auction.auctionId.find(a.auctionId);
    if (existing) {
      if (existing.status === 'open') return; // A retry must not reset the clock or erase bids.
      throw new SenderError('An auction for this claim has already been awarded');
    }
    const row = {
      auctionId: a.auctionId,
      wanted: a.wanted,
      budget: a.budget,
      buyerVerified: a.buyerVerified,
      financingApproved: a.financingApproved,
      zip3: a.zip3,
      status: 'open',
      endsAt: new Timestamp(ctx.timestamp.microsSinceUnixEpoch + BigInt(a.durationSecs) * 1_000_000n),
      winningBidId: 0n,
      createdAt: ctx.timestamp,
    };
    ctx.db.auction.insert(row);
  }
);

export const joinAsDealer = spacetimedb.reducer({ name: t.string() }, (ctx, { name }) => {
  const clean = name.trim().slice(0, 40);
  if (!clean) throw new SenderError('Enter a dealership name');
  const existing = ctx.db.dealer.identity.find(ctx.sender);
  if (existing) ctx.db.dealer.identity.update({ ...existing, name: clean });
  else ctx.db.dealer.insert({ identity: ctx.sender, name: clean, joinedAt: ctx.timestamp });
});

export const placeBid = spacetimedb.reducer(
  { auctionId: t.string(), car: t.string(), vin: t.string(), mileage: t.u32(), price: t.f64() },
  (ctx, a) => {
    const dealer = ctx.db.dealer.identity.find(ctx.sender);
    if (!dealer) throw new SenderError('Join as a dealer first');
    const auction = ctx.db.auction.auctionId.find(a.auctionId);
    if (!auction || auction.status !== 'open') throw new SenderError('This auction is not open');
    const now = ctx.timestamp.microsSinceUnixEpoch;
    if (now >= auction.endsAt.microsSinceUnixEpoch) throw new SenderError('This auction has ended');
    if (!a.car.trim()) throw new SenderError('Describe the car');
    if (!(a.price > 0)) throw new SenderError('Enter a price');
    if (a.price > auction.budget) throw new SenderError(`Over the buyer's verified budget of $${Math.round(auction.budget)}`);
    // A dealer can only improve (lower) their own offer.
    for (const b of ctx.db.bid.auctionId.filter(a.auctionId)) {
      if (b.dealer.equals(ctx.sender) && a.price >= b.price) {
        throw new SenderError(`Your new offer must be below your last one ($${Math.round(b.price)})`);
      }
    }
    ctx.db.bid.insert({
      id: 0n,
      auctionId: a.auctionId,
      dealer: ctx.sender,
      dealerName: dealer.name,
      car: a.car.trim().slice(0, 80),
      // VIN is not needed to compare offers and must not be stored in this public table.
      vin: '',
      mileage: a.mileage,
      price: a.price,
      at: ctx.timestamp,
    });
    if (auction.endsAt.microsSinceUnixEpoch - now < ANTI_SNIPE_MICROS) {
      ctx.db.auction.auctionId.update({ ...auction, endsAt: new Timestamp(now + ANTI_SNIPE_MICROS) });
    }
  }
);

export const awardBid = spacetimedb.reducer({ auctionId: t.string(), bidId: t.u64() }, (ctx, a) => {
  requireWriter(ctx);
  const auction = ctx.db.auction.auctionId.find(a.auctionId);
  if (!auction) throw new SenderError('No such auction');
  const bid = ctx.db.bid.id.find(a.bidId);
  if (!bid || bid.auctionId !== a.auctionId) throw new SenderError('No such bid in this auction');
  if (auction.status === 'awarded') {
    if (auction.winningBidId === a.bidId) return; // Safe retry after a lost response.
    throw new SenderError('This auction already has a winning bid');
  }
  if (auction.status !== 'open') throw new SenderError('This auction is not open');
  if (bid.price > auction.budget) throw new SenderError('The bid is over the buyer budget');
  ctx.db.auction.auctionId.update({ ...auction, status: 'awarded', winningBidId: a.bidId });
});
