// ── A single position snapshot stored in FastNear KV ─────────────────

export interface Snapshot {
  /** ISO 8601 timestamp of when this snapshot was recorded */
  ts: string

  /** USD value of all supplied assets */
  supplied_usd: number

  /** USD value of all collateral assets */
  collateral_usd: number

  /** USD value of all borrowed assets */
  borrowed_usd: number

  /** USD value of accumulated rewards */
  rewards_usd: number

  /** Derived: supplied + collateral − borrowed */
  net_value_usd: number

  /** NEAR block height at time of snapshot */
  block_height: number
}

/** Shape returned by the Burrow `get_account` view function */
export interface BurrowAccountPosition {
  supplied: Array<{
    token_id: string
    balance: string // borsh-encoded u128
    apr: number
    shares: string
    price: number
  }>
  collateral: Array<{
    token_id: string
    balance: string
    shares: string
    apr: number
    multiplier: number
    volatility_ratio: number
    price: number
  }>
  borrowed: Array<{
    token_id: string
    balance: string
    shares: string
    apr: number
    multiplier: number
    borrowed_balance_shares: string
    price: number
  }>
  farms: unknown[]
}

/** Metrics derived from a Snapshot for display */
export interface DerivedMetrics {
  pnl: number
  pnlPct: number
}
