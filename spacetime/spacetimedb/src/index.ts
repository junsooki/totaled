// Live claim tracker. The backend reports each step of a claim; any screen subscribed
// to these tables (the owner's phone, a family member, a judge) updates instantly.
// Public tables hold no personal data: claim ids, the car's year/make/model, dollar amounts, step names.
import { schema, table, t, SenderError } from 'spacetimedb/server';

const spacetimedb = schema({
  // Identities allowed to write (the Totaled backend). The first caller of claim_writer becomes the writer.
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
});
export default spacetimedb;

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
    if (!ctx.db.writer.identity.find(ctx.sender)) throw new SenderError('Not authorized');
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
