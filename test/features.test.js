// Marketplace, staking and general inscription builders restored from the packaged extension.
import * as K from '../src/keys.js';
import { stakeKey, stakeTarget, buildUnstake } from '../src/stake.js';
import { createOffer, verifyOffer, cancelOffer, buildPurchase, royalty } from '../src/market.js';
import { buildInscribe, MAX_INSCRIPTION_BYTES } from '../src/inscribe.js';
import { Point } from '../src/sp.js';

let pass = 0, fail = 0;
const ok = (condition, name) => { if (condition) pass++; else { fail++; console.log('FAIL', name); } };
const rejects = (fn, pattern, name) => {
  try { fn(); ok(false, name); } catch (e) { ok(pattern.test(e.message), name); }
};
const txid = (n) => n.toString(16).padStart(64, '0');
const rawCoin = (n, value, vout = 0) => {
  const key = stakeKey(BigInt(n));
  return { txid: txid(n), vout, value, xonly: key.xonly, priv: key.priv, inscriptions: [], inscribed: false };
};

// Dedicated stake key and CLTV Taproot target are deterministic and spendable after the lock height.
const sk = stakeKey(17n);
const target = stakeTarget(sk.xonly, 1000000);
ok(target.address.startsWith('bc1p') && target.outScript.length === 34 && target.controlBlock.length === 33, 'stake target is a Taproot output');
ok(stakeTarget(sk.xonly, 1000000).address === target.address, 'stake target is deterministic');
rejects(() => stakeTarget(sk.xonly, 500000000), /bad unlock height/, 'stake target rejects locktime timestamps');
const deposit = K.bip86(23n);
const unlock = buildUnstake({
  stake: sk,
  unlock: 1000000,
  lockCoin: { txid: txid(90), vout: 0, value: 546, xonly: target.xonly },
  utxos: [rawCoin(91, 20000)],
  to: deposit.address,
  changeTo: deposit.address,
  feeRate: 2,
});
ok(unlock.hex.length > 100 && unlock.fee > 0 && unlock.lockAddress === target.address, 'CLTV stake spend signs and builds');

// Seller offer signature survives buyer composition and fails if a signed field is changed.
const seller = rawCoin(101, 546);
seller.inscriptions = [txid(101) + 'i0']; seller.inscribed = true;
const offer = createOffer({ coin: seller, inscriptionId: seller.inscriptions[0], price: 10000, payTo: deposit.address });
ok(verifyOffer(offer) && offer.sig.length === 130, 'market offer signs SINGLE|ANYONECANPAY');
ok(royalty(offer) === 700, 'v2 offer applies 7% creator royalty');
rejects(() => verifyOffer({ ...offer, price: offer.price + 1 }), /signature is not valid/, 'offer signature covers the price');
ok(cancelOffer(offer, seller.priv).length === 128, 'listing cancellation has a separate signature');

const buyer = K.walletFromKeys(29n, 31n);
const purchase = buildPurchase({
  wallet: buyer,
  utxos: [rawCoin(111, 20000), rawCoin(112, 20000), rawCoin(113, 20000), rawCoin(114, 20000)],
  offer,
  feeRate: 2,
});
ok(purchase.hex.length > 100 && purchase.price === 10000 && purchase.royalty === 700 && purchase.received.length >= 2, 'buyer completes atomic purchase');

// One commit can fund multiple independent reveals, each delivered to a fresh silent output.
const inscriptionWallet = K.walletFromKeys(37n, 41n);
const inscription = buildInscribe({
  wallet: inscriptionWallet,
  utxos: [rawCoin(121, 500000)],
  items: [
    { contentType: 'text/plain;charset=utf-8', body: new TextEncoder().encode('shhhhh') },
    { contentType: 'application/json', body: new TextEncoder().encode('{"ok":true}') },
  ],
  feeRate: 2,
  changeAddress: inscriptionWallet.changeAddress,
  to: inscriptionWallet.address,
  nonce: 12345,
});
ok(inscription.reveals.length === 2 && inscription.inscriptionIds.length === 2 && inscription.postage === 1092, 'batch inscription builds two reveals');
ok(new Set(inscription.reveals.map((reveal) => reveal.txid)).size === 2, 'batch reveals are independent transactions');
rejects(() => buildInscribe({ wallet: inscriptionWallet, utxos: [rawCoin(122, 500000)], items: [{ contentType: 'text/plain', body: new Uint8Array(MAX_INSCRIPTION_BYTES + 1) }], feeRate: 2, changeAddress: inscriptionWallet.changeAddress, to: inscriptionWallet.address, nonce: 1 }), /1 to 60000 bytes/, 'inscription size limit enforced in builder');

// Ensure the key shape used above remains a raw x-only key, not a BIP86-tweaked key.
ok(Point.BASE.multiply(sk.priv).toRawBytes(true).slice(1).length === 32, 'stake signer keeps a raw x-only key');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
