import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as K from '../src/keys.js';
import { stakeKey } from '../src/stake.js';
import { createOffer, cancelOffer, verifyCancellation } from '../src/market.js';
import { MarketStore, cleanMarketOffer, marketListingId } from '../bridge/market-store.mjs';

let pass = 0, fail = 0;
const ok = (condition, name) => { if (condition) pass++; else { fail++; console.log('FAIL', name); } };
const rejects = (fn, pattern, name) => {
  try { fn(); ok(false, name); } catch (error) { ok(pattern.test(error.message), name); }
};
const txid = (n) => n.toString(16).padStart(64, '0');
const seller = (n) => {
  const key = stakeKey(BigInt(n));
  return { txid: txid(n), vout: 0, value: 546, xonly: key.xonly, priv: key.priv, inscriptions: [txid(n) + 'i0'], inscribed: true };
};
const payTo = K.bip86(700n).address;
const coin = seller(701);
const offer = createOffer({ coin, inscriptionId: coin.inscriptions[0], price: 20_000, payTo });
const cancellation = cancelOffer(offer, coin.priv);

ok(verifyCancellation(offer, cancellation), 'seller cancellation signature verifies');
rejects(() => verifyCancellation({ ...offer, inscriptionId: txid(702) + 'i0' }, cancellation), /signature|offer/, 'cancellation is bound to the exact offer');
rejects(() => verifyCancellation(offer, '00'.repeat(64)), /not valid/, 'forged cancellation is rejected');
ok(!('junk' in cleanMarketOffer({ ...offer, junk: 'ignored' })), 'market offer schema drops unknown fields');
ok(marketListingId(offer).length === 64, 'listing id is deterministic SHA-256');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shhhhh-market-'));
const file = path.join(dir, 'book.jsonl');
try {
  const book = new MarketStore({ file, maxActive: 3 });
  const listed = book.put(offer, 1000);
  ok(listed.accepted && listed.listing.id === marketListingId(offer), 'signed listing enters the book');
  ok(book.put(offer, 2000).duplicate, 'identical listing retry is idempotent');
  rejects(() => book.put({ ...offer, price: 21_000 }, 3000), /invalid offer|cancel the current/, 'changed or invalid offer cannot replace an active listing');
  rejects(() => book.cancel({ offer, sig: '00'.repeat(64) }, 4000), /invalid cancellation/, 'book rejects forged cancellation');
  ok(book.cancel({ offer, sig: cancellation }, 5000).cancelled, 'valid cancellation removes the listing');
  ok(book.list().total === 0, 'cancelled listing is absent');
  rejects(() => book.put(offer, 5500), /cancelled/, 'a cancelled signed offer cannot be replayed into the book');

  const second = createOffer({ coin, inscriptionId: coin.inscriptions[0], price: 30_000, payTo });
  book.put(second, 6000, { kind: 'brc20', tick: 'shhhhh', amount: '1000' });
  rejects(() => book.cancel({ offer: second, sig: cancellation }, 6500), /invalid cancellation/, 'old cancellation cannot remove a repriced listing');
  const restored = new MarketStore({ file });
  const page = restored.list({ limit: 1 });
  ok(page.total === 1 && page.listings[0].offer.price === 30_000, 'append-only market book survives restart');
  ok(page.listings[0].asset.tick === 'shhhhh' && page.listings[0].asset.tickerBytes === 6, 'verified BRC-20 metadata survives restart');
  ok(page.auditHead === book.auditHead, 'market audit head survives restart');
  fs.appendFileSync(file, '{"type":"list"');
  const recovered = new MarketStore({ file });
  ok(recovered.list().total === 1 && fs.readFileSync(file, 'utf8').endsWith('\n'), 'restart discards only an incomplete power-loss tail');
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
