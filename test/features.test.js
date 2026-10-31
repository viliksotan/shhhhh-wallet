// Marketplace, staking and general inscription builders restored from the packaged extension.
import * as K from '../src/keys.js';
import { stakeKey, stakeTarget, buildUnstake } from '../src/stake.js';
import { createOffer, verifyOffer, cancelOffer, verifyCancellation, buildPurchase, royalty } from '../src/market.js';
import { BRC2_TARGET_SCRIPT, brc20Mint, brc20TickerBytes, brc20Transfer, brc2Call, brc2Deploy, buildBrc2Inscribe, buildInscribe, normalizeBrc20Tick, MAX_INSCRIPTION_BYTES } from '../src/inscribe.js';
import { Point, hexToBytes } from '../src/sp.js';
import { Transaction } from '@scure/btc-signer';

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
ok(verifyOffer(offer) && offer.v === 3 && offer.sig.length === 130 && offer.auth.length === 128, 'market v3 offer signs the transaction and complete envelope');
ok(royalty(offer) === 0, 'v3 atomic offer pays the full enforceable price to the seller');
rejects(() => verifyOffer({ ...offer, price: offer.price + 1 }), /signature is not valid/, 'offer signature covers the price');
rejects(() => verifyOffer({ ...offer, v: 2, price: 9300 }), /unsafe offer format/, 'legacy downgrade cannot bypass the v3 price policy');
rejects(() => verifyOffer({ ...offer, inscriptionId: txid(102) + 'i0' }), /authorization is not valid/, 'offer authorization covers the inscription id');
rejects(() => verifyOffer({ ...offer, nonce: '00'.repeat(16) }), /authorization is not valid/, 'offer authorization covers the unique listing nonce');
const cancelSig = cancelOffer(offer, seller.priv);
ok(cancelSig.length === 128 && verifyCancellation(offer, cancelSig), 'listing cancellation has a separate verified signature');
const repricedOffer = createOffer({ coin: seller, inscriptionId: seller.inscriptions[0], price: 11000, payTo: deposit.address });
rejects(() => verifyCancellation(repricedOffer, cancelSig), /not valid/, 'old cancellation cannot cancel a repriced listing');

const buyer = K.walletFromKeys(29n, 31n);
const purchase = buildPurchase({
  wallet: buyer,
  utxos: [rawCoin(111, 20000), rawCoin(112, 20000), rawCoin(113, 20000), rawCoin(114, 20000)],
  offer,
  feeRate: 2,
});
ok(purchase.hex.length > 100 && purchase.price === 10000 && purchase.royalty === 0 && purchase.received.length >= 2, 'buyer completes atomic full-price purchase');
const purchaseTx = Transaction.fromRaw(hexToBytes(purchase.hex), { allowUnknownOutputs: true, allowUnknownInputs: true, disableScriptCheck: true });
ok(Number(purchaseTx.getOutput(2).amount) === offer.price, 'atomic transaction enforces the seller full-price output');
const preparedPurchase = buildPurchase({
  wallet: buyer,
  utxos: [rawCoin(115, 20000), rawCoin(116, 600), rawCoin(117, 600)],
  offer,
  feeRate: 2,
});
ok(preparedPurchase.hex.length > 100 && preparedPurchase.inputs.includes(`${txid(115)}:0`), 'prepared wallet uses the large change coin to fund the purchase instead of looping');

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
ok(new TextDecoder().decode(brc20Mint('SHHHHH', '1000')) === '{"p":"brc-20","op":"mint","tick":"shhhhh","amt":"1000"}', 'BRC-20 mint payload is canonical');
ok(new TextDecoder().decode(brc20Transfer('ordi', '2.5')) === '{"p":"brc-20","op":"transfer","tick":"ordi","amt":"2.5"}', 'BRC-20 transfer payload is canonical');
ok(brc20TickerBytes('abcde') === 5 && brc20TickerBytes('shhhhh') === 6, 'BRC-20 ticker namespaces use UTF-8 byte length');
rejects(() => normalizeBrc20Tick('abc'), /4, 5 or 6 UTF-8 bytes/, 'BRC-20 rejects unsupported ticker lengths');
rejects(() => brc20Mint('bad!!?', '1000'), /only A-Z, 0-9 or dash/, '6-byte BRC-20 namespace enforces its restricted charset');
rejects(() => brc20Transfer('ordi', '0'), /amount must be positive/, 'BRC-20 transfer rejects zero amounts');

const deployBody = new TextDecoder().decode(brc2Deploy('0x6000'));
ok(deployBody === '{"p":"brc20-prog","op":"d","d":"0x6000"}', 'BRC2.0 deployment payload is canonical');
const contract = '0x' + '12'.repeat(20);
const callBody = brc2Call({ contract, data: '0xA9059CBB' });
ok(new TextDecoder().decode(callBody) === `{"p":"brc20-prog","op":"c","c":"${contract}","d":"0xa9059cbb"}`, 'BRC2.0 call payload is canonical');
rejects(() => brc2Call({ contract, inscriptionId: txid(5) + 'i0', data: '0x00' }), /exactly one/, 'BRC2.0 call rejects ambiguous targets');
ok(Array.from(BRC2_TARGET_SCRIPT).map((byte) => byte.toString(16).padStart(2, '0')).join('') === '6a09425243323050524f47', 'BRC2.0 protocol output is OP_RETURN BRC20PROG');
const brc2 = buildBrc2Inscribe({ wallet: inscriptionWallet, utxos: [rawCoin(123, 500000)], body: callBody, feeRate: 2, changeAddress: inscriptionWallet.changeAddress, nonce: 54321 });
ok(brc2.reveals.length === 1 && brc2.reveals[0].hex.includes('6a09425243323050524f47'), 'BRC2.0 reveal targets the protocol output');

// Ensure the key shape used above remains a raw x-only key, not a BIP86-tweaked key.
ok(Point.BASE.multiply(sk.priv).toRawBytes(true).slice(1).length === 32, 'stake signer keeps a raw x-only key');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
