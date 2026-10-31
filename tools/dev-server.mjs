// Local preview: http://127.0.0.1:8362 serves ./dist and provides a persistent
// development market book. Bitcoin/ord checks still use the real public node,
// so two local browser profiles can exercise the real signed trade flow.
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { Transaction } from '@scure/btc-signer';
import { MarketStore, cleanMarketOffer } from '../bridge/market-store.mjs';
import { parseMarketAsset, sameMarketAsset } from '../src/market-asset.js';
import { bytesToHex, hexToBytes } from '../src/sp.js';
import { taprootAddress } from '../src/scan.js';
const PORT = 8362, DIST = fileURLToPath(new URL('../dist/', import.meta.url));
const UPSTREAM = 'https://node.shhhhh.site';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json' };
const DEV_BOOK = process.env.SHHHHH_DEV_MARKET_FILE || path.join(os.tmpdir(), 'shhhhh-wallet-dev-market', 'book.jsonl');
const marketBook = new MarketStore({ file: DEV_BOOK });
const fail = (message, status = 400) => { const error = new Error(message); error.status = status; throw error; };
const sendJSON = (res, status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
async function readJSON(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 20_000) fail('request too large', 413); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail('invalid JSON'); }
}
async function upstreamJSON(pathname, options) {
  const response = await fetch(UPSTREAM + pathname, { ...options, signal: AbortSignal.timeout(20000) });
  const text = await response.text(); let value = text;
  if (/application\/json/i.test(response.headers.get('content-type') || '') || !response.ok) { try { value = JSON.parse(text); } catch {} }
  if (!response.ok) fail(value?.error || `node error ${response.status}`, response.status);
  return value;
}
async function verifyDevListing(offer) {
  const outpoint = `${offer.txid}:${offer.vout}`;
  const [coin] = await upstreamJSON('/v1/outspends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ outpoints: [outpoint] }) });
  if (!coin?.unspent) fail('the inscription output is already spent', 409);
  if (!(coin.confirmations > 0)) fail('the inscription output must be confirmed', 409);
  if (coin.value !== offer.value) fail('the offer value does not match the Bitcoin output', 409);
  const raw = await upstreamJSON(`/v1/tx/${offer.txid}`);
  const tx = Transaction.fromRaw(hexToBytes(raw), { allowUnknownOutputs: true, allowUnknownInputs: true, disableScriptCheck: true });
  if (tx.id !== offer.txid) fail('the node returned the wrong transaction', 503);
  const output = tx.getOutput(offer.vout);
  if (!output || Number(output.amount) !== offer.value || bytesToHex(output.script) !== '5120' + offer.xonly) fail('the offer script does not match the Bitcoin output', 409);
  const ord = await upstreamJSON(`/v1/ord/output/${outpoint}`);
  if (!Array.isArray(ord.inscriptions) || ord.inscriptions.length !== 1 || ord.inscriptions[0] !== offer.inscriptionId) fail('the output must hold exactly the listed inscription', 409);
  if ((Array.isArray(ord.runes) && ord.runes.length) || (ord.runes && typeof ord.runes === 'object' && Object.keys(ord.runes).length)) fail('outputs containing runes cannot be listed', 409);

  const content = await fetch(`${UPSTREAM}/v1/ord/content/${offer.inscriptionId}`, { signal: AbortSignal.timeout(20000) });
  if (!content.ok) fail('the inscription content is unavailable', content.status === 404 ? 409 : 503);
  let asset = { kind: 'ordinal' };
  if (/^(text\/plain|application\/json)\b/i.test(content.headers.get('content-type') || '')) {
    const bytes = new Uint8Array(await content.arrayBuffer());
    if (bytes.length <= 16_384) asset = parseMarketAsset(bytes);
  } else { try { content.body?.cancel(); } catch {} }

  if (asset.kind === 'brc20') {
    const waiting = await upstreamJSON(`/v1/brc20-transferable/${taprootAddress(offer.xonly)}/${encodeURIComponent(asset.tick)}`);
    const indexed = Array.isArray(waiting) ? waiting.find((item) => item.inscriptionId === offer.inscriptionId) : null;
    const indexedAsset = indexed && parseMarketAsset(JSON.stringify({ p: 'brc-20', op: 'transfer', tick: indexed.tick, amt: indexed.amt }));
    if (!indexed || !sameMarketAsset(asset, indexedAsset)) fail('the indexer does not recognize this BRC-20 transfer', 409);
  }
  return asset;
}
async function devMarket(req, res, url) {
  const pathname = url.pathname.slice('/api/node'.length);
  if (req.method === 'GET' && pathname === '/v1/market/listings') return sendJSON(res, 200, marketBook.list({ cursor: url.searchParams.get('cursor') || 0, limit: url.searchParams.get('limit') || 50 }));
  if (req.method === 'GET' && pathname === '/v1/market/fee-policy') return sendJSON(res, 200, {
    v: 1, network: 'bitcoin-mainnet', minerAsset: 'BTC', silentFallback: false, development: true,
    btc: { enabled: true, payer: 'buyer' }, shhhhh: { enabled: false, ticker: 'shhhhh', payer: 'sponsor', reason: 'The shhhhh fee Sponsor is not online yet.' },
  });
  if (req.method === 'POST' && pathname === '/v1/market/list') {
    const { offer } = await readJSON(req); const clean = cleanMarketOffer(offer); const asset = await verifyDevListing(clean);
    return sendJSON(res, 200, marketBook.put(clean, Date.now(), asset));
  }
  if (req.method === 'POST' && pathname === '/v1/market/cancel') return sendJSON(res, 200, marketBook.cancel(await readJSON(req)));
  return sendJSON(res, 404, { error: 'not found' });
}
http.createServer(async (req, res) => {
  if (!['127.0.0.1:' + PORT, 'localhost:' + PORT].includes(req.headers.host)) { res.writeHead(403); return res.end(); }
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/node/v1/market/')) {
    try { return await devMarket(req, res, url); }
    catch (error) { return sendJSON(res, Number(error.status) || 500, { error: error.message || 'market error' }); }
  }
  if (url.pathname === '/api/sp-index') {
    try {
      const r = await fetch('https://shhhhh.site' + url.pathname + url.search);
      res.writeHead(r.status, { 'Content-Type': 'application/json', 'Cache-Control': r.headers.get('cache-control') || 'no-store' });
      return res.end(Buffer.from(await r.arrayBuffer()));
    } catch (e) { res.writeHead(502); return res.end('{"error":"upstream"}'); }
  }
  const file = path.join(DIST, url.pathname === '/' ? 'index.html' : path.normalize(url.pathname).replace(/^\/+/, ''));
  if (!file.startsWith(DIST) || !fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => console.log(`shhhhh wallet preview: http://127.0.0.1:${PORT}\ndevelopment market book: ${DEV_BOOK}`));
