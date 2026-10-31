import { cleanMarketAsset, marketAssetCategory, parseMarketAsset, sameMarketAsset } from '../src/market-asset.js';

let pass = 0, fail = 0;
const ok = (condition, name) => { if (condition) pass++; else { fail++; console.log('FAIL', name); } };
const transfer = (tick, amt = '1000') => JSON.stringify({ p: 'brc-20', op: 'transfer', tick, amt });

const four = parseMarketAsset(transfer('ORDI'));
const five = parseMarketAsset(transfer('pizza', '10.50'));
const six = parseMarketAsset(transfer('shhhhh', '250000'));
ok(four.kind === 'brc20' && four.tick === 'ordi' && four.tickerBytes === 4, '4-byte transfer is normalized and classified');
ok(five.kind === 'brc20' && five.tickerBytes === 5 && five.amount === '10.50', '5-byte transfer preserves its decimal amount');
ok(six.kind === 'brc20' && six.tickerBytes === 6 && marketAssetCategory(six) === '6', '6-byte transfer enters the extended category');
ok(parseMarketAsset(transfer('abc')).kind === 'ordinal' && parseMarketAsset(transfer('abcdefg')).kind === 'ordinal', 'unsupported ticker lengths remain ordinary inscriptions');
ok(parseMarketAsset(JSON.stringify({ p: 'brc-20', op: 'mint', tick: 'ordi', amt: '1' })).kind === 'ordinal', 'mint documents are never presented as transferable inventory');
ok(parseMarketAsset('{bad json').kind === 'ordinal' && parseMarketAsset(transfer('ordi', '0')).kind === 'ordinal', 'bad JSON and zero amounts are rejected');
ok(parseMarketAsset(transfer('éé')).tickerBytes === 4 && parseMarketAsset(transfer('e\u0301e\u0301')).tickerBytes === 4, 'ticker classification uses normalized UTF-8 bytes');
ok(parseMarketAsset(transfer('😀')).tickerBytes === 4, 'a 4-byte Unicode ticker is not mistaken for two UTF-16 characters');
ok(cleanMarketAsset({ ...six, tickerBytes: 4 }).tickerBytes === 6, 'untrusted metadata cannot forge its ticker namespace');
ok(sameMarketAsset(four, { kind: 'brc20', tick: 'ordi', amount: '1000' }) && !sameMarketAsset(four, five), 'asset comparison binds ticker and amount');
ok(marketAssetCategory({ kind: 'ordinal' }) === 'other', 'unknown inscriptions never enter a 4/5/6 category');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
