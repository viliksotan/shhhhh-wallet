// Fair Batch Mode primitives.
//
// Orders are hidden behind a salted commitment during the commit window, revealed
// in a later window, and cleared as one uniform-price batch. The protocol never
// attempts to identify "AI". It removes the advantage of arriving a few
// milliseconds earlier and applies the same deterministic rules to every wallet.
import { schnorr } from '@noble/curves/secp256k1';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes, concatBytes } from '@noble/curves/abstract/utils';

export const FAIR_VERSION = 1;
export const FAIR_DOMAIN = 'shhhhh/fair-market/v1';
export const FAIR_EPOCH_MS = 60_000;
export const FAIR_COMMIT_MS = 30_000;
export const FAIR_REVEAL_MS = 20_000;
export const FAIR_SALT_BYTES = 32;
export const FAIR_MAX_DEVIATION_BPS = 1500;
export const FAIR_MAX_SHARE_BPS = 100;
export const FAIR_BASE_QUOTA = 1000;
export const FAIR_MIN_STAKE = 1000;
export const FAIR_MAX_QUOTA = 1_000_000;

const enc = new TextEncoder();
const HEX64 = /^[0-9a-f]{64}$/;
const HEX128 = /^[0-9a-f]{128}$/;
const MARKET = /^[a-z0-9][a-z0-9._-]{0,15}\/[a-z0-9][a-z0-9._-]{0,15}$/;

const int = (value, name, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const n = typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value) ? Number(value) : value;
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${name} must be an integer from ${min} to ${max}`);
  return n;
};

export function normalizeFairMarket(value) {
  const market = String(value || '').toLowerCase();
  if (!MARKET.test(market)) throw new Error('market must look like token/quote');
  return market;
}

export function normalizeFairOrder(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('order must be an object');
  if (value.v != null && value.v !== FAIR_VERSION) throw new Error(`unsupported fair order version: ${value.v}`);
  const side = String(value.side || '').toLowerCase();
  if (side !== 'buy' && side !== 'sell') throw new Error('side must be buy or sell');
  const walletKey = String(value.walletKey || '').toLowerCase();
  if (!HEX64.test(walletKey)) throw new Error('walletKey must be a 32-byte x-only public key');
  return Object.freeze({
    v: FAIR_VERSION,
    epoch: int(value.epoch, 'epoch', 0, 100_000_000),
    market: normalizeFairMarket(value.market),
    side,
    amount: int(value.amount, 'amount', 1),
    limitPrice: int(value.limitPrice, 'limitPrice', 1),
    walletKey,
  });
}

export function canonicalFairOrder(value) {
  const o = normalizeFairOrder(value);
  // An array gives the commitment a fixed field order independent of object key order.
  return JSON.stringify([o.v, o.epoch, o.market, o.side, o.amount, o.limitPrice, o.walletKey]);
}

export const sha256Hex = (...parts) => bytesToHex(sha256(enc.encode(parts.map(String).join('\n'))));

export function fairCommitment(order, salt) {
  const cleanSalt = String(salt || '').toLowerCase();
  if (!new RegExp(`^[0-9a-f]{${FAIR_SALT_BYTES * 2}}$`).test(cleanSalt)) throw new Error(`salt must be ${FAIR_SALT_BYTES} random bytes`);
  return sha256Hex(FAIR_DOMAIN, canonicalFairOrder(order), cleanSalt);
}

export function normalizeFairEnvelope(value) {
  if (!value || typeof value !== 'object') throw new Error('commit envelope must be an object');
  if (value.v != null && value.v !== FAIR_VERSION) throw new Error(`unsupported fair envelope version: ${value.v}`);
  const market = normalizeFairMarket(value.market);
  const walletKey = String(value.walletKey || '').toLowerCase();
  const commitment = String(value.commitment || '').toLowerCase();
  const signature = String(value.signature || '').toLowerCase();
  if (!HEX64.test(walletKey)) throw new Error('walletKey must be a 32-byte x-only public key');
  if (!HEX64.test(commitment)) throw new Error('commitment must be 32 bytes');
  if (!HEX128.test(signature)) throw new Error('signature must be a 64-byte BIP340 signature');
  return Object.freeze({
    v: FAIR_VERSION,
    epoch: int(value.epoch, 'epoch', 0, 100_000_000),
    market,
    walletKey,
    commitment,
    signature,
  });
}

export function fairCommitMessage(value) {
  const envelope = {
    v: FAIR_VERSION,
    epoch: int(value.epoch, 'epoch', 0, 100_000_000),
    market: normalizeFairMarket(value.market),
    walletKey: String(value.walletKey || '').toLowerCase(),
    commitment: String(value.commitment || '').toLowerCase(),
  };
  if (!HEX64.test(envelope.walletKey) || !HEX64.test(envelope.commitment)) throw new Error('bad fair commit envelope');
  return sha256(enc.encode([FAIR_DOMAIN, 'commit', envelope.epoch, envelope.market, envelope.walletKey, envelope.commitment].join('\n')));
}

export function verifyFairEnvelope(value) {
  const envelope = normalizeFairEnvelope(value);
  if (!schnorr.verify(hexToBytes(envelope.signature), fairCommitMessage(envelope), hexToBytes(envelope.walletKey))) {
    throw new Error('fair commit signature is not valid');
  }
  return envelope;
}

export function fairEpoch(now = Date.now(), options = {}) {
  const epochMs = int(options.epochMs ?? FAIR_EPOCH_MS, 'epochMs', 1000, 86_400_000);
  const commitMs = int(options.commitMs ?? FAIR_COMMIT_MS, 'commitMs', 1, epochMs - 2);
  const revealMs = int(options.revealMs ?? FAIR_REVEAL_MS, 'revealMs', 1, epochMs - commitMs - 1);
  const at = int(Math.floor(now), 'now', 0);
  const epoch = Math.floor(at / epochMs);
  const start = epoch * epochMs;
  const offset = at - start;
  const phase = offset < commitMs ? 'commit' : offset < commitMs + revealMs ? 'reveal' : 'settle';
  return Object.freeze({
    epoch,
    phase,
    start,
    commitEnds: start + commitMs,
    revealEnds: start + commitMs + revealMs,
    ends: start + epochMs,
    epochMs,
    commitMs,
    revealMs,
  });
}

export function quotaForStake(stake, options = {}) {
  const baseQuota = int(options.baseQuota ?? FAIR_BASE_QUOTA, 'baseQuota', 1);
  const minStake = int(options.minStake ?? FAIR_MIN_STAKE, 'minStake', 1);
  const maxQuota = int(options.maxQuota ?? FAIR_MAX_QUOTA, 'maxQuota', baseQuota);
  const verifiedStake = int(stake || 0, 'stake', 0);
  // Unstaked wallets retain the base quota. Stake raises it sub-linearly so a
  // four-times larger lock gets two-times, not four-times, the capacity.
  const multiplier = verifiedStake >= minStake ? Math.sqrt(verifiedStake / minStake) : 1;
  return Math.min(maxQuota, Math.max(baseQuota, Math.floor(baseQuota * multiplier)));
}

export function priceDeviationBps(price, referencePrice) {
  const p = int(price, 'price', 1), ref = int(referencePrice, 'referencePrice', 1);
  // Use integer arithmetic so values near Number.MAX_SAFE_INTEGER do not lose
  // precision during the intermediate multiplication.
  return Number((BigInt(Math.abs(p - ref)) * 10_000n) / BigInt(ref));
}

export function median(values) {
  const clean = values.map((v) => int(v, 'median value', 1)).sort((a, b) => a - b);
  if (!clean.length) return null;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2 ? clean[middle] : clean[middle - 1] + Math.floor((clean[middle] - clean[middle - 1]) / 2);
}

export function merkleRoot(commitments) {
  if (!Array.isArray(commitments) || !commitments.length) return sha256Hex(FAIR_DOMAIN, 'empty');
  let level = commitments.map((value) => {
    const hex = String(value || '').toLowerCase();
    if (!HEX64.test(hex)) throw new Error('bad commitment in merkle tree');
    return hexToBytes(hex);
  }).sort((a, b) => bytesToHex(a).localeCompare(bytesToHex(b)));
  while (level.length > 1) {
    const next = [];
    for (let i = 0; i < level.length; i += 2) next.push(sha256(concatBytes(level[i], level[i + 1] || level[i])));
    level = next;
  }
  return bytesToHex(level[0]);
}

export const fairTieBreak = (seed, commitment) => {
  if (!HEX64.test(String(seed || '')) || !HEX64.test(String(commitment || ''))) throw new Error('bad fair batch seed or commitment');
  return sha256Hex(FAIR_DOMAIN, 'tie', seed, commitment);
};

function stakeFor(stakes, market, walletKey) {
  if (typeof stakes === 'function') return Number(stakes(market, walletKey) || 0);
  if (!stakes || typeof stakes !== 'object') return 0;
  return Number((stakes[market] && stakes[market][walletKey]) ?? stakes[walletKey] ?? 0);
}

// Deterministic uniform-price double auction. Invalid or over-quota orders are
// returned in `rejected`; a single bad order never invalidates the whole batch.
export function clearFairBatch(reveals, options = {}) {
  const seed = String(options.seed || '').toLowerCase();
  if (!HEX64.test(seed)) throw new Error('seed must be 32 bytes');
  const referencePrice = options.referencePrice == null ? null : int(options.referencePrice, 'referencePrice', 1);
  const maxDeviationBps = int(options.maxDeviationBps ?? FAIR_MAX_DEVIATION_BPS, 'maxDeviationBps', 0, 100_000);
  const maxShareBps = int(options.maxShareBps ?? FAIR_MAX_SHARE_BPS, 'maxShareBps', 1, 10_000);
  const supply = options.supply == null ? null : int(options.supply, 'supply', 1);
  const accepted = [], rejected = [], wallets = new Set();

  for (const reveal of reveals || []) {
    try {
      const order = normalizeFairOrder(reveal.order || reveal);
      const commitment = String(reveal.commitment || '').toLowerCase();
      if (!HEX64.test(commitment)) throw new Error('missing commitment');
      if (wallets.has(order.walletKey)) throw new Error('one order per wallet in each batch');
      const stake = stakeFor(options.stakes, order.market, order.walletKey);
      const quota = quotaForStake(stake, options);
      if (order.amount > quota) throw new Error(`amount exceeds verified quota of ${quota}`);
      if (supply != null && BigInt(order.amount) * 10_000n > BigInt(supply) * BigInt(maxShareBps)) throw new Error('amount exceeds the per-batch supply limit');
      if (referencePrice != null && priceDeviationBps(order.limitPrice, referencePrice) > maxDeviationBps) throw new Error('price is outside the circuit-breaker band');
      wallets.add(order.walletKey);
      accepted.push({ order, commitment, stake, quota, remaining: order.amount, tie: fairTieBreak(seed, commitment) });
    } catch (error) {
      rejected.push({ commitment: reveal && reveal.commitment || null, reason: error.message });
    }
  }

  const buys = accepted.filter((x) => x.order.side === 'buy').sort((a, b) => b.order.limitPrice - a.order.limitPrice || a.tie.localeCompare(b.tie));
  const sells = accepted.filter((x) => x.order.side === 'sell').sort((a, b) => a.order.limitPrice - b.order.limitPrice || a.tie.localeCompare(b.tie));
  const provisional = [];
  let bi = 0, si = 0, lastBid = null, lastAsk = null;
  while (bi < buys.length && si < sells.length) {
    const buy = buys[bi], sell = sells[si];
    if (buy.order.limitPrice < sell.order.limitPrice) break;
    const amount = Math.min(buy.remaining, sell.remaining);
    provisional.push({ buy: buy.commitment, sell: sell.commitment, amount });
    lastBid = buy.order.limitPrice; lastAsk = sell.order.limitPrice;
    buy.remaining -= amount; sell.remaining -= amount;
    if (!buy.remaining) bi++;
    if (!sell.remaining) si++;
  }
  const clearingPrice = provisional.length ? lastAsk + Math.floor((lastBid - lastAsk) / 2) : null;
  const trades = provisional.map((trade) => ({ ...trade, price: clearingPrice }));
  return Object.freeze({
    clearingPrice,
    volume: trades.reduce((sum, trade) => sum + trade.amount, 0),
    trades,
    accepted: accepted.map(({ order, commitment, stake, quota }) => ({ order, commitment, verifiedStake: stake, quota })),
    rejected,
  });
}
