// shhhhh node bridge: the wallet's back-end door to the server (node.shhhhh.site, behind Caddy for HTTPS).
// Only these requests exist; Bitcoin Core RPC, ord and Frigate stay on 127.0.0.1.
//
//   GET  /                         status text
//   GET  /v1/tip                   { height }
//   GET  /v1/fees                  { fast, normal, slow, min } sat/vB (Bitcoin Core estimatesmartfee)
//   GET  /v1/tx/:txid              raw tx hex (txindex)
//   POST /v1/outspends             { outpoints: ["txid:vout", ...] } -> [{ unspent, value, height }]  (gettxout, max 500)
//   POST /v1/broadcast             { hex } -> { txid }   (testmempoolaccept first, readable errors)
//   GET  /v1/ord/output/:outpoint  inscriptions on an output (ord JSON)
//   GET  /v1/ord/inscription/:id   inscription details (ord JSON)
//   GET  /v1/ord/content/:id       inscription content (sandboxed, size-limited)
//   GET  /v1/brc20-transferable/:address/:tick  waiting transfer inscriptions (UniSat)
//   GET  /v1/txstatus/:txid        { found, confirmed, height } for one transaction
//   GET  /v1/price                 BTC price in USD (cached 60 s)
//   GET  /v1/brc20/:address        BRC-20 balances (UniSat, cached 5 min)
//   GET  /v1/fair/status            current Fair Batch Mode phase and policy
//   POST /v1/fair/commit            signed hidden order commitment
//   POST /v1/fair/reveal            reveal an order during the reveal window
//   GET  /v1/fair/result/:epoch     deterministic batch result
//   GET  /v1/fair/audit/:epoch      public hash-chained batch audit records
//   GET  /v1/market/listings         signed, non-custodial inscription offers
//   POST /v1/market/list             add a chain-verified signed offer
//   POST /v1/market/cancel           remove an offer with the seller's signature
//   GET  /v1/market/fee-policy       available miner-fee payment methods
//   WS   /v1/sp                    silent payments scan: client sends {scan, spend, start}; Frigate notifications relayed
//
// The scan key passes through in memory only (never logged or stored). No spending key ever reaches this server.
import http from 'node:http';
import net from 'node:net';
import fs from 'node:fs';
import os from 'node:os';
import { WebSocketServer } from 'ws';
import { STATUS_PAGE } from './status-page.mjs';
import { FairMarketCoordinator } from './fair-market.mjs';
import { MarketStore, cleanMarketOffer } from './market-store.mjs';
import { parseMarketAsset, sameMarketAsset } from '../src/market-asset.js';

const PORT = Number(process.env.PORT || 8090);
const COOKIE = process.env.BITCOIN_COOKIE || '/var/lib/bitcoind/.cookie';
const ORD = process.env.ORD_URL || 'http://127.0.0.1:8080';
const FRIGATE = { host: '127.0.0.1', port: Number(process.env.FRIGATE_PORT || 50001) };
const UNISAT_KEY = process.env.UNISAT_API_KEY || '';
const ORIGINS = new Set((process.env.ALLOW_ORIGINS || 'https://shhhhh.site,http://127.0.0.1:8362').split(','));
// the wallet also runs as a Chrome extension (origin chrome-extension://<id>)
const okOrigin = (o) => ORIGINS.has(o) || /^chrome-extension:\/\/[a-p]{32}$/.test(o);
const MAX_CONTENT = 5 * 1024 * 1024;
// Inscription content: only types that cannot run code when shown by the wallet (images via <img>, text as text)
const SAFE_TYPES = /^(image\/(png|jpeg|gif|webp|avif|svg\+xml)|text\/plain|application\/json)\b/i;
const FAIR_AUDIT_FILE = process.env.FAIR_AUDIT_FILE || '';
const FAIR_STAKES_FILE = process.env.FAIR_STAKES_FILE || '';
let fairSupplies = {};
try { fairSupplies = JSON.parse(process.env.FAIR_MARKET_SUPPLY_JSON || '{}'); } catch { throw new Error('FAIR_MARKET_SUPPLY_JSON must be JSON'); }
let fairStakes = { checkedAt: 0, modified: 0, data: {} };
function verifiedFairStake(market, walletKey) {
  if (!FAIR_STAKES_FILE) return 0;
  const now = Date.now();
  if (now - fairStakes.checkedAt > 60_000) {
    fairStakes.checkedAt = now;
    try {
      const stat = fs.statSync(FAIR_STAKES_FILE);
      if (stat.mtimeMs !== fairStakes.modified) fairStakes = { checkedAt: now, modified: stat.mtimeMs, data: JSON.parse(fs.readFileSync(FAIR_STAKES_FILE, 'utf8')) };
    } catch { fairStakes = { checkedAt: now, modified: 0, data: {} }; }
  }
  return Number((fairStakes.data[market] && fairStakes.data[market][walletKey]) ?? fairStakes.data[walletKey] ?? 0);
}
const fairMarket = new FairMarketCoordinator({
  auditFile: FAIR_AUDIT_FILE,
  stakeLookup: verifiedFairStake,
  supplyLookup: (market) => fairSupplies[market] ?? null,
});
const marketBook = new MarketStore({ file: process.env.MARKET_BOOK_FILE || '/data/shhhhh-market/book.jsonl' });
// Blocklist: one inscription id per line in /etc/shhhhh-bridge/blocked.txt (re-read every minute)
const BLOCKED_FILE = process.env.BLOCKED_FILE || '/etc/shhhhh-bridge/blocked.txt';
let blocked = new Set();
function loadBlocked() { try { blocked = new Set(fs.readFileSync(BLOCKED_FILE, 'utf8').split(/\s+/).filter(Boolean)); } catch { blocked = new Set(); } }
loadBlocked(); setInterval(loadBlocked, 60000).unref();

// ---------------------------------------------------------------- rate limits (per IP, token bucket)
const buckets = new Map();
function allow(ip, cost = 1, perMin = 1200) {             // generous: a first sync is bursty and people share IPs (Wi-Fi, offices)
  const now = Date.now(), b = buckets.get(ip) || { t: now, tokens: perMin };
  b.tokens = Math.min(perMin, b.tokens + ((now - b.t) / 60000) * perMin); b.t = now;
  if (b.tokens < cost) { buckets.set(ip, b); return false; }
  b.tokens -= cost; buckets.set(ip, b); return true;
}
setInterval(() => { const cut = Date.now() - 600000; for (const [k, b] of buckets) if (b.t < cut) buckets.delete(k); }, 300000).unref();

// ---------------------------------------------------------------- Bitcoin Core RPC (cookie auth)
let rid = 0;
async function rpc(method, params = []) {
  const auth = Buffer.from(fs.readFileSync(COOKIE, 'utf8').trim()).toString('base64');
  const r = await fetch('http://127.0.0.1:8332/', { method: 'POST', headers: { Authorization: 'Basic ' + auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '1.0', id: ++rid, method, params }), signal: AbortSignal.timeout(30000) });
  const j = await r.json();
  if (j.error) { const e = new Error(j.error.message); e.rpc = j.error; throw e; }
  return j.result;
}

// ---------------------------------------------------------------- UniSat pacing: free plan allows only a few calls per second
// for the whole key, so every UniSat request (from all users) goes through one queue, one call every UNISAT_GAP ms,
// and a "rate limit" answer is retried after a pause instead of failing.
const UNISAT_GAP = 110;                                         // one request STARTS every 110 ms (~9/s): paid plan allows ~10/s (tested Oct 8)
let unisatNext = 0, unisatWaiting = 0;
const brc20Hits = [];                                            // timestamps of BRC-20 requests (counts only, no addresses)
async function unisatSlot() {                                    // fixed beat: start times spaced out, answers may overlap
  const now = Date.now(), at = Math.max(now, unisatNext);
  unisatNext = at + UNISAT_GAP;
  if (at > now) await new Promise((ok) => setTimeout(ok, at - now));
}
async function unisatFetch(url) {
  unisatWaiting++;
  try {
    for (let i = 0; i < 5; i++) {
      await unisatSlot();
      const r = await fetch(url, { headers: { Authorization: 'Bearer ' + UNISAT_KEY }, signal: AbortSignal.timeout(20000) });
      const d = await r.json();
      if (d.code === 0) return d;
      if (!/rate limit/i.test(d.msg || '')) throw new Error('unisat: ' + d.msg);
      unisatNext = Math.max(unisatNext, Date.now() + 1000 * (i + 1));   // UniSat says slow down: push everyone back
    }
    throw new Error('unisat: exceeds rate limit');
  } finally { unisatWaiting--; }
}

// ---------------------------------------------------------------- small caches
const cache = new Map();
async function cached(key, ttlMs, fn) {
  const hit = cache.get(key);
  if (hit && hit.until > Date.now()) return hit.v;
  const v = await fn(); cache.set(key, { v, until: Date.now() + ttlMs });
  if (cache.size > 20000) cache.delete(cache.keys().next().value);
  return v;
}

const HEX64 = /^[0-9a-f]{64}$/, OUTPOINT = /^[0-9a-f]{64}:\d{1,5}$/, INSC = /^[0-9a-f]{64}i\d{1,7}$/;
const ADDR = /^(bc1[02-9ac-hj-np-z]{8,87}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/;

function send(res, code, body, headers = {}) {
  const isBuf = Buffer.isBuffer(body), isStr = typeof body === 'string';
  res.writeHead(code, { 'Content-Type': isBuf || isStr ? (headers['Content-Type'] || 'text/plain; charset=utf-8') : 'application/json', ...headers });
  res.end(isBuf || isStr ? body : JSON.stringify(body));
}
async function readJSON(req, limit = 2_000_000) {
  let n = 0; const chunks = [];
  for await (const c of req) { n += c.length; if (n > limit) throw Object.assign(new Error('request too large'), { code: 413 }); chunks.push(c); }
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); }
  catch { throw Object.assign(new Error('request body must be valid JSON'), { status: 400 }); }
}

// ---------------------------------------------------------------- public health numbers (no keys, nothing about users)
function frigateInfo() {
  return new Promise((resolve) => {
    const c = net.connect({ host: '127.0.0.1', port: 50003 }); let b = '';
    const done = (v) => { try { c.destroy(); } catch {} resolve(v); };
    c.on('connect', () => c.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getinfo', params: [] }) + '\n'));
    c.on('data', (d) => { b += d; const i = b.indexOf('\n'); if (i >= 0) { try { done(JSON.parse(b.slice(0, i)).result); } catch { done(null); } } });
    c.on('error', () => done(null)); setTimeout(() => done(null), 3000);
  });
}
async function ordInfo() {
  try { const r = await fetch(`${ORD}/status`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(3000) }); return r.ok ? await r.json() : null; } catch { return null; }
}
async function marketChainCheck(offer) {
  const outpoint = `${offer.txid}:${offer.vout}`;
  const coin = await rpc('gettxout', [offer.txid, offer.vout, true]);
  if (!coin) throw Object.assign(new Error('the inscription output is already spent'), { status: 409 });
  if (!(coin.confirmations > 0)) throw Object.assign(new Error('the inscription output must be confirmed'), { status: 409 });
  if (Math.round(coin.value * 1e8) !== offer.value || coin.scriptPubKey?.hex !== '5120' + offer.xonly)
    throw Object.assign(new Error('the offer does not match the Bitcoin output'), { status: 409 });
  const response = await fetch(`${ORD}/output/${outpoint}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw Object.assign(new Error(response.status === 404 ? 'the inscription output was not found' : 'the inscription index is unavailable'), { status: response.status === 404 ? 409 : 503 });
  const ord = await response.json();
  const inscriptions = Array.isArray(ord.inscriptions) ? ord.inscriptions : [];
  if (inscriptions.length !== 1 || inscriptions[0] !== offer.inscriptionId)
    throw Object.assign(new Error('the output must hold exactly the listed inscription'), { status: 409 });
  const runes = ord.runes;
  if ((Array.isArray(runes) && runes.length) || (runes && typeof runes === 'object' && Object.keys(runes).length))
    throw Object.assign(new Error('outputs containing runes cannot be listed'), { status: 409 });

  if (blocked.has(offer.inscriptionId)) throw Object.assign(new Error('this inscription is blocked on this node'), { status: 451 });
  const content = await fetch(`${ORD}/content/${offer.inscriptionId}`, { signal: AbortSignal.timeout(20000) });
  if (!content.ok) throw Object.assign(new Error('the inscription content is unavailable'), { status: 503 });
  const type = content.headers.get('content-type') || '';
  let asset = { kind: 'ordinal' };
  if (/^(text\/plain|application\/json)\b/i.test(type)) {
    const declared = Number(content.headers.get('content-length') || 0);
    if (declared && declared > 16_384) { try { content.body?.cancel(); } catch {} }
    else {
      const body = new Uint8Array(await content.arrayBuffer());
      if (body.length <= 16_384) asset = parseMarketAsset(body);
    }
  } else { try { content.body?.cancel(); } catch {} }

  // JSON shape alone is not enough: a forged transfer document has no BRC-20
  // balance. UniSat's indexer must recognize the exact transfer and current
  // outpoint before it can enter a 4/5/6-byte ticker category.
  if (asset.kind === 'brc20') {
    if (!UNISAT_KEY) throw Object.assign(new Error('the BRC-20 indexer is not configured'), { status: 503 });
    const indexed = await unisatFetch(`https://open-api.unisat.io/v1/indexer/inscription/info/${offer.inscriptionId}`);
    const brc20 = indexed.data?.brc20;
    const verified = parseMarketAsset(JSON.stringify({ p: 'brc-20', op: brc20?.op, tick: brc20?.tick, amt: brc20?.amt }));
    if (verified.kind !== 'brc20' || !sameMarketAsset(asset, verified))
      throw Object.assign(new Error('the indexer does not recognize this BRC-20 transfer'), { status: 409 });
    const indexedUtxo = indexed.data?.utxo;
    const indexedVout = indexedUtxo?.vout ?? indexedUtxo?.idx;
    if (!indexedUtxo || indexedUtxo.txid !== offer.txid || Number(indexedVout) !== offer.vout)
      throw Object.assign(new Error('the BRC-20 transfer is no longer at the listed output'), { status: 409 });
  }
  return asset;
}
let marketSweepCursor = '0', marketSweepRunning = false;
async function sweepMarketBook() {
  if (marketSweepRunning) return;
  marketSweepRunning = true;
  try {
    const page = marketBook.list({ cursor: marketSweepCursor, limit: 25 });
    for (const listing of page.listings) {
      const offer = listing.offer;
      const coin = await rpc('gettxout', [offer.txid, offer.vout, true]);
      if (!coin || Math.round(coin.value * 1e8) !== offer.value || coin.scriptPubKey?.hex !== '5120' + offer.xonly) marketBook.expire(listing.id);
    }
    marketSweepCursor = page.nextCursor || '0';
  } catch (error) { console.error(new Date().toISOString(), '/v1/market/sweep', error.message); }
  finally { marketSweepRunning = false; }
}
setTimeout(sweepMarketBook, 5000).unref();
setInterval(sweepMarketBook, 30000).unref();
function disk(path) { try { const f = fs.statfsSync(path); return { total: f.blocks * f.bsize, free: f.bavail * f.bsize }; } catch { return null; } }
async function nodeStatus() {
  const [chain, net_, mem, fr, ord] = await Promise.all([rpc('getblockchaininfo'), rpc('getnetworkinfo'), rpc('getmempoolinfo'), frigateInfo(), ordInfo()]);
  const best = await rpc('getblockheader', [chain.bestblockhash]);
  return {
    at: Date.now(),
    bitcoin: { ok: !chain.initialblockdownload, height: chain.blocks, headers: chain.headers, version: net_.subversion.replace(/\//g, ''), peers: net_.connections,
               lastBlockTime: best.time * 1000, sizeGB: Math.round(chain.size_on_disk / 1e9), mempoolTxs: mem.size, mempoolMB: Math.round(mem.bytes / 1e6) },
    frigate: fr ? { ok: fr.health && fr.health.indexHeight >= chain.blocks - 1, height: fr.health && fr.health.indexHeight, version: fr.version, uptime: fr.uptimeSeconds } : { ok: false },
    ord: ord ? { ok: ord.height >= chain.blocks - 2, height: ord.height, inscriptions: ord.inscriptions } : { ok: false },
    market: { ok: true, activeListings: marketBook.list({ limit: 1 }).total, brc20Indexer: !!UNISAT_KEY },
    machine: { load: os.loadavg().map((x) => Math.round(x * 100) / 100), cpus: os.cpus().length, memTotal: os.totalmem(), memFree: os.freemem(),
               uptime: os.uptime(), disks: { system: disk('/'), data: disk('/data') } },
  };
}

// ---------------------------------------------------------------- HTTP routes
// traffic counters for debugging: endpoint kind only (never IPs, addresses or txids), printed once a minute
const traffic = new Map();
setInterval(() => { if (traffic.size) { console.log('traffic/min', JSON.stringify(Object.fromEntries(traffic))); traffic.clear(); } }, 60000);
const countHit = (k) => traffic.set(k, (traffic.get(k) || 0) + 1);
async function route(req, res, url, ip) {
  const p = url.pathname;
  let m;
  countHit(p.split('/').slice(0, 3).join('/'));
  if (p === '/health') {
    const height = await cached('tip', 10000, () => rpc('getblockcount'));
    return send(res, 200, `shhhhh node: online (block ${height})\n`);
  }
  if (p === '/' || p === '/status') return send(res, 200, STATUS_PAGE, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src data:" });
  if (p === '/v1/status') return send(res, 200, await cached('status', 5000, nodeStatus), { 'Cache-Control': 'no-cache' });
  if (!allow(ip, 1)) { countHit('429'); return send(res, 429, { error: 'too many requests, slow down' }); }

  if (req.method === 'GET' && p === '/v1/fair/status') {
    return send(res, 200, fairMarket.status(url.searchParams.get('market') || 'shhhhh/btc'));
  }
  if (req.method === 'POST' && p === '/v1/fair/commit') {
    if (!allow('fair:' + ip, 10, 120)) return send(res, 429, { error: 'too many fair-market commitments' });
    return send(res, 200, fairMarket.commit(await readJSON(req, 20_000)));
  }
  if (req.method === 'POST' && p === '/v1/fair/reveal') {
    if (!allow('fair:' + ip, 10, 120)) return send(res, 429, { error: 'too many fair-market reveals' });
    return send(res, 200, fairMarket.reveal(await readJSON(req, 20_000)));
  }
  if (req.method === 'GET' && (m = p.match(/^\/v1\/fair\/(result|audit)\/(\d{1,8})$/))) {
    const market = url.searchParams.get('market') || 'shhhhh/btc';
    return send(res, 200, m[1] === 'result' ? fairMarket.result(Number(m[2]), market) : fairMarket.audit(Number(m[2]), market));
  }

  if (req.method === 'GET' && p === '/v1/market/listings') {
    const query = { cursor: url.searchParams.get('cursor') || 0, limit: url.searchParams.get('limit') || 50 };
    return send(res, 200, marketBook.list(query), { 'Cache-Control': 'no-cache' });
  }
  if (req.method === 'POST' && p === '/v1/market/list') {
    if (!allow('market-write:' + ip, 5, 60)) return send(res, 429, { error: 'too many market updates' });
    const { offer } = await readJSON(req, 20_000);
    const clean = cleanMarketOffer(offer);
    // The signature is checked by MarketStore. Chain/ord checks stop stale or
    // misleading listings entering the public book; buyers check again.
    const asset = await marketChainCheck(clean);
    return send(res, 200, marketBook.put(clean, Date.now(), asset));
  }
  if (req.method === 'POST' && p === '/v1/market/cancel') {
    if (!allow('market-write:' + ip, 3, 60)) return send(res, 429, { error: 'too many market updates' });
    return send(res, 200, marketBook.cancel(await readJSON(req, 20_000)));
  }
  if (req.method === 'GET' && p === '/v1/market/fee-policy') {
    return send(res, 200, {
      v: 1,
      network: 'bitcoin-mainnet',
      minerAsset: 'BTC',
      silentFallback: false,
      btc: { enabled: true, payer: 'buyer' },
      shhhhh: {
        enabled: false,
        ticker: 'shhhhh',
        payer: 'sponsor',
        reason: 'The independent shhhhh fee Sponsor is not online yet. Choose BTC; the wallet will never switch automatically.',
      },
    }, { 'Cache-Control': 'public, max-age=30' });
  }

  if (req.method === 'GET' && p === '/v1/tip') return send(res, 200, { height: await cached('tip', 10000, () => rpc('getblockcount')) });

  // BTC price in USD for the wallet (some users cannot reach mempool.space): cached 60 s, three sources in turn
  if (req.method === 'GET' && p === '/v1/price') {
    return send(res, 200, await cached('price', 60000, async () => {
      const get = async (u) => { const r = await fetch(u, { signal: AbortSignal.timeout(6000) }); if (!r.ok) throw new Error(r.status); return r.json(); };
      const sources = [
        async () => (await get('https://mempool.space/api/v1/prices')).USD,
        async () => Number((await get('https://api.coinbase.com/v2/prices/BTC-USD/spot')).data.amount),
        async () => Number((await get('https://api.kraken.com/0/public/Ticker?pair=XBTUSD')).result.XXBTZUSD.c[0]),
      ];
      for (const f of sources) { try { const usd = await f(); if (usd > 0) return { usd: Math.round(usd * 100) / 100, at: Date.now() }; } catch {} }
      throw new Error('price unavailable');
    }), { 'Cache-Control': 'public, max-age=60' });
  }
  if (req.method === 'GET' && p === '/v1/fees') {
    return send(res, 200, await cached('fees', 60000, async () => {
      const est = async (n) => { const r = await rpc('estimatesmartfee', [n]); return r.feerate ? Math.max(1, Math.round(r.feerate * 1e5 * 10) / 10) : null; };
      const info = await rpc('getmempoolinfo');
      const min = Math.max(0.1, Math.round(info.mempoolminfee * 1e5 * 10) / 10);
      const [fast, normal, slow] = [await est(1), await est(6), await est(144)];
      return { fast: fast || normal || min, normal: normal || min, slow: slow || min, min };
    }), { 'Cache-Control': 'public, max-age=30' });
  }

  if (req.method === 'GET' && (m = p.match(/^\/v1\/tx\/([0-9a-f]{64})$/))) {
    const hex = await cached('tx:' + m[1], 3600000, () => rpc('getrawtransaction', [m[1], 0]));
    return send(res, 200, hex, { 'Cache-Control': 'public, max-age=3600' });
  }

  // is a transaction confirmed? (for sends the wallet cannot see in its own scan, e.g. a Max send with no change)
  if (req.method === 'GET' && (m = p.match(/^\/v1\/txstatus\/([0-9a-f]{64})$/))) {
    const st = await cached('txst:' + m[1], 30000, async () => {
      let tx; try { tx = await rpc('getrawtransaction', [m[1], 1]); } catch { return { found: false }; }
      if (!tx.blockhash) return { found: true, confirmed: false };
      const hdr = await rpc('getblockheader', [tx.blockhash]);
      return { found: true, confirmed: true, height: hdr.height, confirmations: tx.confirmations };
    });
    return send(res, 200, st, { 'Cache-Control': 'no-cache' });
  }

  if (req.method === 'POST' && p === '/v1/outspends') {
    const { outpoints } = await readJSON(req);
    if (!Array.isArray(outpoints) || outpoints.length > 500 || !outpoints.every((o) => OUTPOINT.test(o))) return send(res, 400, { error: 'outpoints: up to 500 "txid:vout"' });
    if (!allow(ip, Math.ceil(outpoints.length / 25))) return send(res, 429, { error: 'too many requests, slow down' });
    const out = [];
    for (const o of outpoints) {
      const [txid, vout] = o.split(':');
      const r = await rpc('gettxout', [txid, Number(vout), true]);    // includes mempool: spent-in-mempool counts as spent
      out.push(r ? { unspent: true, value: Math.round(r.value * 1e8), confirmations: r.confirmations } : { unspent: false });
    }
    return send(res, 200, out);
  }

  if (req.method === 'POST' && p === '/v1/broadcast') {
    if (!allow(ip, 10)) return send(res, 429, { error: 'too many broadcasts, slow down' });
    const { hex } = await readJSON(req, 1_000_000);
    if (typeof hex !== 'string' || !/^[0-9a-f]+$/.test(hex)) return send(res, 400, { error: 'hex: signed transaction' });
    const [t] = await rpc('testmempoolaccept', [[hex]]);
    if (!t.allowed) return send(res, 400, { error: 'rejected by the network: ' + (t['reject-reason'] || 'unknown') });
    const txid = await rpc('sendrawtransaction', [hex]);
    return send(res, 200, { txid });
  }

  if (req.method === 'GET' && (m = p.match(/^\/v1\/ord\/(output|inscription)\/([^/]+)$/))) {
    const [, kind, id] = m;
    if (kind === 'output' ? !OUTPOINT.test(id) : !INSC.test(id)) return send(res, 400, { error: 'bad id' });
    const j = await cached(`ord:${kind}:${id}`, 30000, async () => {
      const r = await fetch(`${ORD}/${kind}/${id}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error('ord ' + r.status);
      return r.json();
    });
    return j ? send(res, 200, j) : send(res, 404, { error: 'not found' });
  }

  if (req.method === 'GET' && (m = p.match(/^\/v1\/ord\/content\/([0-9a-f]{64}i\d{1,7})$/))) {
    if (!allow(ip, 2)) return send(res, 429, { error: 'too many requests, slow down' });
    if (blocked.has(m[1])) return send(res, 451, { error: 'this inscription is blocked on this node' });
    const r = await fetch(`${ORD}/content/${m[1]}`, { signal: AbortSignal.timeout(20000) });
    if (!r.ok) return send(res, r.status === 404 ? 404 : 502, { error: 'content unavailable' });
    const ctype = r.headers.get('content-type') || '';
    if (!SAFE_TYPES.test(ctype)) { try { r.body && r.body.cancel(); } catch {} return send(res, 415, { error: 'no preview for this type', type: ctype }); }
    const len = Number(r.headers.get('content-length') || 0);
    if (len > MAX_CONTENT) return send(res, 413, { error: 'content too large to preview' });
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX_CONTENT) return send(res, 413, { error: 'content too large to preview' });
    // inscriptions can be HTML/JS: serve them inert (sandbox, no sniffing), never on the wallet's own origin
    return send(res, 200, buf, { 'Content-Type': r.headers.get('content-type') || 'application/octet-stream',
      'Content-Security-Policy': "sandbox; default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; media-src data: blob:",
      'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'public, max-age=31536000, immutable', 'Cross-Origin-Resource-Policy': 'cross-origin' });
  }

  if (req.method === 'GET' && (m = p.match(/^\/v1\/brc20\/([^/]+)$/))) {
    if (!ADDR.test(m[1])) return send(res, 400, { error: 'bad address' });
    brc20Hits.push(Date.now()); while (brc20Hits.length && brc20Hits[0] < Date.now() - 60000) brc20Hits.shift();
    if (!UNISAT_KEY) return send(res, 503, { error: 'BRC-20 balances not configured' });
    // tick_filter=56: 4-, 5- AND 6-letter (self-mint) tickers; UniSat's default leaves 6-letter ones like shhhhh out
    const j = await cached('brc20:' + m[1], 300000, async () => {
      const all = [];
      for (let start = 0; start < 500; start += 100) {
        const d = await unisatFetch(`https://open-api.unisat.io/v1/indexer/address/${m[1]}/brc20/summary?start=${start}&limit=100&tick_filter=56`);
        all.push(...(d.data.detail || []));
        if (all.length >= (d.data.total || 0) || !(d.data.detail || []).length) break;
      }
      return all.map((x) => ({ tick: x.ticker, selfMint: !!x.selfMint, balance: x.overallBalance, available: x.availableBalance, transferable: x.transferableBalance, decimal: x.decimal }));
    });
    return send(res, 200, j, { 'Cache-Control': 'private, max-age=60' });
  }

  // BRC-20 "transfer" inscriptions still waiting at an address (step 1 done, step 2 not): lets a restored wallet finish them
  if (req.method === 'GET' && (m = p.match(/^\/v1\/brc20-transferable\/([^/]+)\/([^/]{1,16})$/))) {
    if (!ADDR.test(m[1])) return send(res, 400, { error: 'bad address' });
    if (!UNISAT_KEY) return send(res, 503, { error: 'BRC-20 not configured' });
    const tick = decodeURIComponent(m[2]);
    const j = await cached(`brc20t:${m[1]}:${tick}`, 60000, async () => {
      const d = await unisatFetch(`https://open-api.unisat.io/v1/indexer/address/${m[1]}/brc20/${encodeURIComponent(tick)}/transferable-inscriptions?start=0&limit=100`);
      return (d.data.detail || []).map((x) => ({ inscriptionId: x.inscriptionId, amt: x.data && x.data.amt, tick: (x.data && x.data.tick) || tick }));
    });
    return send(res, 200, j, { 'Cache-Control': 'private, max-age=30' });
  }

  return send(res, 404, { error: 'not found' });
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && okOrigin(origin)) { res.setHeader('Access-Control-Allow-Origin', origin); res.setHeader('Vary', 'Origin'); }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return send(res, 204, '');
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  const url = new URL(req.url, 'http://x');
  try { await route(req, res, url, ip); }
  catch (e) {
    const code = e.status || (e.code === 413 ? 413 : e.rpc ? 400 : 502);
    if (!res.headersSent) send(res, code, { error: e.rpc ? e.rpc.message : (e.status || code === 413) ? e.message : 'server busy, try again' });
    // endpoint only (e.g. /v1/brc20): never the address, txid or inscription being asked about
    if (!e.rpc && !e.status) console.error(new Date().toISOString(), url.pathname.split('/').slice(0, 3).join('/'), e.message.replace(/bc1[0-9a-z]{20,}/gi, 'ADDR'));
  }
});

// ---------------------------------------------------------------- silent payments scan over WebSocket -> Frigate
const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });
const openScans = new Map();                                    // ip -> count
// shhhhh wallets are new (restore is off): no scan may start before the launch block. Keeps every scan small.
const MIN_START = Number(process.env.MIN_START || 968000);
const HEAVY_MAX = 2, HEAVY_BLOCKS = 20000;                       // scans over > 20k blocks use all 16 cores: at most 2 at once
let heavyScans = 0;
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://x');
  const origin = req.headers.origin;
  if (url.pathname !== '/v1/sp' || (origin && !okOrigin(origin))) { socket.destroy(); return; }
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  if ((openScans.get(ip) || 0) >= 3 || !allow(ip, 5)) { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, (ws) => {
    openScans.set(ip, (openScans.get(ip) || 0) + 1);
    let frigate = null, buf = '', id = 0, started = false, heavy = false, sub = null, closed = false, entries = 0, reported = false;
    // Frigate keeps scanning after a disconnect unless told to stop: unsubscribe first, then hang up
    const close = () => {
      if (closed) return; closed = true;
      openScans.set(ip, Math.max(0, (openScans.get(ip) || 1) - 1)); if (heavy) { heavy = false; heavyScans--; }
      if (!frigate) return;
      try { if (sub && !frigate.destroyed) frigate.write(JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'blockchain.silentpayments.unsubscribe', params: sub }) + '\n'); } catch {}
      setTimeout(() => { try { frigate.destroy(); } catch {} }, 1500);
    };
    ws.on('close', close);
    ws.on('message', async (data) => {
      if (started) return;
      let msg; try { msg = JSON.parse(data); } catch { return ws.close(1003, 'bad message'); }
      const range = typeof msg.start === 'string' && /^\d{1,7}-\d{1,7}$/.test(msg.start) ? msg.start.split('-').map(Number) : null;
      if (!HEX64.test(msg.scan || '') || !/^0[23][0-9a-f]{64}$/.test(msg.spend || '') || !(range ? range[0] <= range[1] : Number.isInteger(msg.start) && msg.start >= 0)) return ws.close(1003, 'need {scan, spend, start}');
      started = true;
      if ((range ? range[0] : msg.start) < MIN_START) {
        ws.send(JSON.stringify({ type: 'error', error: `Scans start at block ${MIN_START.toLocaleString('en-US')} or later.` }));
        return ws.close(1008, 'start too early');
      }
      try {
        const tip = await cached('tip', 10000, () => rpc('getblockcount'));
        if ((range ? range[1] - range[0] : tip - msg.start) > HEAVY_BLOCKS) {
          if (heavyScans >= HEAVY_MAX) { ws.send(JSON.stringify({ type: 'error', error: 'The node is busy with other full scans. Try again in a few minutes, or scan from a later block.' })); return ws.close(1013, 'busy'); }
          heavy = true; heavyScans++;
        }
      } catch { return ws.close(1011, 'node unavailable'); }
      console.log(`scan ${range ? range.join('-') : msg.start + '-tip'}${heavy ? ' (heavy)' : ''}`);   // block range only: no keys, no addresses
      frigate = net.connect(FRIGATE);
      const rpcF = (method, params) => frigate.write(JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }) + '\n');
      frigate.on('connect', () => rpcF('server.version', ['shhhhh-bridge', '1.4']));
      // long-lived (live) subscriptions: ping Frigate (idle timeout 600 s) and the browser (proxies drop idle sockets)
      const keep = setInterval(() => { try { rpcF('server.ping', []); ws.ping(); } catch {} }, 45000);
      ws.on('close', () => clearInterval(keep));
      frigate.on('data', (d) => {
        buf += d;
        if (buf.length > 50_000_000) return ws.close(1009, 'too much data');
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i); buf = buf.slice(i + 1);
          let m; try { m = JSON.parse(line); } catch { continue; }
          if (m.method === 'blockchain.silentpayments.subscribe') {
            // params come as [subscription, progress, history] (or as a named object)
            const p = m.params || {}, progress = Array.isArray(p) ? p[1] : p.progress, hist = (Array.isArray(p) ? p[2] : p.history) || [];
            entries += hist.length;
            if (progress === 1 && !reported) { reported = true; console.log(`scan ${msg.start} done: ${entries} entries`); }   // counts only
            ws.send(JSON.stringify({ type: 'history', progress, history: hist.map((h) => ({ height: h.height, txid: h.tx_hash, tweak: h.tweak_key })) }));
          } else if (m.id === 1) { sub = [msg.scan, msg.spend]; rpcF('blockchain.silentpayments.subscribe', [msg.scan, msg.spend, msg.start]); }
          else if (m.id === 2) ws.send(JSON.stringify(m.error ? { type: 'error', error: m.error.message } : { type: 'subscribed', start: m.result.start_height }));
        }
      });
      frigate.on('error', () => ws.close(1011, 'scanner unavailable'));
      frigate.on('close', () => ws.close(1011, 'scanner closed'));
    });
    setTimeout(() => { if (!started) ws.close(1008, 'no request'); }, 15000);
  });
});

server.listen(PORT, '127.0.0.1', () => console.log(`shhhhh bridge on 127.0.0.1:${PORT}`));
