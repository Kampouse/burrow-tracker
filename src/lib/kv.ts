// ── FastNear KV fetcher — paginated history reads ─────────────────────

import { KV_BASE, CHART_KEY } from './constants'
import type { Snapshot } from './types'

// ── Mock data (localhost dev only) ─────────────────────────────────────

const MOCK_SNAPSHOTS: Snapshot[] = [
  { ts: '2026-04-15T00:00:00Z', net_value_usd: 4_200, supplied_usd: 100, collateral_usd: 4_300, borrowed_usd: 200, rewards_usd: 0, block_height: 140_000_000 },
  { ts: '2026-04-20T12:00:00Z', net_value_usd: 4_500, supplied_usd: 110, collateral_usd: 4_600, borrowed_usd: 210, rewards_usd: 0, block_height: 140_200_000 },
  { ts: '2026-05-01T00:00:00Z', net_value_usd: 5_000, supplied_usd: 120, collateral_usd: 5_100, borrowed_usd: 220, rewards_usd: 0, block_height: 140_400_000 },
  { ts: '2026-05-10T12:00:00Z', net_value_usd: 5_800, supplied_usd: 150, collateral_usd: 5_900, borrowed_usd: 250, rewards_usd: 0.1, block_height: 140_600_000 },
  { ts: '2026-05-20T00:00:00Z', net_value_usd: 6_200, supplied_usd: 200, collateral_usd: 6_400, borrowed_usd: 400, rewards_usd: 0.15, block_height: 140_800_000 },
  { ts: '2026-06-01T00:00:00Z', net_value_usd: 6_765, supplied_usd: 3.65, collateral_usd: 6_763, borrowed_usd: 1.53, rewards_usd: 0.24, block_height: 141_000_000 },
]

// ── Real KV fetch ─────────────────────────────────────────────────────

async function fetchFromKv(): Promise<Snapshot[]> {
  const snapshots: Snapshot[] = []
  let pageToken = ''

  for (let page = 0; page < 20; page++) {
    const body: Record<string, unknown> = {
      key: CHART_KEY,
      limit: 200,
      asc: true,
      include_metadata: true,
    }
    if (pageToken) body.page_token = pageToken

    const res = await fetch(`${KV_BASE}/v0/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    for (const entry of data.entries ?? []) {
      snapshots.push({
        ts: entry.value?.ts ?? new Date(entry.block_timestamp / 1e6).toISOString(),
        net_value_usd: entry.value?.net_value_usd ?? 0,
        supplied_usd: entry.value?.supplied_usd ?? 0,
        collateral_usd: entry.value?.collateral_usd ?? 0,
        borrowed_usd: entry.value?.borrowed_usd ?? 0,
        rewards_usd: entry.value?.rewards_usd ?? 0,
        block_height: entry.block_height ?? 0,
      })
    }

    pageToken = data.page_token
    if (!pageToken) break
  }

  return snapshots
}

// ── Public API ─────────────────────────────────────────────────────────

/** Fetch position history from FastNear KV (or mock data when no real data exists) */
export async function fetchHistory(): Promise<Snapshot[]> {
  const snapshots = await fetchFromKv()

  // Fall back to mock data if KV is empty (no writer running yet)
  if (snapshots.length === 0) {
    await new Promise((r) => setTimeout(r, 400))
    return MOCK_SNAPSHOTS
  }

  return snapshots
}
