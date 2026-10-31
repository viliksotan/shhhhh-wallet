// Stateful coordinator for Fair Batch Mode.
//
// The coordinator sees only signed commitments during the commit window. It
// accepts reveals later, clears the batch deterministically, and writes an
// append-only hash-chained audit log when `auditFile` is configured.
import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  FAIR_BASE_QUOTA,
  FAIR_COMMIT_MS,
  FAIR_EPOCH_MS,
  FAIR_MAX_DEVIATION_BPS,
  FAIR_MAX_QUOTA,
  FAIR_MAX_SHARE_BPS,
  FAIR_MIN_STAKE,
  FAIR_REVEAL_MS,
  clearFairBatch,
  fairCommitment,
  fairEpoch,
  median,
  merkleRoot,
  normalizeFairMarket,
  normalizeFairOrder,
  sha256Hex,
  verifyFairEnvelope,
} from '../src/fair-market.js';

const fail = (message, status = 400) => { const error = new Error(message); error.status = status; throw error; };
const stateKey = (epoch, market) => `${epoch}:${market}`;

export class FairMarketCoordinator {
  constructor(options = {}) {
    this.options = {
      epochMs: options.epochMs ?? FAIR_EPOCH_MS,
      commitMs: options.commitMs ?? FAIR_COMMIT_MS,
      revealMs: options.revealMs ?? FAIR_REVEAL_MS,
      baseQuota: options.baseQuota ?? FAIR_BASE_QUOTA,
      minStake: options.minStake ?? FAIR_MIN_STAKE,
      maxQuota: options.maxQuota ?? FAIR_MAX_QUOTA,
      maxDeviationBps: options.maxDeviationBps ?? FAIR_MAX_DEVIATION_BPS,
      maxShareBps: options.maxShareBps ?? FAIR_MAX_SHARE_BPS,
    };
    // Called only at settlement. It must return independently verified locked
    // token units; client-provided stake values are deliberately ignored.
    this.stakeLookup = options.stakeLookup || (() => 0);
    this.supplyLookup = options.supplyLookup || (() => null);
    this.randomBytes = options.randomBytes || randomBytes;
    this.auditFile = options.auditFile || '';
    this.states = new Map();
    this.history = new Map();
    this.records = [];
    this.auditHead = '0'.repeat(64);
    if (this.auditFile) this.#loadAudit();
  }

  #phase(now) { return fairEpoch(now, this.options); }

  #newState(epoch, market, at, write = true, seed = null) {
    const key = stateKey(epoch, market);
    if (this.states.has(key)) return this.states.get(key);
    const seedReveal = seed || Buffer.from(this.randomBytes(32)).toString('hex');
    const state = {
      epoch,
      market,
      seedReveal,
      seedCommit: sha256Hex('shhhhh/fair-market/seed', epoch, market, seedReveal),
      commits: new Map(),
      reveals: new Map(),
      result: null,
    };
    this.states.set(key, state);
    if (write) this.#append({ type: 'epoch', epoch, market, seedReveal, seedCommit: state.seedCommit, at });
    return state;
  }

  #state(epoch, market, at, create = false) {
    const cleanMarket = normalizeFairMarket(market);
    return this.states.get(stateKey(epoch, cleanMarket)) || (create ? this.#newState(epoch, cleanMarket, at) : null);
  }

  #append(event) {
    const publicEvent = { ...event };
    const hash = sha256Hex('shhhhh/fair-market/audit', this.auditHead, JSON.stringify(publicEvent));
    const record = { ...publicEvent, prev: this.auditHead, hash };
    this.auditHead = hash;
    this.records.push(record);
    if (this.auditFile) {
      fs.mkdirSync(path.dirname(this.auditFile), { recursive: true });
      fs.appendFileSync(this.auditFile, JSON.stringify(record) + '\n', { mode: 0o600 });
    }
    return record;
  }

  #apply(record) {
    if (record.type === 'epoch') this.#newState(record.epoch, record.market, record.at, false, record.seedReveal);
    if (record.type === 'commit') {
      const envelope = verifyFairEnvelope(record.envelope);
      const state = this.#newState(envelope.epoch, envelope.market, record.at, false, record.seedReveal);
      state.commits.set(envelope.walletKey, { envelope, at: record.at });
    }
    if (record.type === 'reveal') {
      const order = normalizeFairOrder(record.order);
      const state = this.#newState(order.epoch, order.market, record.at, false, record.seedReveal);
      state.reveals.set(order.walletKey, { order, salt: record.salt, commitment: record.commitment, at: record.at });
    }
    if (record.type === 'settle') {
      const state = this.#newState(record.epoch, record.market, record.at, false, record.result.seedReveal);
      state.result = { ...record.result, auditHead: record.hash };
      if (record.result.clearingPrice) {
        const prices = this.history.get(record.market) || [];
        prices.push(record.result.clearingPrice); this.history.set(record.market, prices.slice(-30));
      }
    }
  }

  #loadAudit() {
    let text; try { text = fs.readFileSync(this.auditFile, 'utf8'); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    let previous = '0'.repeat(64);
    for (const line of text.split('\n').filter(Boolean)) {
      const record = JSON.parse(line);
      const { prev, hash, ...event } = record;
      const expected = sha256Hex('shhhhh/fair-market/audit', previous, JSON.stringify(event));
      if (prev !== previous || hash !== expected) throw new Error('fair market audit log hash mismatch');
      previous = hash; this.records.push(record); this.#apply(record);
    }
    this.auditHead = previous;
  }

  status(market, now = Date.now()) {
    const phase = this.#phase(now);
    const state = this.#state(phase.epoch, market, now, true);
    return {
      ...phase,
      market: state.market,
      seedCommit: state.seedCommit,
      commitments: state.commits.size,
      reveals: state.reveals.size,
      commitmentRoot: merkleRoot([...state.commits.values()].map((item) => item.envelope.commitment)),
      policy: {
        oneOrderPerWallet: true,
        baseQuota: this.options.baseQuota,
        minStake: this.options.minStake,
        maxQuota: this.options.maxQuota,
        maxDeviationBps: this.options.maxDeviationBps,
        maxShareBps: this.options.maxShareBps,
      },
      auditHead: this.auditHead,
    };
  }

  commit(value, now = Date.now()) {
    const phase = this.#phase(now);
    if (phase.phase !== 'commit') fail('the commit window is closed', 409);
    const envelope = verifyFairEnvelope(value);
    if (envelope.epoch !== phase.epoch) fail('commitment is for a different epoch', 409);
    const state = this.#state(envelope.epoch, envelope.market, now, true);
    const existing = state.commits.get(envelope.walletKey);
    if (existing) {
      if (existing.envelope.commitment === envelope.commitment && existing.envelope.signature === envelope.signature) {
        return { accepted: true, duplicate: true, epoch: envelope.epoch, commitment: envelope.commitment, seedCommit: state.seedCommit };
      }
      fail('this wallet already committed an order in the epoch', 409);
    }
    state.commits.set(envelope.walletKey, { envelope, at: now });
    this.#append({ type: 'commit', envelope, at: now });
    return { accepted: true, epoch: envelope.epoch, commitment: envelope.commitment, seedCommit: state.seedCommit, auditHead: this.auditHead };
  }

  reveal(value, now = Date.now()) {
    const phase = this.#phase(now);
    if (phase.phase !== 'reveal') fail('the reveal window is not open', 409);
    if (!value || typeof value !== 'object') fail('reveal must be an object');
    const order = normalizeFairOrder(value.order);
    if (order.epoch !== phase.epoch) fail('reveal is for a different epoch', 409);
    const state = this.#state(order.epoch, order.market, now, false);
    if (!state) fail('no commitments exist for this market and epoch', 404);
    const committed = state.commits.get(order.walletKey);
    if (!committed) fail('this wallet did not commit an order', 404);
    const commitment = fairCommitment(order, value.salt);
    if (commitment !== committed.envelope.commitment) fail('reveal does not match the signed commitment', 409);
    if (state.reveals.has(order.walletKey)) return { accepted: true, duplicate: true, epoch: order.epoch, commitment };
    const reveal = { order, salt: String(value.salt).toLowerCase(), commitment, at: now };
    state.reveals.set(order.walletKey, reveal);
    this.#append({ type: 'reveal', order, salt: reveal.salt, commitment, at: now });
    return { accepted: true, epoch: order.epoch, commitment, auditHead: this.auditHead };
  }

  result(epoch, market, now = Date.now()) {
    const cleanEpoch = Number(epoch), cleanMarket = normalizeFairMarket(market);
    if (!Number.isSafeInteger(cleanEpoch) || cleanEpoch < 0) fail('bad epoch');
    const phase = this.#phase(now);
    if (cleanEpoch > phase.epoch || (cleanEpoch === phase.epoch && phase.phase !== 'settle')) fail('batch is not ready to settle', 409);
    const state = this.#state(cleanEpoch, cleanMarket, now, false);
    if (!state) fail('batch not found', 404);
    if (state.result) return state.result;
    const commitmentRoot = merkleRoot([...state.commits.values()].map((item) => item.envelope.commitment));
    const seed = sha256Hex('shhhhh/fair-market/clear', state.seedReveal, commitmentRoot);
    const prices = this.history.get(cleanMarket) || [];
    const referencePrice = prices.length >= 3 ? median(prices) : null;
    const supply = this.supplyLookup(cleanMarket);
    const cleared = clearFairBatch([...state.reveals.values()], {
      ...this.options,
      seed,
      referencePrice,
      supply: supply == null ? null : Number(supply),
      stakes: (m, walletKey) => Number(this.stakeLookup(m, walletKey) || 0),
    });
    const result = {
      epoch: cleanEpoch,
      market: cleanMarket,
      commitmentRoot,
      seedCommit: state.seedCommit,
      seedReveal: state.seedReveal,
      seed,
      referencePrice,
      supply: supply == null ? null : Number(supply),
      commitments: state.commits.size,
      reveals: state.reveals.size,
      missedReveals: state.commits.size - state.reveals.size,
      ...cleared,
      settledAt: now,
    };
    state.result = result;
    if (result.clearingPrice) {
      prices.push(result.clearingPrice); this.history.set(cleanMarket, prices.slice(-30));
    }
    this.#append({ type: 'settle', epoch: cleanEpoch, market: cleanMarket, result, at: now });
    result.auditHead = this.auditHead;
    return result;
  }

  audit(epoch, market, now = Date.now()) {
    const cleanEpoch = Number(epoch), cleanMarket = normalizeFairMarket(market);
    const state = this.#state(cleanEpoch, cleanMarket, now, false);
    if (!state) fail('batch not found', 404);
    const settled = !!state.result;
    return this.records.filter((record) => {
      if (record.type === 'commit') return record.envelope.epoch === cleanEpoch && record.envelope.market === cleanMarket;
      if (record.type === 'reveal') return record.order.epoch === cleanEpoch && record.order.market === cleanMarket;
      return record.epoch === cleanEpoch && record.market === cleanMarket;
    }).map((record) => {
      if (record.type !== 'epoch' || settled) return record;
      const { seedReveal, ...publicRecord } = record;
      return publicRecord;
    });
  }
}
