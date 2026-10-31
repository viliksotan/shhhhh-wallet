// Fair Batch Mode: commitments, signed wallet identity, batch phases, quotas,
// circuit breakers, deterministic clearing and public audit records.
import { FairMarketCoordinator } from '../bridge/fair-market.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  FAIR_VERSION,
  clearFairBatch,
  fairCommitMessage,
  fairCommitment,
  fairEpoch,
  merkleRoot,
  median,
  normalizeFairOrder,
  priceDeviationBps,
  quotaForStake,
  verifyFairEnvelope,
} from '../src/fair-market.js';
import { signMsg } from '../src/sp.js';
import { stakeKey } from '../src/stake.js';

let pass = 0, fail = 0;
const ok = (condition, name) => { if (condition) pass++; else { fail++; console.log('FAIL', name); } };
const rejects = (fn, pattern, name) => {
  try { fn(); ok(false, name); } catch (error) { ok(pattern.test(error.message), name); }
};

const buyer = stakeKey(71n), seller = stakeKey(73n), extra = stakeKey(79n);
const saltA = '11'.repeat(32), saltB = '22'.repeat(32), saltC = '33'.repeat(32);
const epoch = 10;
const makeOrder = (key, side, amount, limitPrice) => normalizeFairOrder({
  epoch,
  market: 'shhhhh/btc',
  side,
  amount,
  limitPrice,
  walletKey: key.xonly,
});
const envelopeFor = (key, order, salt, aux = 1) => {
  const commitment = fairCommitment(order, salt);
  const unsigned = { v: FAIR_VERSION, epoch: order.epoch, market: order.market, walletKey: order.walletKey, commitment };
  return { ...unsigned, signature: signMsg(key.priv, fairCommitMessage(unsigned), new Uint8Array(32).fill(aux)) };
};

const buyOrder = makeOrder(buyer, 'buy', 100, 105);
const sellOrder = makeOrder(seller, 'sell', 100, 95);
const buyEnvelope = envelopeFor(buyer, buyOrder, saltA, 7);
const sellEnvelope = envelopeFor(seller, sellOrder, saltB, 8);

ok(fairCommitment(buyOrder, saltA) === fairCommitment({ ...buyOrder }, saltA), 'commitment is canonical and stable');
ok(fairCommitment(buyOrder, saltA) !== fairCommitment(buyOrder, saltB), 'random salt hides otherwise identical orders');
rejects(() => normalizeFairOrder({ ...buyOrder, v: 2 }), /unsupported fair order version/, 'unknown order versions are rejected');
ok(verifyFairEnvelope(buyEnvelope).walletKey === buyer.xonly, 'wallet BIP340 signature authenticates a commitment');
rejects(() => verifyFairEnvelope({ ...buyEnvelope, commitment: 'ff'.repeat(32) }), /signature is not valid/, 'signature covers the commitment');
ok(fairEpoch(10_100, { epochMs: 1000, commitMs: 400, revealMs: 400 }).phase === 'commit', 'epoch starts with a commit window');
ok(fairEpoch(10_500, { epochMs: 1000, commitMs: 400, revealMs: 400 }).phase === 'reveal', 'commit window is followed by reveal');
ok(fairEpoch(10_900, { epochMs: 1000, commitMs: 400, revealMs: 400 }).phase === 'settle', 'epoch ends with settlement');
ok(quotaForStake(4000, { baseQuota: 100, minStake: 1000, maxQuota: 1000 }) === 200, 'verified stake raises quota by square root');
ok(quotaForStake(0, { baseQuota: 100, minStake: 1000, maxQuota: 1000 }) === 100, 'unstaked wallet retains the base quota');
ok(priceDeviationBps(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER - 1) === 0, 'price deviation stays precise at safe-integer limits');
ok(median([Number.MAX_SAFE_INTEGER - 1, Number.MAX_SAFE_INTEGER]) === Number.MAX_SAFE_INTEGER - 1, 'median does not overflow at safe-integer limits');
ok(merkleRoot([buyEnvelope.commitment, sellEnvelope.commitment]) === merkleRoot([sellEnvelope.commitment, buyEnvelope.commitment]), 'commitment root is independent of arrival order');

const coordinator = new FairMarketCoordinator({
  epochMs: 1000,
  commitMs: 400,
  revealMs: 400,
  baseQuota: 100,
  minStake: 1000,
  maxQuota: 1000,
  maxDeviationBps: 1500,
  maxShareBps: 100,
  stakeLookup: () => 4000,
  supplyLookup: () => 100_000,
  randomBytes: () => new Uint8Array(32).fill(9),
});

ok(coordinator.commit(buyEnvelope, 10_100).accepted, 'coordinator accepts a signed hidden buy order');
ok(coordinator.commit(sellEnvelope, 10_200).accepted, 'coordinator accepts a signed hidden sell order');
ok(coordinator.commit(buyEnvelope, 10_250).duplicate, 'repeating the exact commitment is idempotent');
const extraOrder = makeOrder(buyer, 'buy', 90, 104);
rejects(() => coordinator.commit(envelopeFor(buyer, extraOrder, saltC, 9), 10_300), /already committed/, 'one wallet cannot replace its order after committing');
ok(!coordinator.audit(epoch, 'shhhhh/btc', 10_300).some((record) => record.seedReveal), 'server seed stays hidden before settlement');
rejects(() => coordinator.reveal({ order: buyOrder, salt: saltB }, 10_500), /does not match/, 'wrong reveal salt is rejected');
ok(coordinator.reveal({ order: buyOrder, salt: saltA }, 10_500).accepted, 'matching buy reveal is accepted');
ok(coordinator.reveal({ order: sellOrder, salt: saltB }, 10_600).accepted, 'matching sell reveal is accepted');
const result = coordinator.result(epoch, 'shhhhh/btc', 10_900);
ok(result.clearingPrice === 100 && result.volume === 100 && result.trades.length === 1, 'crossing orders clear at one uniform price');
ok(result.commitments === 2 && result.reveals === 2 && result.missedReveals === 0, 'settlement reports reveal participation');
ok(coordinator.audit(epoch, 'shhhhh/btc', 10_900).some((record) => record.seedReveal), 'seed is revealed for public audit after settlement');

const auditDir = fs.mkdtempSync(path.join(os.tmpdir(), 'shhhhh-fair-'));
const auditFile = path.join(auditDir, 'audit.jsonl');
try {
  const firstRun = new FairMarketCoordinator({ epochMs: 1000, commitMs: 400, revealMs: 400, auditFile, randomBytes: () => new Uint8Array(32).fill(5) });
  firstRun.commit(buyEnvelope, 10_100);
  const restarted = new FairMarketCoordinator({ epochMs: 1000, commitMs: 400, revealMs: 400, auditFile });
  ok(restarted.status('shhhhh/btc', 10_200).commitments === 1, 'audit replay restores active commitments after restart');
  restarted.reveal({ order: buyOrder, salt: saltA }, 10_500);
  ok(restarted.result(epoch, 'shhhhh/btc', 10_900).reveals === 1, 'audit replay continues through reveal and settlement');
  fs.appendFileSync(auditFile, '{"type":"tampered"}\n');
  rejects(() => new FairMarketCoordinator({ epochMs: 1000, commitMs: 400, revealMs: 400, auditFile }), /audit log hash mismatch/, 'tampered audit records are rejected on restart');
} finally {
  fs.rmSync(auditDir, { recursive: true, force: true });
}

const seed = 'ab'.repeat(32);
const reveals = [
  { order: buyOrder, commitment: buyEnvelope.commitment },
  { order: sellOrder, commitment: sellEnvelope.commitment },
];
const forward = clearFairBatch(reveals, { seed, baseQuota: 100, minStake: 1000, maxQuota: 1000, stakes: { [buyer.xonly]: 4000, [seller.xonly]: 4000 } });
const reverse = clearFairBatch([...reveals].reverse(), { seed, baseQuota: 100, minStake: 1000, maxQuota: 1000, stakes: { [buyer.xonly]: 4000, [seller.xonly]: 4000 } });
ok(JSON.stringify(forward.trades) === JSON.stringify(reverse.trades), 'clearing result does not depend on network arrival order');

const tooLarge = makeOrder(extra, 'buy', 201, 100);
const tooLargeCommitment = fairCommitment(tooLarge, saltC);
const guarded = clearFairBatch([{ order: tooLarge, commitment: tooLargeCommitment }], {
  seed,
  baseQuota: 100,
  minStake: 1000,
  maxQuota: 1000,
  stakes: { [extra.xonly]: 4000 },
});
ok(guarded.rejected[0].reason.includes('quota'), 'verified stake quota rejects oversized orders');
const outlier = clearFairBatch([{ order: makeOrder(extra, 'buy', 10, 130), commitment: fairCommitment(makeOrder(extra, 'buy', 10, 130), saltC) }], {
  seed,
  referencePrice: 100,
  maxDeviationBps: 1500,
});
ok(outlier.rejected[0].reason.includes('circuit-breaker'), 'reference-price circuit breaker rejects extreme orders');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
