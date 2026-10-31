# shhhhh wallet

A private Bitcoin wallet for Chrome, built on **silent payments** ([BIP352](https://github.com/bitcoin/bips/blob/master/bip-0352.mediawiki)).
Hold and send BTC, BRC-20 tokens and inscriptions. Spending keys never leave your browser.

Website: [shhhhh.site](https://shhhhh.site) · Privacy policy: [shhhhh.site/privacy](https://shhhhh.site/privacy)

> **Beta.** Use small amounts only and keep your 12 words written down on paper.

## How it works

- **One reusable address (sp1).** Every payment to you lands on a new, unlinkable taproot address.
- **Spending keys stay local.** The 12-word phrase is created in the browser and stored encrypted with your password (AES-GCM, PBKDF2). Sync data is encrypted too. The scan private key is shared with the selected scan node as described below; it cannot spend funds.
- **Finding payments.** Silent payments can only be found with the scan key, so the wallet asks a node running [Frigate](https://github.com/sparrowwallet/frigate) to scan for them. The scan key cannot spend; every candidate the node returns is checked again locally with your keys. The selected node can nevertheless link incoming payments to this wallet, so it is part of the privacy trust model.
- **Inscriptions, BRC-20 and BRC2.0.** A built-in [inscription center](docs/inscription-center.md) creates text/images, transfers existing BRC-20 balances and calls existing BRC2.0 contracts. Issuance and contract-deployment controls are currently hidden. Coins are checked with [ord](https://github.com/ordinals/ord) before they are ever used as fee money.
- **Built-in inscription market.** Signed offers stay non-custodial, and a purchase pays the seller and transfers the inscription atomically in one Bitcoin transaction. The bridge verifies each listing against Bitcoin Core and ord; BRC-20 transfers are additionally checked against the indexer and browsable by their 4-, 5- or 6-byte ticker namespace. See [`docs/market.md`](docs/market.md).
- **19 interface languages.** English is the default, with Chinese (Simplified/Traditional), Japanese, Korean, Spanish, Brazilian Portuguese, Russian, French, German, Italian, Dutch, Polish, Turkish, Indonesian, Vietnamese, Thai, Malay and Filipino available in Settings.
- **Deposit address.** A normal BIP86 taproot address from the same 12 words, for exchanges and other wallets.
- **Fair Batch Mode.** Markets can hide signed orders during a commit window, reveal them together and clear them without arrival-time priority. Verified time-locked stake raises quotas by square root, with supply and price circuit breakers. See [`docs/fair-batch.md`](docs/fair-batch.md).

## Layout

| Path | What |
|---|---|
| `src/` | The wallet: UI (`app.js`), keys and vault (`keys.js`), BIP352 (`sp.js`, `scan.js`), sync (`node.js`), transactions (`send.js`, `inscribe.js`, `market.js`, `stake.js`), fair batching (`fair-market.js`) |
| `web/` | The page shell |
| `bridge/` | The server between the wallet and Bitcoin Core, Frigate, ord, the BRC-20 indexer and the signed market book |
| `tools/` | Build scripts and browser tests |
| `test/` | Unit tests (incl. the official BIP352 test vectors) and regtest tests |

## Build

```sh
npm install
node tools/build.mjs              # web build -> dist/
node tools/build-extension.mjs    # Chrome extension -> extension/ (+ .zip)
```

Load it in Chrome: `chrome://extensions` → Developer mode → **Load unpacked** → choose `extension/`.

## Test

```sh
node test/sp.test.js              # BIP352 vectors
node test/scan.test.js
node test/keys.test.js
node test/features.test.js        # inscription, marketplace and staking builders
node test/i18n.test.js            # language catalog, fallback and regional coverage
node test/fair-market.test.js     # commit/reveal, quotas, circuit breakers and batch clearing
node test/market-asset.test.js    # BRC-20 transfer parsing and 4/5/6-byte classification
node test/market-store.test.js    # listing validation, cancellation and restart recovery
node tools/market-smoke.mjs       # production market API readiness (must pass before release)
node tools/dev-server.mjs &       # http://127.0.0.1:8362
node tools/e2e.mjs                # full UI browser test (Chrome/Edge)
node tools/ext-test.mjs           # extension + page API test (Chrome/Edge)
```

Regtest tests (`test/*.regtest.mjs`) need `bitcoind` (and `ord` for inscriptions) on your PATH, or `BITCOIN_BIN` / `ORD_BIN`.

## Running your own bridge

`bridge/server.mjs` expects Bitcoin Core (cookie auth), Frigate and ord on the same machine. Settings come from the environment:
`PORT`, `BITCOIN_COOKIE`, `ORD_URL`, `FRIGATE_PORT`, `UNISAT_API_KEY` (BRC-20 balances), `ALLOW_ORIGINS`, and `MARKET_BOOK_FILE` (defaults to `/data/shhhhh-market/book.jsonl`).
To point the wallet at your node, change `NODE` in `src/node.js`.
For a new production host, bandwidth, storage, security and rollout guidance, see [`docs/market-server-sizing.md`](docs/market-server-sizing.md).

## License

MIT
