# Built-in inscription market

The wallet market is a signed, non-custodial order book. A seller keeps the
inscription in the wallet and signs a `SIGHASH_SINGLE|ANYONECANPAY` offer. The
transaction signature fixes the inscription input and full seller payout. A
second v3 envelope signature binds the inscription ID, price, payout address,
unique listing nonce and transaction signature, preventing version downgrades
or metadata substitution. A buyer adds funding inputs and completes one Bitcoin
transaction that both pays the seller and moves the inscription.

## Trust boundary

- The market server cannot spend a listed inscription or change its price.
- `POST /v1/market/list` verifies the offer signature, confirmed Bitcoin
  output, exact value/script, the one expected inscription and absence of runes.
- A JSON document is not accepted as token inventory by appearance alone. For
  BRC-20 `transfer` inscriptions, the bridge compares the immutable Ord body
  with UniSat's indexed ticker, amount and current outpoint before assigning a
  4-, 5- or 6-byte ticker category.
- `GET /v1/market/listings` prunes spent outpoints.
- The wallet repeats the Bitcoin and ord checks immediately before buying and
  compares the displayed ticker/amount with the inscription body.
- `POST /v1/market/cancel` requires a separate seller signature.
- A cancelled listing ID is permanently revoked; only a newly signed offer with
  a fresh nonce can be listed again.
- The append-only market book is hash chained and defaults to
  `/data/shhhhh-market/book.jsonl`; set `MARKET_BOOK_FILE` to override it.

Cancellation removes an offer from this market, but cannot erase copies that
another party already downloaded. Moving the inscription makes every copied
offer for that outpoint unusable.

## Network-fee choices

Bitcoin miners always receive BTC. BTC fee payment is live. The UI also shows
the intended `shhhhh` choice, but keeps it disabled until an independent
Sponsor can quote a token amount, contribute and sign a clean BTC fee input,
and finalize a two-party PSBT. There is no automatic fallback or double charge.

The future Sponsor must be a separate signer and must validate the complete
offer, outputs, fee rate, virtual size, quote expiry and one-time `shhhhh`
authorization before adding its signature. The bridge must not hold the
Sponsor private key.

## Deployment gate

The current source points production traffic at `https://node.shhhhh.site`, but
that endpoint must not be treated as project-owned infrastructure until its
ownership and deployment are confirmed. Shipping a client before a project-owned
bridge is running leaves the UI unable to trade, so deployment is gated by:

```text
node tools/market-smoke.mjs https://node.shhhhh.site
```

Deploy the repository's `bridge/` and `src/` directories together, install the
package dependencies, configure a `UNISAT_API_KEY`, set
`MARKET_BOOK_FILE` to a durable path writable by the bridge service account,
then restart the bridge. Both `/v1/market/listings` and
`/v1/market/fee-policy` must return HTTP 200 before publishing the wallet.

For a new deployment with no existing server, see
[`docs/market-server-sizing.md`](market-server-sizing.md). The recommended first
production host is a dedicated Core + ord + Frigate + bridge machine; local
development does not require that full stack.

The local preview uses a separate persistent development order book under the
operating-system temp directory. It still verifies listings through the public
Bitcoin/ord/BRC-20 endpoints, allowing real list/cancel and two-profile purchase
testing without confusing development offers with production offers.

## 4/5/6-byte BRC-20 browsing

The market has independent scope (`Explore` / `My listings`) and ticker-size
filters (`All` / `4-byte` / `5-byte` / `6-byte`). BRC-20 namespace size is the
normalized UTF-8 byte length, not JavaScript string length. Mint/deploy JSON,
malformed documents and metadata that the indexer cannot verify remain ordinary
inscriptions and never appear in a token-size category.

## Demo listings

The wallet includes twelve clearly marked BRC-20 transfer examples—four each
for the 4-, 5- and 6-byte namespaces—so an empty market still exercises the
real filters and responsive ticker list. Selecting a ticker opens the same
single-column order-detail layout used by live listings, with floor unit price,
lowest total, listing count, listed amount and settlement status. Unsupported
history fields such as 24-hour volume display `—` instead of fabricated data.
Demo rows are labelled `Demo` and `Not on-chain`, never enter the order book,
cannot be purchased and never request a signature. Opening one explains the
four real purchase stages: verify, choose the fee method, review and atomic
settlement.
