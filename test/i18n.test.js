import { DEFAULT_LANGUAGE, LANGUAGES, normalizeLanguage, translate } from '../src/i18n.js';

let pass = 0, fail = 0;
const ok = (condition, name) => { if (condition) pass++; else { fail++; console.log('FAIL', name); } };

ok(DEFAULT_LANGUAGE === 'en' && normalizeLanguage(null) === 'en', 'English is the default language');
ok(normalizeLanguage('unknown') === 'en', 'unknown language safely falls back to English');
ok(LANGUAGES.length === 19 && new Set(LANGUAGES.map((language) => language.code)).size === 19, 'nineteen unique display languages are available');
ok(translate('Inscriptions', 'zh-CN') === '铭文', 'Simplified Chinese catalog works');
ok(translate('Inscriptions', 'zh-TW') === '銘文', 'Traditional Chinese catalog works');
ok(translate('Inscriptions', 'ja') === 'インスクリプション', 'Japanese catalog works');
ok(translate('Inscriptions', 'ko') === '인스크립션', 'Korean catalog works');
ok(translate('Inscriptions', 'ru') === 'Инскрипции', 'Russian catalog works');
ok(translate('Call contract', 'es') === 'Llamar contrato', 'European and South American catalog works');
ok(translate('Call contract', 'th') === 'เรียกสัญญา', 'Southeast Asian catalog works');
ok(translate('Bitcoin Ordinals and BRC-20', 'fil') === 'Bitcoin Ordinals and BRC-20', 'unreviewed copy falls back to canonical English');
ok(translate('4 bytes', 'vi') === '4 byte', 'dynamic byte labels are localized');
ok(translate('Market', 'zh-CN') === '市场' && translate('Market unavailable', 'zh-CN') === '市场暂不可用', 'market surface is localized in Simplified Chinese');
ok(translate('Protect this wallet', 'ja') === 'このウォレットを保護' && translate('Hide password', 'ja') === 'パスワードを隠す', 'password setup is localized in Japanese');
ok(translate('Sell an inscription', 'es') === 'Vender una inscripción' && translate('Confirm & buy', 'es') === 'Confirmar y comprar', 'market actions are localized in a regional pack');
ok(translate('Explore (1,234)', 'zh-TW') === '探索 (1,234)', 'dynamic market listing count is localized');
ok(LANGUAGES.filter((language) => language.code !== 'en').every((language) => translate('Market', language.code) !== 'Market' && translate('Show password', language.code) !== 'Show password'), 'all non-English catalogs cover market and password setup');
ok(translate('Demo listings', 'zh-CN') === '演示挂单' && translate('Got it', 'zh-CN') === '知道了', 'demo market is localized in Simplified Chinese');
ok(translate('Demo listings', 'ja') === 'デモ出品' && translate('Got it', 'ja') === '了解', 'demo market is localized in Japanese');
ok(LANGUAGES.filter((language) => language.code !== 'en').every((language) => translate('Demo listings', language.code) !== 'Demo listings' && translate('Got it', language.code) !== 'Got it'), 'all non-English catalogs cover demo listings and tutorial');
ok(translate('4-byte', 'zh-CN') === '4 字节' && translate('Demo catalog', 'zh-CN') === '演示目录', 'ticker-length market is localized in Simplified Chinese');
ok(translate('4-byte', 'ja') === '4バイト' && translate('Live listings', 'ja') === '実際の出品', 'ticker-length market is localized in Japanese');
ok(LANGUAGES.filter((language) => language.code !== 'en').every((language) =>
  translate('4, 5 and 6-byte BRC-20 transfer market', language.code) !== '4, 5 and 6-byte BRC-20 transfer market'
  && translate('No listings in this category', language.code) !== 'No listings in this category'
  && translate('Demo catalog', language.code) !== 'Demo catalog'), 'all non-English catalogs cover the 4/5/6-byte market');
ok(translate('Live markets', 'zh-CN') === '实时市场' && translate('Floor price', 'zh-CN') === '地板价' && translate('Price: low to high', 'zh-CN') === '价格：从低到高', 'two-level market browser is localized in Simplified Chinese');
ok(translate('Market server pending', 'zh-TW') === '市場伺服器待部署' && translate('Back to markets', 'zh-TW') === '返回市場', 'deployment and detail navigation are localized in Traditional Chinese');
ok(translate('Demo markets', 'ja') === 'デモマーケット' && translate('Unit price', 'ja') === '単価' && translate('Total price', 'ja') === '合計価格', 'market detail is localized in Japanese');
ok(translate('Verified BRC-20 transfer listings', 'ko') === '검증된 BRC-20 전송 등록' && translate('Manage', 'ko') === '관리', 'market listings are localized in Korean');
const marketBrowserKeys = ['BTC fees', 'Market server pending', 'Demo mode is available until deployment.', 'Live markets', 'Verified BRC-20 transfer listings',
  'Demo markets', 'Layout preview · not on-chain', 'Token / listings', 'Floor price', 'How trading works',
  'Verify · choose fee · review · atomic settlement', 'Back to markets', 'Lowest total', 'Active signed offers', 'Demo orders',
  'Listed amount', '24h volume', 'No verified trade history yet', 'Price: low to high', 'Price: high to low', 'Unit price', 'Total price', 'Manage'];
ok(LANGUAGES.filter((language) => language.code !== 'en').every((language) =>
  marketBrowserKeys.every((key) => translate(key, language.code) !== key)), 'all non-English catalogs cover every new market browser and detail key');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
