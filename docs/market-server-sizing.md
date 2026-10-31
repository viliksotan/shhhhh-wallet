# shhhhh 市场服务器与带宽配置

## 结论

项目代码当前指向的 `node.shhhhh.site` 虽然能返回 Bitcoin Core、ord 和机器状态，但这不代表它是项目方自有服务器，也不能把它当作生产资源。既然项目目前没有自有服务器，首版应从零购买并部署一台 **Core + ord + Frigate + 市场 bridge 一体机**。

推荐直接购买：**16 vCPU、64 GB 内存、4 TB 企业级 NVMe、1 Gbps 公网端口、每月 5 TB 以上或不限流量、1 个固定 IPv4**。操作系统使用 Ubuntu 24.04 LTS。若预算非常紧，可以从 8 vCPU、32 GB、4 TB NVMe、300 Mbps、每月 3 TB 起步，但首次同步、ord 建索引和高峰查询都会明显更慢，不建议作为长期生产配置。

Bitcoin 与 ord 官方资料给出的首次同步量约为 600–740 GB；Bitcoin.org 还提示稳态下载约 20 GB/月、高连接全节点上传可达到 200 GB/月以上。当前代码所指向的参考节点公开状态里，Bitcoin 数据已经约 889 GB；这只是容量规划参考，不代表该节点归项目方所有。新建节点必须为 Core、交易索引、ord、Frigate、临时重建空间和持续增长一起留出余量，不能只按照区块文件的最低数字购买磁盘。

## 四档部署方案

| 方案 | CPU / 内存 | 磁盘 | 网络 | 适用阶段 |
| --- | --- | --- | --- | --- |
| 从零首发一体机（推荐） | 16 核 / 64 GB | 4 TB 企业级 NVMe，最好可扩到 8 TB | 1 Gbps，至少 5 TB/月或不限流量 | Core、ord、Frigate、bridge 同机运行 |
| 预算最低的一体机 | 8 核 / 32 GB | 4 TB NVMe | 300 Mbps，至少 3 TB/月 | 小规模测试；同步和索引较慢 |
| 独立市场 API（后期增加） | 4 核 / 8 GB | 100–200 GB NVMe | 100 Mbps，至少 2 TB/月 | 与索引机隔离、降低 DDoS 影响 |
| 高可用 | 2 台 4 核 / 8 GB API；1 台以上 16 核 / 64 GB 索引机 | API 各 100 GB；索引机 4–8 TB；独立 PostgreSQL | API 各 100–300 Mbps；索引机 1 Gbps | 万级日活、滚动升级与故障切换 |

首版应选第一档。当前 bridge 默认通过 `127.0.0.1` 访问 Bitcoin Core、ord 和 Frigate，所以一体机也是最少改代码、最快上线的方式。后期若拆出独立 API，必须先把这些地址改为可配置项，再通过私网或 WireGuard 连接，绝不能把 RPC 端口暴露到公网。

## 为什么全节点不能使用裁剪模式

`ord` 官方指南要求 Bitcoin Core 开启 `txindex=1` 并启用 REST。Bitcoin Core 的裁剪模式与 `txindex` 不兼容，因此 shhhhh 的 Core + ord 节点必须保存完整区块数据。官方资料：

- [Bitcoin Core 下载与磁盘说明](https://bitcoincore.org/en/download/)
- [Bitcoin 全节点带宽、初始同步和裁剪说明](https://bitcoin.org/en/full-node)
- [ord 钱包与 Bitcoin Core 配置](https://docs.ordinals.com/guides/wallet.html)
- [ord 索引重建说明](https://docs.ordinals.com/guides/reindexing.html)

`ord` 大版本升级或索引损坏时可能需要重新构建 `index.redb`。因此 4 TB 是当前生产推荐值，2 TB 只能作为短期最低配置，不适合作为长期容量规划。

## 带宽估算

### 市场 API

订单数据本身较轻。按每页 100–200 KB 估算：

- 每天 1,000 次市场页面加载：约 3–6 GB/月；
- 每天 10,000 次：约 30–60 GB/月；
- 每天 100,000 次：约 300–600 GB/月。

因此早期 100 Mbps、1–2 TB/月足够。相比端口峰值，云厂商的月度出站流量额度更重要。

### Bitcoin Core

- 新节点首次同步应准备至少 1–1.2 TB 下载额度，包含当前链数据和协议开销；
- 稳态下载通常约 20 GB/月；
- 开放入站连接的节点常见上传量为 150–200 GB/月；
- 若不承担公共 P2P 服务，可使用 `listen=0`、合理的 `maxconnections` 与 `maxuploadtarget` 控制上传，但不能关闭市场所需的交易广播和未确认交易检查。

### 铭文内容

最大的不确定流量来自 `/v1/ord/content/:id`。当前 BRC-20 市场卡片主要由客户端生成，不需要下载大图，流量较低；未来支持图片铭文时应把不可变内容放在 CDN 后缓存。示例：100 万次预览、平均每次 100 KB，约为 100 GB；如果大量内容接近 5 MB，则可能达到数 TB。

## UniSat API 额度

UniSat 官方免费额度为 5 次/秒、约 60,000 次/月。服务端应继续使用队列、缓存和失败重试；达到数百至上千日活后，应升级 Specialist、Enterprise 或按量套餐，不能依赖无密钥请求。

- [UniSat Open API](https://docs.unisat.io/developer-support/open-api-documentation)
- [UniSat API 套餐与额度](https://docs.unisat.io/developer-support/plans)

## 网络端口与安全

- 公网只开放 `80/443`，并由 Caddy 或 Nginx 强制跳转 HTTPS；
- Bitcoin P2P `8333` 仅在确定要服务其他节点时开放；
- Bitcoin RPC、ord、Frigate、PostgreSQL 和 Redis 只能监听 `127.0.0.1` 或私网；
- 使用系统防火墙、API 限流、请求体上限和 CDN/WAF；
- 生产环境设置严格的 `ALLOW_ORIGINS`；
- `MARKET_BOOK_FILE` 必须位于持久化磁盘，并由 bridge 服务账户独占写入；
- 市场服务器不得保存用户私钥、助记词或可代签交易的密钥；
- ord 会处理不可信铭文内容，必须保持隔离和沙箱策略。ord 项目也明确提醒其浏览器会承载不可信 HTML/JavaScript：[ord 安全说明](https://github.com/ordinals/ord#security)。

## 数据与备份

首版的 JSONL 订单簿适合单写入节点。建议：

- 每小时复制一次订单簿到加密对象存储；
- 保留 7 个日备份、4 个周备份、6 个每月备份；
- 每天备份 bridge 配置、屏蔽列表和 systemd/Caddy 配置；
- Bitcoin 区块和 ord 索引属于可重建数据，无需每天做全量异地备份；若恢复时间要求较高，可对数据盘做定期快照；
- 不要在服务仍写入时直接复制不完整的 JSONL 尾部，优先使用文件系统快照或先生成一致性副本；
- 当需要多台 API、复杂查询或万级日活时，将订单簿迁移到 PostgreSQL，并使用 Redis 做短期缓存和限流计数。

## 上线步骤与检查

1. 购买推荐的一体机，安装 Ubuntu 24.04 LTS，并挂载 4 TB NVMe 数据盘；
2. 安装并同步 Bitcoin Core 31+，开启 `txindex=1` 与 REST；
3. 安装并同步 ord 和 Frigate，三者只监听本机；
4. 申请 UniSat API key；免费额度只适合测试，正式用户增长后需升级套餐或增加缓存；
5. 将仓库的 `bridge/` 与 `src/` 一起部署，不能只复制 `bridge/server.mjs`；
6. 把 `MARKET_BOOK_FILE` 设置到持久化路径，例如 `/data/shhhhh-market/book.jsonl`；
7. 创建目录并确保 bridge 服务账户拥有写权限；
8. 配置 Caddy/Nginx、域名、TLS、限流和 systemd 服务；
9. 修改钱包的生产节点域名并重新构建扩展；
10. 执行：

```text
node tools/market-smoke.mjs https://node.shhhhh.site
```

11. 确认以下接口均返回 HTTP 200 JSON：

```text
GET /v1/market/listings
GET /v1/market/fee-policy
GET /v1/status
```

12. 使用两个隔离的钱包做小额主网验收：卖家挂单、买家检查、准备 UTXO、购买、广播、卖家收款、买家收到铭文、订单自动失效；
13. 检查订单簿 fsync、取消挂单、服务重启恢复、限流、备份恢复和监控告警。

只有冒烟测试与双钱包小额验收都通过后，才应发布指向生产市场的扩展。
