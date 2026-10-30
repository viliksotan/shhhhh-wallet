// Bundle the wallet into ./dist (static files: index.html, app.js, worker.js, logo).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
await build({ entryPoints: { app: path.join(root, 'src/app.js'), worker: path.join(root, 'src/worker.js') }, bundle: true, format: 'esm', target: 'es2022',
              minify: true, sourcemap: false, outdir: out, legalComments: 'none' });
fs.copyFileSync(path.join(root, 'web/index.html'), path.join(out, 'index.html'));
fs.copyFileSync(path.join(root, 'web/logo.png'), path.join(out, 'logo.png'));
fs.copyFileSync(path.join(root, 'web/favicon.png'), path.join(out, 'favicon.png'));
for (const f of fs.readdirSync(out)) console.log(f.padEnd(14), (fs.statSync(path.join(out, f)).size / 1024).toFixed(0) + ' KB');
