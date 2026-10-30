// Atomic inscription marketplace offers. The seller signs only input/output #2 with
// SIGHASH_SINGLE|ANYONECANPAY; a buyer can then add funding inputs and outputs without custody.
import { Transaction, OutScript, Address, SigHash, NETWORK } from '@scure/btc-signer';
import { schnorr } from '@noble/curves/secp256k1';
import { bytesToHex, hexToBytes, concatBytes } from '@noble/curves/abstract/utils';
import { decodeAddress, Point, N, tagged } from './sp.js';
import { vsizeOf, DUST } from './send.js';

export const OFFER_SIGHASH = SigHash.SINGLE_ANYONECANPAY;
export const SELLER_INPUT_INDEX = 2;
export const MIN_PRICE = 10000;
export const MAX_PRICE = 2100000000000000;
export const ROYALTY_BPS = 700;
export const PREPARE_COIN_VALUE = 600;
export const ROYALTY_SCRIPT = '51200b84faab41a56f2195f84706fa65b7605b28ab67c69d9b340a912ebbbcbb9c82';

const LEGACY_MIN_PRICE = 1000;
const SEQUENCE = 0xfffffffd;
const PLACEHOLDER_SCRIPT = hexToBytes('512079be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798');
const TX_OPTIONS = { allowUnknownOutputs: true, version: 2, lockTime: 0 };
const enc = new TextEncoder();
const mod = (n) => ((n % N) + N) % N;
const toInt = (b) => BigInt('0x' + bytesToHex(b));
const liftX = (x) => Point.fromHex('02' + x);
const xonly = (point) => bytesToHex(point.toRawBytes(true).slice(1));
const u32be = (n) => new Uint8Array([n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]);
const outpoint = (txid, vout) => concatBytes(hexToBytes(txid).reverse(), new Uint8Array([vout & 255, (vout >>> 8) & 255, (vout >>> 16) & 255, (vout >>> 24) & 255]));
const compare = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

export const royalty = (offer) => offer.v === 2 ? Math.floor(offer.price * ROYALTY_BPS / 10000) : 0;
export const sellerProceeds = (offer) => offer.price - royalty(offer);

function payScript(address, network = NETWORK) {
  const decoded = Address(network).decode(address);
  if (decoded.type !== 'tr') throw new Error('the seller must be paid to a bc1p address');
  return OutScript.encode(decoded);
}

function offerDigest(offer, network = NETWORK) {
  const tx = new Transaction(TX_OPTIONS);
  const placeholder = { txid: '00'.repeat(32), index: 0, sequence: SEQUENCE };
  tx.addInput(placeholder);
  tx.addInput({ ...placeholder, index: 1 });
  tx.addInput({ txid: offer.txid, index: offer.vout, sequence: SEQUENCE });
  tx.addOutput({ script: PLACEHOLDER_SCRIPT, amount: 0n });
  tx.addOutput({ script: PLACEHOLDER_SCRIPT, amount: 0n });
  tx.addOutput({ script: payScript(offer.payTo, network), amount: BigInt(sellerProceeds(offer)) });
  const scripts = [0, 1, 2].map(() => hexToBytes('5120' + offer.xonly));
  return tx.preimageWitnessV1(SELLER_INPUT_INDEX, scripts, OFFER_SIGHASH, [0n, 0n, BigInt(offer.value)]);
}

export function createOffer({ coin, inscriptionId, price, payTo, network = NETWORK }) {
  if (!Number.isInteger(price) || price < MIN_PRICE || price > MAX_PRICE) throw new Error(`price must be at least ${MIN_PRICE} sats`);
  const offer = { v: 2, inscriptionId, txid: coin.txid, vout: coin.vout, value: coin.value, xonly: coin.xonly, price, payTo };
  const digest = offerDigest(offer, network);
  const sig = schnorr.sign(digest, coin.priv);
  if (!schnorr.verify(sig, digest, hexToBytes(coin.xonly))) throw new Error('offer signature check failed');
  return { ...offer, sig: bytesToHex(concatBytes(sig, new Uint8Array([OFFER_SIGHASH]))) };
}

export function verifyOffer(offer, network = NETWORK) {
  if (!offer || (offer.v !== 1 && offer.v !== 2)) throw new Error('unknown offer format');
  if (!/^[0-9a-f]{64}$/.test(offer.txid) || !Number.isInteger(offer.vout) || offer.vout < 0 || offer.vout > 100000) throw new Error('bad outpoint');
  if (!/^[0-9a-f]{64}i\d{1,7}$/.test(offer.inscriptionId || '')) throw new Error('bad inscription id');
  if (!Number.isInteger(offer.value) || offer.value < 330 || offer.value > 1000000) throw new Error('bad coin value');
  if (!Number.isInteger(offer.price) || offer.price < (offer.v === 2 ? MIN_PRICE : LEGACY_MIN_PRICE) || offer.price > MAX_PRICE) throw new Error('bad price');
  if (!/^[0-9a-f]{64}$/.test(offer.xonly || '') || !/^[0-9a-f]{130}$/.test(offer.sig || '')) throw new Error('bad key or signature');
  const sig = hexToBytes(offer.sig);
  if (sig[64] !== OFFER_SIGHASH) throw new Error('offer must be signed SINGLE|ANYONECANPAY');
  if (!schnorr.verify(sig.slice(0, 64), offerDigest(offer, network), hexToBytes(offer.xonly))) throw new Error('offer signature is not valid');
  return true;
}

const cancelDigest = (offer) => tagged('shhhhh/market-cancel', outpoint(offer.txid, offer.vout), enc.encode(offer.inscriptionId));
export const cancelOffer = (offer, priv) => bytesToHex(schnorr.sign(cancelDigest(offer), priv));

// Derive BIP352 outputs to our own silent addresses when one input belongs to the seller.
export function buyerOutputs(wallet, inputs, recipients) {
  let aggregate = null;
  for (const input of inputs) {
    const point = liftX(input.xonly);
    aggregate = aggregate ? aggregate.add(point) : point;
  }
  if (!aggregate || aggregate.equals(Point.ZERO)) throw new Error('input keys sum to zero');
  let smallest = null;
  for (const input of inputs) {
    const bytes = outpoint(input.txid, input.vout);
    if (!smallest || compare(bytes, smallest) < 0) smallest = bytes;
  }
  const inputHash = mod(toInt(tagged('BIP0352/Inputs', smallest, aggregate.toRawBytes(true))));
  const ecdh = aggregate.multiply(mod(inputHash * wallet.bScan));
  const ownScan = bytesToHex(Point.BASE.multiply(wallet.bScan).toRawBytes(true));
  return recipients.map((address, k) => {
    const decoded = decodeAddress(address);
    if (bytesToHex(decoded.Bscan.toRawBytes(true)) !== ownScan) throw new Error('not our own silent address');
    const tweak = mod(toInt(tagged('BIP0352/SharedSecret', ecdh.toRawBytes(true), u32be(k))));
    return xonly(decoded.Bspend.add(Point.BASE.multiply(tweak)));
  });
}

export function buildPurchase({ wallet, utxos, offer, feeRate, network = NETWORK }) {
  verifyOffer(offer, network);
  if (!(feeRate >= 0.1)) throw new Error('fee rate too low');
  if (utxos.some((u) => u.txid === offer.txid && u.vout === offer.vout)) throw new Error('this is your own listing');
  const spendable = utxos.filter((u) => !u.inscribed && !(u.txid === offer.txid && u.vout === offer.vout)).sort((a, b) => b.value - a.value);
  if (spendable.length < 3) throw new Error('NEED_PREPARE');
  const anchors = spendable.slice(0, 2);
  const candidates = spendable.slice(2).reverse();
  const creator = royalty(offer);
  const kinds = creator ? ['sp', 'sp', 'p2tr', 'p2tr'] : ['sp', 'sp', 'p2tr'];
  const funding = [];
  let sum = 0, fee, change = 0;
  for (const coin of candidates) {
    funding.push(coin); sum += coin.value;
    const inputs = 3 + funding.length;
    const withChange = Math.ceil((vsizeOf(inputs, [...kinds, 'sp']) + 1) * feeRate);
    const withoutChange = Math.ceil((vsizeOf(inputs, kinds) + 1) * feeRate);
    if (sum >= offer.price + withChange + DUST) { fee = withChange; change = sum - offer.price - withChange; break; }
    if (sum >= offer.price + withoutChange) { fee = sum - offer.price; break; }
  }
  if (fee === undefined) {
    const total = spendable.reduce((n, coin) => n + coin.value, 0);
    if (total >= offer.price + Math.ceil(vsizeOf(4, [...kinds, 'sp']) * feeRate) + 2 * DUST) throw new Error('NEED_PREPARE');
    throw new Error('not enough BTC for the price plus the network fee');
  }

  const sellerCoin = { txid: offer.txid, vout: offer.vout, value: offer.value, xonly: offer.xonly };
  const inputs = [anchors[0], anchors[1], sellerCoin, ...funding];
  const received = buyerOutputs(wallet, inputs, change ? [wallet.address, wallet.address, wallet.changeAddress] : [wallet.address, wallet.address]);
  const outputs = [
    { script: hexToBytes('5120' + received[0]), value: anchors[0].value + anchors[1].value },
    { script: hexToBytes('5120' + received[1]), value: offer.value },
    { script: payScript(offer.payTo, network), value: sellerProceeds(offer) },
  ];
  if (creator) outputs.push({ script: hexToBytes(ROYALTY_SCRIPT), value: creator });
  if (change) outputs.push({ script: hexToBytes('5120' + received[2]), value: change });

  const tx = new Transaction(TX_OPTIONS);
  for (const input of inputs) tx.addInput({ txid: input.txid, index: input.vout, sequence: SEQUENCE, witnessUtxo: { script: hexToBytes('5120' + input.xonly), amount: BigInt(input.value) } });
  for (const output of outputs) tx.addOutput({ script: output.script, amount: BigInt(output.value) });
  const scripts = inputs.map((input) => hexToBytes('5120' + input.xonly));
  const amounts = inputs.map((input) => BigInt(input.value));
  const sellerSig = hexToBytes(offer.sig);
  if (!schnorr.verify(sellerSig.slice(0, 64), tx.preimageWitnessV1(SELLER_INPUT_INDEX, scripts, OFFER_SIGHASH, amounts), hexToBytes(offer.xonly))) throw new Error('offer signature does not match this purchase');
  inputs.map((input, index) => {
    if (index === SELLER_INPUT_INDEX) return sellerSig;
    const msg = tx.preimageWitnessV1(index, scripts, SigHash.DEFAULT, amounts);
    const sig = schnorr.sign(msg, input.priv);
    if (!schnorr.verify(sig, msg, hexToBytes(input.xonly))) throw new Error('signature check failed for input ' + index);
    return sig;
  }).forEach((sig, index) => tx.updateInput(index, { finalScriptWitness: [sig] }, true));
  if (Math.ceil(tx.vsize * feeRate) > fee + 1) throw new Error('fee estimate too low (internal check)');
  return {
    hex: tx.hex, txid: tx.id, vsize: tx.vsize, fee, change, price: offer.price, royalty: creator,
    inputs: [anchors[0], anchors[1], ...funding].map((u) => `${u.txid}:${u.vout}`), received,
  };
}
