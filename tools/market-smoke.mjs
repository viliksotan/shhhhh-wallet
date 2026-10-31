const base = String(process.argv[2] || 'https://node.shhhhh.site').replace(/\/$/, '');

async function get(path) {
  const response = await fetch(base + path, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  const text = await response.text(); let body; try { body = JSON.parse(text); } catch { body = text; }
  if (!response.ok) throw new Error(`${path} returned ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  return body;
}

try {
  const [book, policy] = await Promise.all([
    get('/v1/market/listings?cursor=0&limit=1'),
    get('/v1/market/fee-policy'),
  ]);
  if (!Array.isArray(book.listings) || !Number.isInteger(book.total)) throw new Error('listings response has the wrong shape');
  if (policy.network !== 'bitcoin-mainnet' || policy.minerAsset !== 'BTC' || policy.btc?.enabled !== true) throw new Error('fee policy is unsafe or incomplete');
  console.log(`market API ready: ${base} (${book.total} active listings, miner fee ${policy.minerAsset})`);
} catch (error) {
  console.error(`market API NOT ready: ${base}\n${error.message}`);
  process.exit(1);
}
