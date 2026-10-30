# Public source vs. packaged extension

This checkout is based on public commit `426f62e8b726f5746cef5d3f835db4a4fb110f1f` from
`twiixie/shhhhh-wallet`. The comparison target is the supplied extension package
`shhhhh-wallet-extension.zip`, manifest version `1.299.924`, with SHA-256:

```text
69687A485B465F23786AC4901686D55ED18B8C3ECA8EF629E4E9F9C53451A846
```

The public repository is a credible source baseline, but it is not the exact source used to
produce the supplied package.

## Verified baseline

- BIP352 vector tests: 176 passed.
- Scan tests: 8 passed.
- Key and vault tests: 11 passed.
- Reconstructed inscription, marketplace and staking tests: 13 passed.
- Extension browser test covers wallet creation, all 11 page APIs, immediate disconnect and
  side-panel lifecycle.
- Web bundle builds successfully.
- Chrome extension folder and ZIP build successfully on Windows after replacing URL pathname
  handling and the macOS-only icon/ZIP tooling with platform-aware implementations.

## Package differences

The packaged `app.js` is 60,901 bytes larger than the bundle produced from the public source.
The extension permissions and three host permissions are unchanged, but the page bridge and
content-script scope have expanded.

| Area | Public source | Supplied package |
| --- | --- | --- |
| Page API | `connect`, `sendBitcoin` | Adds `disconnect`, `inscribe`, listings, purchases, item queries, staking and holding proofs |
| Local apps | `127.0.0.1:8364` | Adds ports 8365, 8366, 8367, 8372 and 8375 |
| Web apps | `shhhhh.site/mint` | Adds `inscribe`, `auction`, `market` and `shroud.world` |
| `app.js` | 227,789 bytes | 288,690 bytes |
| `background.js` | 1,830 bytes | 2,869 bytes |
| `inpage.js` | 811 bytes | 1,397 bytes |

The exact page methods in the supplied package are:

```text
connect, disconnect, sendBitcoin, inscribe, listForSale, cancelListing,
buyListing, myItems, stake, unstake, proveHolding
```

## Reconstructed development status

- The full page bridge is restored, including origin restrictions and immediate `disconnect`.
- General 1–25 item inscription requests are implemented in readable source with retry state for
  reveals that fail to broadcast.
- Atomic listing, cancellation and purchase builders are implemented in `src/market.js`.
- Dedicated stake-key derivation, CLTV Taproot locks and unlock transactions are implemented in
  `src/stake.js`.
- Holding proofs use a domain-separated message and only run from the restricted proof origins.
- The approval broker now serializes request reservations, preventing two tabs from overwriting
  the single approval slot.

Before a public release, backend fee estimates and all service responses still need adversarial
integration testing, the node endpoint should become configurable, and release artifacts should
gain a deterministic source/build manifest.

## Known audit limitation

Without the unpublished source changes or source maps, matching the supplied package byte for
byte is not currently possible. New behavior must be reconstructed from the packaged bundle and
validated with focused unit, integration and browser tests.
