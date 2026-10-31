import { brc20TickerBytes, normalizeBrc20Tick } from './inscribe.js';

const decoder = new TextDecoder('utf-8', { fatal: true });
const AMOUNT = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

export const MARKET_TICKER_BYTES = Object.freeze([4, 5, 6]);

const ordinal = () => ({ kind: 'ordinal' });

function amountOf(value) {
  const amount = String(value ?? '').trim();
  if (!AMOUNT.test(amount) || amount.length > 80 || !/[1-9]/.test(amount)) throw new Error('invalid BRC-20 transfer amount');
  return amount;
}

// Only a transfer inscription represents spendable BRC-20 inventory. Mint and
// deploy inscriptions remain ordinary Ordinals in the market, so their JSON
// cannot be presented as a token balance by a dishonest listing server.
export function parseMarketAsset(body) {
  let text;
  try {
    text = typeof body === 'string' ? body : decoder.decode(body);
    if (text.length > 16_384) return ordinal();
    const value = JSON.parse(text);
    if (!value || value.p !== 'brc-20' || value.op !== 'transfer') return ordinal();
    const tick = normalizeBrc20Tick(value.tick);
    const tickerBytes = brc20TickerBytes(tick);
    const amount = amountOf(value.amt);
    return { kind: 'brc20', protocol: 'brc-20', op: 'transfer', tick, tickerBytes, amount };
  } catch {
    return ordinal();
  }
}

// Treat order-book metadata as untrusted input. The buyer later compares it
// with the immutable inscription body before any purchase can be signed.
export function cleanMarketAsset(value) {
  if (!value || value.kind !== 'brc20') return ordinal();
  try {
    const tick = normalizeBrc20Tick(value.tick);
    const tickerBytes = brc20TickerBytes(tick);
    const amount = amountOf(value.amount);
    return { kind: 'brc20', protocol: 'brc-20', op: 'transfer', tick, tickerBytes, amount };
  } catch {
    return ordinal();
  }
}

export function sameMarketAsset(left, right) {
  const a = cleanMarketAsset(left), b = cleanMarketAsset(right);
  return a.kind === b.kind && (a.kind !== 'brc20' || (a.tick === b.tick && a.tickerBytes === b.tickerBytes && a.amount === b.amount));
}

export const marketAssetCategory = (value) => {
  const asset = cleanMarketAsset(value);
  return asset.kind === 'brc20' && MARKET_TICKER_BYTES.includes(asset.tickerBytes) ? String(asset.tickerBytes) : 'other';
};
