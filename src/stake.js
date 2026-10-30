// Time-locked Taproot outputs used by The Anchorage staking flow.
// The token inscription is sent to a CLTV leaf controlled by a dedicated key.
import { Transaction, SigHash, Address, OutScript, NETWORK } from '@scure/btc-signer';
import { schnorr } from '@noble/curves/secp256k1';
import { bytesToHex, hexToBytes, concatBytes } from '@noble/curves/abstract/utils';
import { bech32m } from '@scure/base';
import { Point, N, tagged } from './sp.js';
import { DUST } from './send.js';

export const STAKE_PATH = "m/86'/0'/7'/0/0";
export const MIN_STAKE = 1000;
export const BLOCKS_PER_DAY = 144;
export const MAX_LOCK_HEIGHT = 500000000;
export const STAKE_NUMS_XONLY = '50929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0';

const mod = (n) => ((n % N) + N) % N;
const compactSize = (n) => n < 0xfd ? new Uint8Array([n]) : new Uint8Array([0xfd, n & 255, n >> 8]);

function scriptNum(n) {
  const out = [];
  while (n > 0) { out.push(n & 255); n = Math.floor(n / 256); }
  if (out[out.length - 1] & 0x80) out.push(0);
  return concatBytes(new Uint8Array([out.length]), Uint8Array.from(out));
}

export function stakeKey(priv) {
  const point = Point.BASE.multiply(priv);
  return {
    priv: point.toAffine().y % 2n === 0n ? priv : N - priv,
    xonly: bytesToHex(point.toRawBytes(true).slice(1)),
  };
}

export function stakeTarget(xonly, unlock, hrp = 'bc') {
  if (!/^[0-9a-f]{64}$/.test(xonly)) throw new Error('bad stake key');
  if (!Number.isInteger(unlock) || unlock < 1 || unlock >= MAX_LOCK_HEIGHT) throw new Error('bad unlock height');
  const script = concatBytes(
    scriptNum(unlock),
    new Uint8Array([0xb1, 0x75, 0x20]), // OP_CHECKLOCKTIMEVERIFY OP_DROP PUSH32
    hexToBytes(xonly),
    new Uint8Array([0xac]),             // OP_CHECKSIG
  );
  const leaf = tagged('TapLeaf', new Uint8Array([0xc0]), compactSize(script.length), script);
  const tweak = mod(BigInt('0x' + bytesToHex(tagged('TapTweak', hexToBytes(STAKE_NUMS_XONLY), leaf))));
  const output = Point.fromHex('02' + STAKE_NUMS_XONLY).add(Point.BASE.multiply(tweak)).toRawBytes(true);
  const outputXonly = bytesToHex(output.slice(1));
  return {
    script,
    xonly: outputXonly,
    outScript: hexToBytes('5120' + outputXonly),
    controlBlock: concatBytes(new Uint8Array([0xc0 | (output[0] & 1)]), hexToBytes(STAKE_NUMS_XONLY)),
    address: bech32m.encode(hrp, [1, ...bech32m.toWords(output.slice(1))]),
    unlock,
  };
}

const unlockVsize = (target, feeInputs) => Math.ceil(10.5 + 41 + (67 + target.script.length + 1 + 33) / 4 + feeInputs * 57.5 + 86);

function taprootScript(address, network) {
  const decoded = Address(network).decode(address);
  if (decoded.type !== 'tr') throw new Error('unlock goes to a taproot address');
  return OutScript.encode(decoded);
}

// Spend the locked inscription coin after its CLTV height, using ordinary wallet coins for the fee.
export function buildUnstake({ stake, unlock, lockCoin, utxos, to, changeTo, feeRate, network = NETWORK, lockTime = unlock }) {
  const hrp = network.bech32 || 'bc';
  const target = stakeTarget(stake.xonly, unlock, hrp);
  if (lockCoin.xonly && lockCoin.xonly !== target.xonly) throw new Error('that coin is not at this lock address');
  const available = utxos.filter((u) => !u.inscribed && u.priv !== undefined).sort((a, b) => b.value - a.value);
  const feeInputs = [];
  let feeSum = 0, fee;
  for (const coin of available) {
    feeInputs.push(coin); feeSum += coin.value;
    const candidate = Math.ceil(unlockVsize(target, feeInputs.length) * feeRate);
    if (feeSum >= candidate + DUST) { fee = candidate; break; }
  }
  if (fee === undefined) throw new Error('not enough plain BTC to pay the fee (the inscribed coin itself is never used for fees)');

  const outputs = [
    { script: taprootScript(to, network), value: lockCoin.value },
    { script: taprootScript(changeTo, network), value: feeSum - fee },
  ];
  const tx = new Transaction({ allowUnknownOutputs: true, allowUnknownInputs: true, disableScriptCheck: true, lockTime });
  const inputs = [
    { txid: lockCoin.txid, vout: lockCoin.vout, value: lockCoin.value, script: target.outScript },
    ...feeInputs.map((u) => ({ ...u, script: hexToBytes('5120' + u.xonly) })),
  ];
  for (const input of inputs) tx.addInput({
    txid: input.txid,
    index: input.vout,
    sequence: 0xfffffffe,
    witnessUtxo: { script: input.script, amount: BigInt(input.value) },
  });
  for (const output of outputs) tx.addOutput({ script: output.script, amount: BigInt(output.value) });

  const scripts = inputs.map((input) => input.script);
  const amounts = inputs.map((input) => BigInt(input.value));
  const stakeMsg = tx.preimageWitnessV1(0, scripts, SigHash.DEFAULT, amounts, -1, target.script, 0xc0);
  const stakeSig = schnorr.sign(stakeMsg, stake.priv);
  if (!schnorr.verify(stakeSig, stakeMsg, hexToBytes(stake.xonly))) throw new Error('stake key signature check failed');
  tx.updateInput(0, { finalScriptWitness: [stakeSig, target.script, target.controlBlock] }, true);

  feeInputs.forEach((coin, index) => {
    const inputIndex = index + 1;
    const msg = tx.preimageWitnessV1(inputIndex, scripts, SigHash.DEFAULT, amounts);
    const sig = schnorr.sign(msg, coin.priv);
    if (!schnorr.verify(sig, msg, hexToBytes(coin.xonly))) throw new Error('signature check failed for input ' + inputIndex);
    tx.updateInput(inputIndex, { finalScriptWitness: [sig] }, true);
  });
  if (tx.vsize * feeRate > fee + 1) throw new Error('fee estimate too low (internal check)');
  return { hex: tx.hex, txid: tx.id, vsize: tx.vsize, fee, inputs: inputs.map((u) => `${u.txid}:${u.vout}`), lockAddress: target.address };
}
