// Live claim tracker. The backend reports each step of a claim; any screen subscribed
// to these tables (the owner's phone, a family member, a judge) updates instantly.
// Public tables hold no personal data: claim ids, the car's year/make/model, dollar amounts, step names.
import { schema, table, t } from 'spacetimedb/server';

const spacetimedb = schema({
  // Identities allowed to write (the Totaled backend). The first caller of claim_writer becomes the writer.
  writer: table({}, { identity: t.identity().primaryKey() }),
  claim: table(
    { public: true },
    {
      claim_id: t.string().primaryKey(),
      vehicle: t.string(),
      step: t.string(),
      offer_total: t.f64(),
      counteroffer_total: t.f64(),
      checks_failed: t.u32(),
      walk_away: t.f64(),
      deposit: t.f64(),
      updated_at: t.timestamp(),
    }
  ),
  claim_event: table(
    { public: true },
    {
      id: t.u64().primaryKey().autoInc(),
      claim_id: t.string(),
      kind: t.string(),
      detail: t.string(), // JSON
      at: t.timestamp(),
    }
  ),
});
export default spacetimedb;

export const claimWriter = spacetimedb.reducer(ctx => {
  if (ctx.db.writer.count() > 0) throw new Error('A writer is already registered');
  ctx.db.writer.insert({ identity: ctx.sender });
});

export const recordEvent = spacetimedb.reducer(
  {
    claim_id: t.string(),
    kind: t.string(),
    detail: t.string(),
    vehicle: t.string(),
    offer_total: t.f64(),
    counteroffer_total: t.f64(),
    checks_failed: t.u32(),
    walk_away: t.f64(),
    deposit: t.f64(),
  },
  (ctx, a) => {
    if (!ctx.db.writer.identity.find(ctx.sender)) throw new Error('Not authorized');
    ctx.db.claimEvent.insert({ id: 0n, claim_id: a.claim_id, kind: a.kind, detail: a.detail, at: ctx.timestamp });
    const row = {
      claim_id: a.claim_id,
      vehicle: a.vehicle,
      step: a.kind,
      offer_total: a.offer_total,
      counteroffer_total: a.counteroffer_total,
      checks_failed: a.checks_failed,
      walk_away: a.walk_away,
      deposit: a.deposit,
      updated_at: ctx.timestamp,
    };
    if (ctx.db.claim.claim_id.find(a.claim_id)) ctx.db.claim.claim_id.update(row);
    else ctx.db.claim.insert(row);
  }
);
