# Burrow Tracker

Real-time PnL dashboard for [Rhea Lend](https://rhea.la) (Burrow) positions on NEAR Protocol.

Tracks account `943addab…d544ff2` — supplied assets, collateral, borrowed, rewards, and net value over time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      NEAR Mainnet                        │
│                                                         │
│  contract.main.burrow.near        *.fastnear.com        │
│  ┌──────────────────┐            ┌──────────────────┐   │
│  │  get_account()   │            │   FastNear KV    │   │
│  │  view function   │            │  (on-chain KV)   │   │
│  └────────┬─────────┘            ┌────────┬─────────┘   │
│           │                               │             │
└───────────┼───────────────────────────────┼─────────────┘
            │                               │
            │  1. Poll position             │  4. Read history
            │     every 15 min              │     (free reads)
            ▼                               │
┌───────────────────┐                       │
│  CF Worker (cron) │                       │
│  scheduled()      │                       │
│                   │                       │
│  2. Decode u128   │                       │
│     balances with │                       │
│     token decimals│                       │
│                   │                       │
│  3. Write snapshot│                       │
│     via __fastdata│───────────────────────┘
│     _kv tx        │
│  (~$0.08/tx)      │
└───────────────────┘
                            │
                            ▼
                   ┌──────────────────┐
                   │  Dashboard (SPA) │
                   │  Vite + React    │
                   │                  │
                   │  Fetches /v0/    │
                   │  history from    │
                   │  FastNear KV     │
                   │                  │
                   │  Renders chart,  │
                   │  metrics, table  │
                   └──────────────────┘
```

## Data Flow

### 1. Position Fetch (CF Worker → Burrow)

The Worker calls `get_account` on `contract.main.burrow.near` with the account ID. This is a **view call** — free, no signing, reads contract state directly.

```json
{
  "account_id": "943addabde7913c6f58043d348ec763643689b68da2e7ab186b7d75e1d544ff2"
}
```

Returns raw balances as **borsh-encoded u128** byte arrays for each deposited/collateral/borrowed asset.

### 2. Decoding

Burrow stores balances as u128 shares, not raw token amounts. The Worker:

- Decodes u128 bytes → `BigInt`
- Maps token IDs to decimals (USDC=6, NEAR=24, USDT=6, ETH=18, etc.)
- Uses Burrow's own price oracle (`price` field in each position) for USD conversion
- Computes: `net_value = supplied + collateral - borrowed`

### 3. On-chain Write (CF Worker → FastNear KV)

The Worker signs and submits a `__fastdata_kv` transaction storing the snapshot:

```json
{
  "key": "943addab…/943addab…/pnl",
  "value": {
    "ts": "2026-06-02T12:00:00Z",
    "supplied_usd": 3.65,
    "collateral_usd": 6763.28,
    "borrowed_usd": 1.53,
    "rewards_usd": 0.24,
    "net_value_usd": 6765.64,
    "block_height": 141000000
  }
}
```

Cost: ~0.0003 NEAR per tx ≈ $0.08 → **~$7.70/month** at 15-min intervals.

### 4. Dashboard Read (SPA → FastNear KV)

The React app fetches paginated history from FastNear's free read API:

```
POST https://kv.main.fastnear.com/v0/history
{ "key": "943addab…/943addab…/pnl", "limit": 200, "asc": true }
```

No API key needed. Free, cached at the edge. Returns chronological snapshots.

### 5. Rendering

- **PnL Hero**: latest `net_value_usd` + change since first snapshot
- **Metric Cards**: supplied, collateral, borrowed, rewards from latest snapshot
- **Chart**: recharts `AreaChart` with net value (green), collateral (blue), borrowed (red)
- **Table**: last 20 snapshots with per-row PnL

## Token Map

| Token ID | Symbol | Decimals |
|----------|--------|----------|
| `a0b86991…factory.bridge.near` | USDC | 6 |
| `usdt.tether-token.near` | USDT | 6 |
| `853d955a…factory.bridge.near` | USDC.e | 6 |
| `2260fac5…factory.bridge.near` | USDT.e | 6 |
| `eth.bridge.near` | ETH | 18 |
| `zec.omft.near` | ZEC | 8 |
| `nbtc.bridge.near` | nBTC | 8 |
| `17208628…` | wNEAR | 24 |
| `xtoken.rhealab.near` | rNEAR | 24 |
| `meta-pool.near` | stNEAR | 24 |
| `lst.rhealab.near` | stNEAR (Rhea) | 24 |
| `token.burrow.near` | BRRR | 18 |

## Project Structure

```
src/
├── lib/
│   ├── constants.ts     NEAR account, contract addresses, KV config
│   ├── types.ts         Snapshot, BurrowAccountPosition interfaces
│   ├── kv.ts            FastNear KV fetcher + localhost mock data
│   └── format.ts        usd(), shortDate(), chartDate() helpers
├── components/
│   ├── MetricCard.tsx   Metric card + PnL hero badge
│   ├── PositionChart.tsx recharts AreaChart with tooltip + legend
│   └── SnapshotTable.tsx Recent snapshots table
└── App.tsx              Layout shell, header, bottom nav, state wiring
```

## Running Locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:5174` with mock data. Change `fetchHistory()` in `kv.ts` to point at real KV data for production.

## Deploy

```bash
npm run build
wrangler pages deploy dist --project-name burrow-tracker
```

## Signing Options

The CF Worker needs a NEAR key to sign `__fastdata_kv` writes. Options:

- **Dedicated sub-account** — simplest, fund with 1 NEAR for a year of writes
- **OutLayer session key** — scoped function-call key via OutLayer wallet, limited to KV writes only
- **Frontend-triggered** — skip the Worker cron, write from dashboard via wallet signing (gaps when offline)
