// Inscriptions: build the commit + reveal pair (standard ord envelope, proven on mainnet), used for
// BRC-20 "transfer" inscriptions. The reveal output pays the TOKEN HOLDER address itself (BRC-20 credits the
// transfer to the address that receives the reveal), then the inscription is sent with buildSendInscription().
//
// The commit key is derived from the wallet's spend key + a nonce, so a stuck commit can always be revealed or
// recovered from the recovery phrase alone.
import { Transaction, SigHash } from '@scure/btc-signer';
import { schnorr } from '@noble/curves/secp256k1';
import { bytesToHex, hexToBytes, concatBytes, numberToBytesBE } from '@noble/curves/abstract/utils';
import { Point, N, tagged, createOutputs } from './sp.js';
import { buildSend, DUST } from './send.js';

export const POSTAGE = 546;                                  // value of the inscription output (UniSat-compatible)
export const BRC20_CT = 'text/plain;charset=utf-8';
export const BRC2_TARGET_SCRIPT = hexToBytes('6a09425243323050524f47'); // OP_RETURN "BRC20PROG"
export const MAX_INSCRIPTION_BYTES = 60000;
const enc = new TextEncoder();

function push(b) {
  if (b.length < 0x4c) return concatBytes(new Uint8Array([b.length]), b);
  if (b.length <= 0xff) return concatBytes(new Uint8Array([0x4c, b.length]), b);
  return concatBytes(new Uint8Array([0x4d, b.length & 255, b.length >> 8]), b);
}
export function inscriptionScript(xonly32, contentType, body) {
  const parts = [push(xonly32), new Uint8Array([0xac]),             // <pk> OP_CHECKSIG
                 new Uint8Array([0x00, 0x63]), push(enc.encode('ord')), // OP_FALSE OP_IF "ord"
                 push(new Uint8Array([1])), push(enc.encode(contentType)), // tag 1: content type
                 new Uint8Array([0x00])];                                 // body separator
  for (let i = 0; i < body.length; i += 520) parts.push(push(body.slice(i, i + 520)));
  parts.push(new Uint8Array([0x68]));                                     // OP_ENDIF
  return concatBytes(...parts);
}
const cs = (n) => (n < 0xfd ? new Uint8Array([n]) : new Uint8Array([0xfd, n & 255, n >> 8]));
const leafHash = (script) => tagged('TapLeaf', new Uint8Array([0xc0]), cs(script.length), script);
const be32 = (n) => numberToBytesBE(n, 32);
const toInt = (b) => BigInt('0x' + bytesToHex(b));

function brc20Amount(value) {
  const amount = String(value ?? '').trim();
  if (!/^\d+(\.\d+)?$/.test(amount) || Number(amount) <= 0) throw new Error('BRC-20 amount must be positive');
  return amount;
}
export function normalizeBrc20Tick(value) {
  // BRC-20 extensions distinguish ticker sizes by UTF-8 bytes, not by the
  // JavaScript character count. Preserve non-ASCII tickers but normalize their
  // Unicode representation; ASCII tickers remain case-insensitive.
  const tick = String(value ?? '').trim().normalize('NFC').replace(/[A-Z]/g, (letter) => letter.toLowerCase());
  const size = enc.encode(tick).length;
  if (size < 4 || size > 6 || /[\u0000-\u001f\u007f]/.test(tick)) throw new Error('BRC-20 ticker must be 4, 5 or 6 UTF-8 bytes');
  if (size === 6 && !/^[a-z0-9-]{6}$/.test(tick)) throw new Error('6-byte BRC-20 ticker must use only A-Z, 0-9 or dash');
  return tick;
}
export const brc20TickerBytes = (value) => enc.encode(normalizeBrc20Tick(value)).length;
export const brc20Mint = (tick, amt) => enc.encode(JSON.stringify({ p: 'brc-20', op: 'mint', tick: normalizeBrc20Tick(tick), amt: brc20Amount(amt) }));
export const brc20Transfer = (tick, amt) => enc.encode(JSON.stringify({ p: 'brc-20', op: 'transfer', tick: normalizeBrc20Tick(tick), amt: brc20Amount(amt) }));

function brc2Hex(value, label) {
  const hex = String(value ?? '').trim();
  if (!/^0x(?:[0-9a-fA-F]{2})+$/.test(hex)) throw new Error(`${label} must be a non-empty 0x-prefixed even-length hex value`);
  return '0x' + hex.slice(2).toLowerCase();
}
export const brc2Deploy = (data) => enc.encode(JSON.stringify({ p: 'brc20-prog', op: 'd', d: brc2Hex(data, 'deployment data') }));
export function brc2Call({ contract, inscriptionId, data }) {
  const target = String(contract || '').trim();
  const parent = String(inscriptionId || '').trim();
  if (!!target === !!parent) throw new Error('provide exactly one contract address or deployment inscription id');
  if (target && !/^0x[0-9a-fA-F]{40}$/.test(target)) throw new Error('contract address must contain 20 bytes');
  if (parent && !/^[0-9a-fA-F]{64}i\d{1,10}$/.test(parent)) throw new Error('deployment inscription id is invalid');
  return enc.encode(JSON.stringify({ p: 'brc20-prog', op: 'c', ...(target ? { c: '0x' + target.slice(2).toLowerCase() } : { i: parent.toLowerCase() }), d: brc2Hex(data, 'call data') }));
}
export function commitKey(bSpend, nonce) {
  return toInt(tagged('shhhhh/commit', be32(bSpend), enc.encode(String(nonce)))) % (N - 1n) + 1n;
}

// Commit address for an envelope with key `k` -> { script (leaf), outScript, controlBlock, internalX }
export function commitTarget(k, contentType, body) {
  const P = Point.BASE.multiply(k), Px = P.toRawBytes(true).slice(1);
  const script = inscriptionScript(Px, contentType, body);
  const t = toInt(tagged('TapTweak', Px, leafHash(script))) % N;
  const Q = Point.fromHex(concatBytes(new Uint8Array([2]), Px)).add(Point.BASE.multiply(t));
  const Qb = Q.toRawBytes(true);
  const evenK = P.toAffine().y % 2n === 0n ? k : N - k;
  return {
    script,
    outScript: concatBytes(new Uint8Array([0x51, 0x20]), Qb.slice(1)),
    controlBlock: concatBytes(new Uint8Array([0xc0 | (Qb[0] & 1)]), Px),
    qPriv: (evenK + t) % N,
  };
}
export const revealVsize = (script) => Math.ceil(10.5 + 41 + 43 + (1 + 1 + 64 + cs(script.length).length + script.length + 1 + 33) / 4);

// Reveal: spend the commit output by script path -> one output (the holder's address script) with POSTAGE sats.
export function buildReveal({ commitTxid, commitVout, commitValue, k, contentType, body, toScript }) {
  const c = commitTarget(k, contentType, body);
  const tx = new Transaction({ allowUnknownOutputs: true, allowUnknownInputs: true, disableScriptCheck: true });
  tx.addInput({ txid: commitTxid, index: commitVout, sequence: 0xfffffffd, witnessUtxo: { script: c.outScript, amount: BigInt(commitValue) } });
  tx.addOutput({ script: toScript, amount: BigInt(POSTAGE) });
  const msg = tx.preimageWitnessV1(0, [c.outScript], SigHash.DEFAULT, [BigInt(commitValue)], -1, c.script, 0xc0);
  const sig = schnorr.sign(msg, k);
  tx.updateInput(0, { finalScriptWitness: [sig, c.script, c.controlBlock] }, true);
  return { hex: tx.hex, txid: tx.id, vsize: tx.vsize, inscriptionId: tx.id + 'i0' };
}

// BRC-20 transfer, step 1: commit (paid from plain coins) + reveal to the holder address.
// holder: the wallet output (bc1p, x-only) that holds the token balance. Returns both signed txs + the nonce to keep.
export function buildInscribeTransfer({ wallet, utxos, holderXonly, tick, amt, feeRate, changeAddress, network, nonce }) {
  const body = brc20Transfer(tick, amt);
  const k = commitKey(wallet.bSpend, nonce);
  const c = commitTarget(k, BRC20_CT, body);
  const revealFee = Math.ceil(revealVsize(c.script) * feeRate);
  const commitValue = POSTAGE + revealFee;
  const commitAddrScript = c.outScript;
  // commit: a normal send to the commit script (buildSend takes addresses, so pass the raw script via a tiny shim)
  const commit = buildSend({ utxos, recipients: [{ address: { script: commitAddrScript }, value: commitValue }], feeRate, changeAddress, network });
  const vout = commit.outputs.findIndex((o) => o.value === commitValue && o.raw);
  const reveal = buildReveal({ commitTxid: commit.txid, commitVout: vout, commitValue, k, contentType: BRC20_CT, body,
                               toScript: hexToBytes('5120' + holderXonly) });
  if (reveal.vsize * feeRate > revealFee + 1) throw new Error('reveal fee estimate too low (internal check)');
  return { commit, reveal, nonce, inscriptionId: reveal.inscriptionId, holderXonly, postage: POSTAGE };
}

// General inscription request: one commit transaction and one independent reveal per item.
export function buildInscribe({ wallet, utxos, items, feeRate, changeAddress, to, network, nonce }) {
  if (!items.length || items.length > 25) throw new Error('between 1 and 25 inscriptions at a time');
  for (const item of items) if (!item.body.length || item.body.length > MAX_INSCRIPTION_BYTES) throw new Error(`each inscription must be 1 to ${MAX_INSCRIPTION_BYTES} bytes`);
  const keys = items.map((_, index) => commitKey(wallet.bSpend, `${nonce}:${index}`));
  const targets = items.map((item, index) => commitTarget(keys[index], item.contentType, item.body));
  const values = targets.map((target) => POSTAGE + Math.ceil(revealVsize(target.script) * feeRate) + 1);
  const commit = buildSend({
    utxos,
    recipients: targets.map((target, index) => ({ address: { script: target.outScript }, value: values[index] })),
    feeRate,
    changeAddress,
    network,
  });
  const reveals = targets.map((target, index) => {
    const toScript = typeof to === 'string'
      ? hexToBytes('5120' + createOutputs([{ txid: commit.txid, vout: index, priv: target.qPriv, taproot: true }], [to])[0].xonly)
      : to.script;
    const reveal = buildReveal({
      commitTxid: commit.txid,
      commitVout: index,
      commitValue: values[index],
      k: keys[index],
      contentType: items[index].contentType,
      body: items[index].body,
      toScript,
    });
    if (reveal.vsize * feeRate > values[index] - POSTAGE + 1) throw new Error('reveal fee estimate too low (internal check)');
    return reveal;
  });
  const revealFees = values.reduce((sum, value) => sum + value - POSTAGE, 0);
  return {
    commit, reveals, nonce,
    postage: POSTAGE * items.length,
    fee: commit.fee + revealFees,
    inscriptionIds: reveals.map((reveal) => reveal.inscriptionId),
  };
}

// BRC2.0 deploy/call inscriptions are revealed directly to the protocol's
// OP_RETURN output. Funding coin selection and every spendable change output
// still use the silent wallet's normal private change path.
export function buildBrc2Inscribe({ wallet, utxos, body, feeRate, changeAddress, network, nonce }) {
  return buildInscribe({
    wallet, utxos,
    items: [{ contentType: BRC20_CT, body }],
    feeRate, changeAddress, network, nonce,
    to: { script: BRC2_TARGET_SCRIPT },
  });
}
