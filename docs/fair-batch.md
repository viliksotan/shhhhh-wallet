# Fair Batch Mode

Fair Batch Mode reduces the advantage of bots, low-latency infrastructure and
large amounts of compute. It does **not** try to identify whether a participant
is human or AI, and it does not guarantee a token price.

The implementation has three parts:

- `src/fair-market.js`: canonical orders, salted commitments, wallet signatures,
  epoch timing, stake quotas, circuit breakers, Merkle roots and deterministic
  uniform-price clearing.
- `bridge/fair-market.mjs`: commit/reveal state, one-order-per-wallet enforcement,
  settlement, verified-stake lookup and a hash-chained audit log.
- the extension page API: `fairCommit(order)` and `fairReveal(commitment)` keep the
  random salt in the encrypted wallet state until the user approves reveal.

This is a fair scheduling and matching layer. A market must still turn a matched
result into the existing atomic Bitcoin offer/purchase flow. No transaction is
broadcast by the coordinator.

## Default epoch

Each 60-second epoch has fixed phases:

| Phase | Duration | What the coordinator receives |
| --- | ---: | --- |
| Commit | 30 seconds | wallet key, commitment and BIP340 signature |
| Reveal | 20 seconds | side, amount, limit price and random salt |
| Settle | 10 seconds | no new orders; deterministic clearing is available |

An order commitment is:

```text
SHA256(
  "shhhhh/fair-market/v1" ||
  canonical_order ||
  32_byte_random_salt
)
```

Canonical orders contain only the protocol version, epoch, market, side, amount,
limit price and the wallet's dedicated stake public key. The wallet signs the
commitment envelope. A coordinator cannot change an order or invent an order for
that wallet.

## Browser flow

The market page first reads the coordinator clock and policy:

```js
const node = 'https://node.shhhhh.site';
const market = 'shhhhh/btc';
const status = await fetch(`${node}/v1/fair/status?market=${market}`).then(r => r.json());
```

During the commit window it asks the wallet to create a hidden order:

```js
const envelope = await window.shhhhh.fairCommit({
  epoch: status.epoch,
  market,
  side: 'buy',
  amount: 1000,
  limitPrice: 25000
});

await fetch(`${node}/v1/fair/commit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(envelope)
});
```

The page receives no salt and cannot reveal the order early. During the reveal
window it asks the same wallet to release the saved order:

```js
const reveal = await window.shhhhh.fairReveal(envelope.commitment);

await fetch(`${node}/v1/fair/reveal`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(reveal)
});
```

After the reveal window:

```js
const result = await fetch(
  `${node}/v1/fair/result/${status.epoch}?market=${market}`
).then(r => r.json());
```

The result contains a uniform clearing price, matched buy/sell commitments,
rejections, the commitment Merkle root, the previously committed server seed and
its reveal. Fetch `/v1/fair/audit/:epoch?market=...` for the hash-chained records.

## Quotas and circuit breakers

The coordinator ignores stake amounts supplied by clients. Operators may point
`FAIR_STAKES_FILE` at an independently verified on-chain stake registry:

```json
{
  "shhhhh/btc": {
    "32-byte-x-only-wallet-key-in-hex": 4000
  }
}
```

The per-epoch quota is:

```text
quota = min(maxQuota, baseQuota * sqrt(verifiedStake / minStake))
```

Unstaked wallets retain the base quota. The square root prevents stake from
turning directly into linear market dominance. Default policy:

- base quota: 1,000 token units;
- minimum stake unit: 1,000;
- maximum quota: 1,000,000;
- one order per wallet key per market and epoch;
- maximum order: 1% of configured supply;
- price band: 15% around the median of the last 3-30 clearing prices.

Supply is configured by market:

```text
FAIR_MARKET_SUPPLY_JSON={"shhhhh/btc":21000000}
```

If supply is not configured, the supply-share limit is not applied. If fewer than
three prior clearing prices exist, the reference-price circuit breaker is not yet
applied.

## Audit persistence

Set an audit file on the bridge:

```text
FAIR_AUDIT_FILE=/var/lib/shhhhh-bridge/fair-market.jsonl
```

The file is append-only and each record commits to the previous record hash. It
also contains the private server seed before settlement, so it must remain private.
The public audit endpoint hides that seed until the epoch settles. Restarting with
the same file replays active commits and reveals and verifies the hash chain.

## Security boundaries

- Commit/reveal and batch clearing remove arrival-time priority; they do not stop
  a participant from creating multiple independent wallets.
- A verified, time-locked stake registry raises the cost of Sybil identities but
  cannot prove that one wallet equals one human.
- IP rate limits are secondary abuse controls, not identity.
- A single coordinator can censor commits. The audit log makes omission visible
  only if clients retain their signed receipts. Multiple coordinators or periodic
  Bitcoin anchoring of the audit head are recommended before production use.
- A circuit breaker delays extreme orders; it is not a price peg and cannot make
  trading or a token financially safe.
- Real-money deployment needs adversarial integration tests, coordinator outage
  tests, independent stake-index verification and review of all market parameters.
