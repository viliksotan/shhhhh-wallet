# Inscription Center

The wallet's inscription center uses the OKX Wallet inscription flow as its sole
product reference while preserving shhhhh wallet's own visual identity, signing
model and Bitcoin transaction builders. No OKX branding, icons or artwork are
included.

## Reference flow

The official OKX Wallet guidance organizes inscription creation as:

1. open an inscription center;
2. select the network and content type;
3. enter a BRC-20 ticker, amount and number of mints, or choose text/image data;
4. select the recipient;
5. review the order summary and confirm;
6. manage the resulting BRC-20 asset or Ordinal from the wallet.

Sources:

- [How do I inscribe BRC-20 tokens?](https://www.okx.com/en-gb/help/how-can-i-inscribe-brc20-tokens)
- [BRC20 trading and inscription FAQ](https://www.okx.com/en-gb/help/brc20-trading-and-inscription-faq)
- [OKX Bitcoin wallet provider API](https://web3.okx.com/onchainos/dev-docs/wallet/dapp-connect/chains/bitcoin/provider)

## shhhhh wallet integration

The `Inscriptions` tab combines that information flow with the wallet's existing
features. The current product surface deliberately hides token issuance and
contract deployment while the market is being built:

- the existing two-step BRC-20 transfer flow for balances already held;
- BRC2.0 smart-contract calls with raw EVM calldata;
- plain-text and supported image inscriptions;
- Bitcoin mainnet, recipient, network-fee, postage and total-cost review;
- password confirmation before broadcasting;
- one commit transaction followed by independent reveal transactions;
- automatic retry storage for reveals that could not be broadcast immediately;
- Ordinal gallery, spam hiding and safe inscription transfer;
- `ord` checks that keep inscription-bearing UTXOs out of ordinary BTC fees.

The lower-level mint and deployment builders remain covered by tests for data
compatibility, but are not reachable from the wallet UI. Network fees cannot be
recovered once a transaction is broadcast.

## Ticker namespaces

- **4 byte:** the classic BRC-20 public-mint namespace.
- **5 byte:** the self-issuance namespace. A mint must be created by the
  deployer and must use the deployment inscription as its parent. The wallet
  displays and transfers 5-byte assets, but deliberately locks the mint button
  until a valid parent inscription is available rather than broadcasting an
  invalid ordinary mint.
- **6 byte:** the active extended namespace. Tickers are case-insensitive and
  restricted to ASCII letters, digits and `-`. The center can mint an existing
  public 6-byte ticker. Self-minted tickers still require deployer authority.

Protocol references:

- [BRC-20 self issuance and 5-byte tickers](https://github.com/unisat-wallet/brc20-proposals/blob/main/bp04-self-mint/proposal.md)
- [Active 6-byte ticker namespace](https://github.com/bestinslot-xyz/brc20-proposals/blob/main/001-6-byte-namespace/index.md)

## BRC2.0 programmable operations

The BRC2.0 section supports two advanced, non-custodial operations:

- deploy compiled EVM bytecode plus constructor arguments (`op: "d"`);
- call a contract address or deployment inscription with ABI-encoded calldata
  (`op: "c"`).

Both use canonical `brc20-prog` JSON inside an Ordinals commit/reveal pair. The
reveal is sent to the protocol-required `OP_RETURN "BRC20PROG"` output. The
contract operation and calldata are therefore public. Spendable change from the
commit transaction continues to use the silent wallet change path; the review
screen shows the public protocol output and silent change separately.

The wallet does not compile Solidity or infer an ABI. Advanced users must verify
the bytecode and calldata before confirmation. BRC2.0 deposits, withdrawals and
raw signed EVM transactions are intentionally outside this first integration.

Protocol references:

- [BRC2.0 programmable module proposal](https://github.com/bestinslot-xyz/brc20-proposals/blob/main/000-programmable-module/index.md)
- [BRC2.0 indexer integration guide](https://github.com/bestinslot-xyz/brc20-programmable-module/blob/main/docs/indexer-integration.md)
- [BRC2.0 execution engine](https://github.com/bestinslot-xyz/brc20-programmable-module)

## Languages

English is the storage-free default. The welcome screen, lock screen and
Settings → Language offer Simplified and Traditional Chinese, Japanese, Korean, Spanish, Brazilian Portuguese, Russian,
French, German, Italian, Dutch, Polish, Turkish, Indonesian, Vietnamese, Thai,
Malay and Filipino. Core wallet and inscription controls are localized; any
long explanatory copy that has not been human-reviewed safely falls back to the
canonical English source string.
