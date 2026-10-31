// Signed, non-custodial inscription listings. The server stores offers but can
// neither move the inscription nor change the price: both are covered by the
// seller's SINGLE|ANYONECANPAY signature in src/market.js.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { verifyOffer, verifyCancellation } from '../src/market.js';
import { cleanMarketAsset } from '../src/market-asset.js';

const ZERO = '0'.repeat(64);
const fail = (message, status = 400) => { const error = new Error(message); error.status = status; throw error; };
const hash = (...parts) => createHash('sha256').update(parts.join('\0')).digest('hex');

export function cleanMarketOffer(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('offer must be an object');
  const offer = {
    v: value.v,
    inscriptionId: value.inscriptionId,
    txid: value.txid,
    vout: value.vout,
    value: value.value,
    xonly: value.xonly,
    price: value.price,
    payTo: value.payTo,
    nonce: value.nonce,
    sig: value.sig,
    auth: value.auth,
  };
  try { verifyOffer(offer); } catch (error) { fail('invalid offer: ' + error.message); }
  return offer;
}

export const marketListingId = (offer) => hash('shhhhh/market-listing/v1', JSON.stringify(cleanMarketOffer(offer)));

export class MarketStore {
  constructor({ file = '', maxActive = 50_000 } = {}) {
    this.file = file;
    this.maxActive = maxActive;
    this.active = new Map();
    this.outpoints = new Map();
    this.revokedIds = new Set();
    this.order = [];
    this.auditHead = ZERO;
    if (file) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.closeSync(fs.openSync(file, 'a', 0o600)); // fail at startup if the durable book is not writable
      this.#load();
    }
  }

  #insert(listing) {
    let low = 0, high = this.order.length;
    while (low < high) {
      const mid = (low + high) >>> 1, item = this.order[mid];
      const before = listing.createdAt > item.createdAt || (listing.createdAt === item.createdAt && listing.id < item.id);
      if (before) high = mid; else low = mid + 1;
    }
    this.order.splice(low, 0, listing);
  }

  #record(event, write = true) {
    const record = { ...event, prev: this.auditHead };
    record.hash = hash('shhhhh/market-book/v1', JSON.stringify(record));
    if (write && this.file) {
      const fd = fs.openSync(this.file, 'a', 0o600);
      try { fs.writeFileSync(fd, JSON.stringify(record) + '\n'); fs.fsyncSync(fd); }
      finally { fs.closeSync(fd); }
    }
    this.auditHead = record.hash;
    this.#apply(record);
    return record;
  }

  #apply(record) {
    if (record.type === 'list') {
      const listing = { id: record.id, offer: cleanMarketOffer(record.offer), asset: cleanMarketAsset(record.asset), createdAt: record.at };
      this.active.set(record.offer.inscriptionId, listing);
      this.outpoints.set(`${record.offer.txid}:${record.offer.vout}`, record.offer.inscriptionId);
      this.#insert(listing);
    }
    if (record.type === 'cancel' || record.type === 'expire') {
      const current = this.active.get(record.inscriptionId);
      if (current && current.id === record.id) {
        this.active.delete(record.inscriptionId);
        this.outpoints.delete(`${current.offer.txid}:${current.offer.vout}`);
        const index = this.order.findIndex((listing) => listing.id === current.id);
        if (index >= 0) this.order.splice(index, 1);
      }
      if (record.type === 'cancel') this.revokedIds.add(record.id);
    }
  }

  #load() {
    let bytes;
    try { bytes = fs.readFileSync(this.file); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    // append+fsync acknowledges only newline-terminated records. If power loss
    // left a torn tail, discard that unacknowledged fragment but never ignore
    // corruption in a complete record.
    if (bytes.length && bytes[bytes.length - 1] !== 10) {
      const lastNewline = bytes.lastIndexOf(10);
      const keep = lastNewline < 0 ? 0 : lastNewline + 1;
      fs.truncateSync(this.file, keep); bytes = bytes.subarray(0, keep);
    }
    const raw = bytes.toString('utf8');
    let previous = ZERO;
    for (const line of raw.split('\n').filter(Boolean)) {
      const record = JSON.parse(line);
      const expected = hash('shhhhh/market-book/v1', JSON.stringify({ ...record, hash: undefined }));
      // JSON.stringify drops the undefined hash above, reproducing the signed record.
      if (record.prev !== previous || record.hash !== expected) throw new Error('market book audit log hash mismatch');
      previous = record.hash;
      this.auditHead = previous;
      this.#apply(record);
    }
  }

  put(value, at = Date.now(), asset = null) {
    const offer = cleanMarketOffer(value);
    asset = cleanMarketAsset(asset);
    const id = marketListingId(offer);
    if (this.revokedIds.has(id)) fail('this signed listing was cancelled and cannot be published again', 409);
    const current = this.active.get(offer.inscriptionId);
    if (current) {
      if (current.id === id) return { accepted: true, duplicate: true, listing: current, auditHead: this.auditHead };
      fail('cancel the current listing before creating a new one', 409);
    }
    const outpoint = `${offer.txid}:${offer.vout}`;
    if (this.outpoints.has(outpoint)) fail('this output already has an active listing', 409);
    if (this.active.size >= this.maxActive) fail('market book is full', 503);
    this.#record({ type: 'list', id, offer, asset, at });
    return { accepted: true, listing: this.active.get(offer.inscriptionId), auditHead: this.auditHead };
  }

  cancel(value, at = Date.now()) {
    if (!value || typeof value !== 'object') fail('cancellation must be an object');
    const offer = cleanMarketOffer(value.offer);
    const id = marketListingId(offer);
    const current = this.active.get(offer.inscriptionId);
    if (!current || current.id !== id) fail('listing is not active', 404);
    try { verifyCancellation(offer, value.sig); } catch (error) { fail('invalid cancellation: ' + error.message); }
    this.#record({ type: 'cancel', id, inscriptionId: offer.inscriptionId, at });
    return { cancelled: true, id, auditHead: this.auditHead };
  }

  // Server-only cleanup after Bitcoin Core reports that the listed outpoint is
  // spent. This never changes chain state; it only removes a dead offer.
  expire(id, at = Date.now()) {
    const current = [...this.active.values()].find((listing) => listing.id === id);
    if (!current) return false;
    this.#record({ type: 'expire', id, inscriptionId: current.offer.inscriptionId, at });
    return true;
  }

  list({ cursor = 0, limit = 50 } = {}) {
    cursor = String(cursor || '0'); limit = Number(limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) fail('limit must be from 1 to 100');
    let candidates = this.order;
    if (cursor !== '0') {
      const match = cursor.match(/^(\d+):([0-9a-f]{64})$/);
      if (!match) fail('bad cursor');
      const at = Number(match[1]), id = match[2];
      candidates = candidates.filter((listing) => listing.createdAt < at || (listing.createdAt === at && listing.id > id));
    }
    const listings = candidates.slice(0, limit), last = listings[listings.length - 1];
    return { listings, nextCursor: listings.length < candidates.length ? `${last.createdAt}:${last.id}` : null, total: this.order.length, auditHead: this.auditHead };
  }
}
