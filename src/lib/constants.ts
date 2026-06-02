// ── NEAR / Burrow config ──────────────────────────────────────────────

/** NEAR account ID being tracked */
export const ACCOUNT = '943addabde7913c6f58043d348ec763643689b68da2e7ab186b7d75e1d544ff2'

/** Burrow contract on mainnet (Rhea Lend) */
export const BURROW_CONTRACT = 'contract.main.burrow.near'

/** FastNear KV base URL — free reads, on-chain writes */
export const KV_BASE = 'https://kv.main.fastnear.com'

/** KV key path: account/account/pnl */
export const CHART_KEY = `${ACCOUNT}/${ACCOUNT}/pnl`

/** NearBlocks explorer link for the tracked account */
export const EXPLORER_URL = `https://nearblocks.io/address/${ACCOUNT}`

/** Truncated account for display */
export const ACCOUNT_SHORT = `${ACCOUNT.slice(0, 8)}…${ACCOUNT.slice(-6)}`
