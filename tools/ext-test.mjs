// Extension test: loads the built extension (./extension) into Chrome for Testing
// (branded Chrome no longer loads unpacked extensions from the command line) and checks extension-only features.
//   node tools/build-extension.mjs && node tools/ext-test.mjs [outDir]
import { spawn } from 'node:child_process'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
const OUT = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'shhhhh-ext-'));
const EXT = process.env.EXT || fileURLToPath(new URL('../extension', import.meta.url));
fs.mkdirSync(OUT, { recursive: true });
const browserCandidates = process.platform === 'win32'
  ? [
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google/Chrome for Testing/Application/chrome.exe'),
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    ]
  : process.platform === 'darwin'
    ? fs.existsSync(path.join(os.homedir(), '.cache/shhhhh-cft/chrome'))
      ? fs.readdirSync(path.join(os.homedir(), '.cache/shhhhh-cft/chrome')).map((d) => path.join(os.homedir(), `.cache/shhhhh-cft/chrome/${d}/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`))
      : []
    : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
const CFT = process.env.CHROME || browserCandidates.filter(Boolean).find((candidate) => fs.existsSync(candidate));
if (!CFT) throw new Error('Chrome/Edge not found. Set CHROME to a Chromium executable.');
const prof = fs.mkdtempSync(path.join(OUT, 'prof-'));
const dapp = createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><title>shhhhh dapp test</title>'); });
await new Promise((resolve, reject) => { dapp.once('error', reject); dapp.listen(8364, '127.0.0.1', resolve); });
const chrome = spawn(CFT, ['--headless=new', '--remote-debugging-port=9334', '--user-data-dir=' + prof, '--load-extension=' + EXT, '--disable-extensions-except=' + EXT, '--window-size=1400,900', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const list = async () => { for (let i = 0; i < 50; i++) { try { return await (await fetch('http://127.0.0.1:9334/json/list')).json(); } catch { await sleep(200); } } return []; };
async function attach(t) {
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await Promise.race([new Promise((r) => (ws.onopen = r)), sleep(8000).then(() => { throw new Error('attach timeout'); })]);
  let id = 0; const p = new Map();
  ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && p.has(m.id)) { const x = p.get(m.id); p.delete(m.id); m.error ? x.rej(new Error(m.error.message)) : x.res(m.result); } };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; p.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const js = async (e) => { const r = await send('Runtime.evaluate', { expression: e, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300)); return r.result.value; };
  const waitFor = async (e, ms = 60000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await js(e)) return; } catch {} await sleep(250); } throw new Error('timeout ' + e); };
  await send('Runtime.enable'); return { js, waitFor };
}
const newTab = async (url) => (await (await fetch('http://127.0.0.1:9334/json/new?' + url, { method: 'PUT' })).json());
let fail = 0; const ok = (c, n) => { console.log((c ? 'ok   ' : 'FAIL ') + n); if (!c) fail++; };
try {
  let ID = null;
  for (let i = 0; i < 50 && !ID; i++) {
    const worker = (await list()).find((target) => target.type === 'service_worker' && /chrome-extension:\/\/[^/]+\/background\.js$/.test(target.url));
    if (worker) ID = new URL(worker.url).hostname; else await sleep(200);
  }
  if (!ID) throw new Error('extension service worker did not start');
  // a wallet in the extension
  const w = await attach(await newTab(`chrome-extension://${ID}/index.html`));
  await w.waitFor(`!!document.querySelector('.gate')`);
  await w.js(`[...document.querySelectorAll('button')].find(b => b.textContent.includes('Create a new wallet')).click()`);
  await w.js(`document.getElementById('saved').checked = true`); await w.js(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Continue').click()`);
  for (const id of ['pw1', 'pw2']) await w.js(`(() => { const e = document.getElementById('${id}'); e.value = 'test-password-1'; e.dispatchEvent(new Event('input')); })()`);
  await w.js(`[...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Create wallet').click()`);
  await w.waitFor(`!!document.getElementById('sync')`, 30000);
  ok(true, 'wallet created in the extension');

  // page-world bridge: every public API is injected, and no-window disconnect replies immediately
  const page = await attach(await newTab('http://127.0.0.1:8364/'));
  await page.waitFor(`!!window.shhhhh`);
  const methods = await page.js(`Object.keys(window.shhhhh).sort()`);
  const expected = ['buyListing', 'cancelListing', 'connect', 'disconnect', 'inscribe', 'isShhhhh', 'listForSale', 'myItems', 'proveHolding', 'sendBitcoin', 'stake', 'unstake'].sort();
  ok(JSON.stringify(methods) === JSON.stringify(expected), 'all 11 site APIs injected on an allowed origin');
  ok((await page.js(`window.shhhhh.disconnect()`)).disconnected === true, 'disconnect returns without opening an approval window');

  // the background keeps one approval reservation: a second tab/request cannot replace what the user sees
  await page.js(`(() => {
    window.__firstRequest = null; window.__secondRequest = null;
    window.shhhhh.connect().then(() => window.__firstRequest = 'ok', (e) => window.__firstRequest = e.message);
    window.shhhhh.connect().then(() => window.__secondRequest = 'ok', (e) => window.__secondRequest = e.message);
    return true;
  })()`);
  await page.waitFor(`window.__secondRequest !== null`);
  ok(/Another wallet request/.test(await page.js(`window.__secondRequest`)), 'concurrent request cannot overwrite the approval slot');
  let approval = null;
  for (let i = 0; i < 40 && !approval; i++) { approval = (await list()).find((target) => target.type === 'page' && target.url.includes('/index.html?req=1')); if (!approval) await sleep(200); }
  if (!approval) throw new Error('approval window did not open');
  const approvalPage = await attach(approval);
  await approvalPage.waitFor(`[...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Cancel')`);
  await approvalPage.js(`[...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Cancel').click()`);
  await page.waitFor(`window.__firstRequest !== null`);
  ok((await page.js(`window.__firstRequest`)) === 'Request rejected', 'approval response returns to the original request');

  // side panel: switching it Off (here from the popup page) closes a side panel that is open
  await w.js(`chrome.storage.local.set({ sidePanelMode: true })`);
  await attach(await newTab(`chrome-extension://${ID}/panel.html`)).then((pn) => pn.waitFor(`!!document.getElementById('sync')`, 30000));
  ok(true, 'side panel page open (same unlocked wallet)');
  await w.js(`[...document.querySelectorAll('.tab')].find(b => /Settings/.test(b.textContent)).click()`); await sleep(400);
  await w.js(`[...document.querySelectorAll('button')].find(b => /Side panel/.test(b.textContent)).click()`); await sleep(400);
  await w.js(`[...document.querySelectorAll('.content button')].find(b => /^Popup/.test(b.textContent.trim())).click()`);
  let gone = false; for (let i = 0; i < 20 && !gone; i++) { await sleep(300); gone = !(await list()).some((t) => t.url.endsWith('/panel.html')); }
  ok(gone, 'switching Side panel to Off closes the open side panel');
  ok((await w.js(`chrome.storage.local.get('sidePanelMode').then((x) => x.sidePanelMode)`)) === false, 'setting saved as Off');
} catch (e) { ok(false, e.message); }
chrome.kill(); dapp.close(); await sleep(800); try { fs.rmSync(prof, { recursive: true, force: true }); } catch {}
console.log(fail ? fail + ' failed' : 'all passed'); process.exit(fail ? 1 : 0);
