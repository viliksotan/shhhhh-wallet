// Package the wallet as a private Chrome extension (Manifest V3) for loading by hand (chrome://extensions,
// "Load unpacked"). Not for the Chrome Web Store. Output: ./extension/ (+ .zip)
//   node tools/build-extension.mjs
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUT = path.join(ROOT, 'extension' + (process.argv.includes('--store') ? '-store' : ''));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json')));

execFileSync('node', ['tools/build.mjs'], { cwd: ROOT, stdio: 'ignore' });
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'icons'), { recursive: true });

// popup page: same app, fixed popup size (Chrome popups are at most 800 x 600)
let html = fs.readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8');
html = html.replace('</style>', 'html,body{width:390px;min-height:600px;overflow-x:hidden}#app{min-height:600px}.shell{height:600px;min-height:0;overflow:hidden}.shell .content{overflow-y:auto;padding-bottom:16px;scrollbar-width:none}.shell .content::-webkit-scrollbar,html::-webkit-scrollbar,.sheet::-webkit-scrollbar{display:none}html,.sheet{scrollbar-width:none}.shell .tabs{position:static;flex:none}.sheet-bg{position:fixed}\n</style>');
fs.writeFileSync(path.join(OUT, 'index.html'), html);
// side panel page: same app, full height of the panel, any width
let panel = fs.readFileSync(path.join(ROOT, 'dist/index.html'), 'utf8').replace('<html', '<html data-panel="1"');
panel = panel.replace('</style>', 'html,body{height:100%;overflow:hidden}#app{height:100vh}.shell{height:100vh;min-height:0;overflow:hidden}.shell .content{overflow-y:auto;padding-bottom:16px;scrollbar-width:none}.shell .content::-webkit-scrollbar,html::-webkit-scrollbar,.sheet::-webkit-scrollbar{display:none}html,.sheet{scrollbar-width:none}.shell .tabs{position:static;flex:none}.sheet-bg{position:fixed}.gate{min-height:100vh}\n</style>');
fs.writeFileSync(path.join(OUT, 'panel.html'), panel);
// background: re-applies the user's "icon opens the side panel" choice when Chrome starts (no network, no keys)
// --store: Chrome Web Store build (no local-only mint page access; written next to the normal zip as -store.zip)
const STORE = process.argv.includes('--store');
const LOCAL_SITES = STORE ? [] : [
  'http://127.0.0.1:8364',
  'http://127.0.0.1:8365',
  'http://127.0.0.1:8366',
  'http://127.0.0.1:8367',
  'http://127.0.0.1:8372',
  'http://127.0.0.1:8375',
];
const SITES = [...LOCAL_SITES, 'https://shhhhh.site', 'https://shroud.world'];
fs.writeFileSync(path.join(OUT, 'background.js'), `const apply = async () => {
  const on = !!(await chrome.storage.local.get('sidePanelMode')).sidePanelMode;
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: on });
  await chrome.action.setPopup({ popup: on ? '' : 'index.html' });
};
chrome.runtime.onStartup.addListener(apply);
chrome.runtime.onInstalled.addListener(apply);
// site requests (window.shhhhh): only from the allow list; the wallet window shows them and answers the tab itself
const SITES = ${JSON.stringify(SITES)};
// Serialize reservations so two tabs cannot overwrite the single approval slot. A fresh request stays reserved
// until the approval window answers/removes it; an abandoned request expires after ten minutes.
let requestQueue = Promise.resolve();
const reserve = (req) => {
  const turn = requestQueue.then(async () => {
    const current = (await chrome.storage.session.get('shhhhhReq')).shhhhhReq;
    if (current && Date.now() - current.at <= 10 * 60000) return false;
    await chrome.storage.session.set({ shhhhhReq: req });
    return true;
  });
  requestQueue = turn.catch(() => {});
  return turn;
};
const release = async (req) => {
  const current = (await chrome.storage.session.get('shhhhhReq')).shhhhhReq;
  if (current && current.id === req.id && current.at === req.at) await chrome.storage.session.remove('shhhhhReq');
};
chrome.runtime.onMessage.addListener((msg, sender, send) => {
  if (!msg || msg.type !== 'shhhhh-request') return;
  const origin = sender.origin || (sender.url && new URL(sender.url).origin);
  if (!sender.tab || !SITES.includes(origin)) { send({ error: 'This site is not allowed to use the shhhhh wallet' }); return; }
  if (msg.method === 'disconnect') {
    chrome.storage.local.get('shhhhhSites').then(({ shhhhhSites: list }) => chrome.storage.local.set({ shhhhhSites: (list || []).filter((site) => site !== origin) }))
      .then(() => send({ result: { disconnected: true } }), (e) => send({ error: String(e && e.message || e) }));
    return true;
  }
  if (!['connect', 'sendBitcoin', 'inscribe', 'listForSale', 'cancelListing', 'buyListing', 'myItems', 'stake', 'unstake', 'proveHolding'].includes(msg.method)) { send({ error: 'Unknown request' }); return; }
  if (msg.method === 'proveHolding' && !['http://127.0.0.1:8375', 'https://shroud.world'].includes(origin)) { send({ error: 'Proof of holding works only from The Cartographer on shroud.world' }); return; }
  if ((msg.method === 'stake' || msg.method === 'unstake') && origin !== 'http://127.0.0.1:8372') { send({ error: 'Staking works only from The Anchorage on this computer' }); return; }
  const req = { id: String(msg.id).slice(0, 64), method: msg.method, params: msg.params || {}, origin, tabId: sender.tab.id, at: Date.now() };
  // open at the top right of the browser window the request came from (like other wallets)
  const W = 400, H = 660;
  reserve(req)
    .then((available) => {
      if (!available) throw new Error('Another wallet request is already waiting for approval');
      return chrome.windows.get(sender.tab.windowId).catch(() => null);
    })
    .then((win) => {
      const base = { url: 'index.html?req=1', type: 'popup', width: W, height: H, focused: true };
      const at = win && win.width ? { left: Math.max(0, win.left + win.width - W - 16), top: Math.max(0, win.top + 80) } : {};
      return chrome.windows.create({ ...base, ...at }).catch(() => chrome.windows.create(base));   // position refused: default spot
    })
    .then(() => send({ ok: true }), async (e) => { await release(req).catch(() => {}); send({ error: String(e && e.message || e) }); });
  return true;
});
`);
// content scripts: inpage.js (page world) defines window.shhhhh; content.js relays to the extension and back
fs.writeFileSync(path.join(OUT, 'inpage.js'), `(() => {
  if (window.shhhhh) return;
  let n = 0; const wait = new Map();
  window.addEventListener('message', (ev) => {
    const d = ev.data; if (ev.source !== window || !d || d.target !== 'shhhhh-page' || !wait.has(d.id)) return;
    const w = wait.get(d.id); wait.delete(d.id); d.error ? w.rej(new Error(d.error)) : w.res(d.result);
  });
  const call = (method, params) => new Promise((res, rej) => { const id = 'r' + Date.now() + '-' + (++n); wait.set(id, { res, rej });
    window.postMessage({ target: 'shhhhh-content', id, method, params }, location.origin); });
  window.shhhhh = Object.freeze({
    isShhhhh: true,
    connect: () => call('connect'),
    disconnect: () => call('disconnect'),
    sendBitcoin: (address, sats, feeRate) => call('sendBitcoin', { address, sats, feeRate }),
    inscribe: (items, feeRate) => call('inscribe', { items, feeRate }),
    listForSale: (inscriptionId, price) => call('listForSale', { inscriptionId, price }),
    cancelListing: (offer) => call('cancelListing', { offer }),
    buyListing: (offer, feeRate) => call('buyListing', { offer, feeRate }),
    myItems: (ids) => call('myItems', { ids }),
    stake: (tick, amt, unlock) => call('stake', { tick, amt, unlock }),
    unstake: (tick, amt, unlock) => call('unstake', { tick, amt, unlock }),
    proveHolding: (tick, challenge) => call('proveHolding', { tick, challenge }),
  });
  window.dispatchEvent(new Event('shhhhh#initialized'));
})();
`);
fs.writeFileSync(path.join(OUT, 'content.js'), `window.addEventListener('message', (ev) => {
  const d = ev.data; if (ev.source !== window || !d || d.target !== 'shhhhh-content') return;
  const back = (error) => window.postMessage({ target: 'shhhhh-page', id: d.id, error }, location.origin);
  chrome.runtime.sendMessage({ type: 'shhhhh-request', id: d.id, method: d.method, params: d.params })
    .then((r) => { if (r && r.error) back(r.error); else if (r && r.result !== undefined) window.postMessage({ target: 'shhhhh-page', id: d.id, result: r.result }, location.origin); }, (e) => back(String(e && e.message || e)));
});
chrome.runtime.onMessage.addListener((m) => {
  if (m && m.type === 'shhhhh-response') window.postMessage({ target: 'shhhhh-page', id: m.id, result: m.result, error: m.error }, location.origin);
});
`);
for (const f of ['app.js', 'logo.png', 'favicon.png']) fs.copyFileSync(path.join(ROOT, 'dist', f), path.join(OUT, f));

// icons from the shhhhh logo
for (const n of [16, 32, 48, 128]) {
  const source = path.join(ROOT, 'dist/logo.png');
  const target = path.join(OUT, 'icons', `icon${n}.png`);
  if (process.platform === 'darwin') {
    execFileSync('sips', ['-z', String(n), String(n), source, '--out', target], { stdio: 'ignore' });
  } else if (process.platform === 'win32') {
    const script = [
      'Add-Type -AssemblyName System.Drawing',
      '$source = [Drawing.Image]::FromFile($env:SHHHHH_ICON_SOURCE)',
      '$bitmap = New-Object Drawing.Bitmap $source, ([Drawing.Size]::new([int]$env:SHHHHH_ICON_SIZE, [int]$env:SHHHHH_ICON_SIZE))',
      '$bitmap.Save($env:SHHHHH_ICON_TARGET, [Drawing.Imaging.ImageFormat]::Png)',
      '$bitmap.Dispose()',
      '$source.Dispose()',
    ].join('; ');
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
      env: { ...process.env, SHHHHH_ICON_SOURCE: source, SHHHHH_ICON_TARGET: target, SHHHHH_ICON_SIZE: String(n) },
      stdio: 'ignore',
    });
  } else {
    execFileSync('convert', [source, '-resize', `${n}x${n}`, target], { stdio: 'ignore' });
  }
}

const manifest = {
  manifest_version: 3,
  name: 'shhhhh wallet',
  description: 'Silent payments wallet for BTC, BRC-20 and inscriptions. Spending keys stay in this browser.',
  // always increasing (the Chrome Web Store refuses a lower version): 1.<days since 2026-01-01>.<minute of the day, UTC>
  version: `1.${Math.floor((Date.now() - Date.UTC(2026, 0, 1)) / 864e5)}.${Math.floor(Date.now() / 6e4) % 1440}`,
  action: { default_popup: 'index.html', default_title: 'shhhhh wallet',
            default_icon: { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' } },
  icons: { 16: 'icons/icon16.png', 32: 'icons/icon32.png', 48: 'icons/icon48.png', 128: 'icons/icon128.png' },
  // only what the wallet talks to: the shhhhh node, and public explorers for the BTC price and the deposit address
  permissions: ['storage', 'sidePanel'],
  side_panel: { default_path: 'panel.html' },
  background: { service_worker: 'background.js' },
  host_permissions: ['https://node.shhhhh.site/*', 'https://mempool.space/*', 'https://blockstream.info/*'],
  content_scripts: [
    { matches: [...LOCAL_SITES.map((o) => o + '/*'), 'https://shhhhh.site/mint*', 'https://shhhhh.site/inscribe*', 'https://shhhhh.site/auction*', 'https://shhhhh.site/market*', 'https://shroud.world/*'], js: ['inpage.js'], world: 'MAIN', run_at: 'document_start' },
    { matches: [...LOCAL_SITES.map((o) => o + '/*'), 'https://shhhhh.site/mint*', 'https://shhhhh.site/inscribe*', 'https://shhhhh.site/auction*', 'https://shhhhh.site/market*', 'https://shroud.world/*'], js: ['content.js'], run_at: 'document_start' },
  ],
  content_security_policy: { extension_pages: "script-src 'self'; object-src 'self'; connect-src https://node.shhhhh.site wss://node.shhhhh.site https://mempool.space https://blockstream.info; img-src 'self' https://node.shhhhh.site data:" },
};
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));

const zip = OUT + '.zip';
fs.rmSync(zip, { force: true });
if (process.platform === 'win32') execFileSync('tar.exe', ['-a', '-c', '-f', zip, '-C', OUT, '.']);
else execFileSync('zip', ['-qr', zip, '.'], { cwd: OUT });
console.log('extension folder:', OUT);
console.log('zip:', zip, (fs.statSync(zip).size / 1024).toFixed(0) + ' KB');
console.log('version', manifest.version, '(app ' + pkg.version + ')');
