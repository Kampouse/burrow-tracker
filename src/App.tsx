import { useState, useEffect, useCallback } from 'react'
import {
  Wallet, Shield, ArrowDownRight, Gift,
  RefreshCw, ExternalLink, Activity, TrendingUp,
} from 'lucide-react'

import { ACCOUNT_SHORT, EXPLORER_URL } from './lib/constants'
import { fetchHistory } from './lib/kv'
import { usd } from './lib/format'
import type { Snapshot } from './lib/types'

import { MetricCard, PnlHero } from './components/MetricCard'
import { PositionChart, type ChartDataPoint } from './components/PositionChart'
import { SnapshotTable } from './components/SnapshotTable'

// ── App ──────────────────────────────────────────────────────────────

export default function App() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHistory()
      setSnapshots(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Derived state ──

  const latest = snapshots[snapshots.length - 1]
  const first = snapshots[0]
  const pnl = latest && first ? latest.net_value_usd - first.net_value_usd : 0
  const pnlPct = first?.net_value_usd ? (pnl / first.net_value_usd) * 100 : 0
  const chartData: ChartDataPoint[] = snapshots.map((s) => ({
    time: s.ts,
    net_value_usd: s.net_value_usd,
    collateral_usd: s.collateral_usd,
    borrowed_usd: s.borrowed_usd,
  }))

  return (
    <div className="flex-1 flex flex-col w-full px-4">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Header loading={loading} onRefresh={load} />

      {/* ── Main content ──────────────────────────────────────────── */}
      <main className="flex-1 pb-28 w-full space-y-5">
        <PnlHero
          snapshot={latest}
          pnl={pnl}
          pnlPct={pnlPct}
          hasMultipleSnapshots={snapshots.length > 1}
        />

        <div className="grid grid-cols-2 gap-4 px-2">
          <MetricCard icon={Wallet} label="Supplied" value={latest ? usd(latest.supplied_usd) : '—'} color="bg-lime-500/15" />
          <MetricCard icon={Shield} label="Collateral" value={latest ? usd(latest.collateral_usd) : '—'} color="bg-blue-500/15" />
          <MetricCard icon={ArrowDownRight} label="Borrowed" value={latest ? usd(latest.borrowed_usd) : '—'} color="bg-red-500/15" />
          <MetricCard icon={Gift} label="Rewards" value={latest ? usd(latest.rewards_usd) : '—'} color="bg-amber-500/15" />
        </div>

        <PositionChart
          data={chartData}
          snapshotCount={snapshots.length}
          isLoading={loading}
          hasError={!!error && error}
        />

        <SnapshotTable snapshots={snapshots} />
      </main>

      {/* ── Bottom nav ─────────────────────────────────────────────── */}
      <BottomNav />
    </div>
  )
}

// ── Header ───────────────────────────────────────────────────────────

function Header({ loading, onRefresh }: { loading: boolean; onRefresh: () => void }) {
  return (
    <header className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-lime-500" />
          <span className="font-medium text-sm">Burrow Tracker</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs font-mono">{ACCOUNT_SHORT}</span>
          <a href={EXPLORER_URL} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white/60 transition-colors">
            <ExternalLink size={14} />
          </a>
          <button onClick={onRefresh} disabled={loading} className="text-white/40 hover:text-white/60 transition-colors disabled:opacity-40">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
    </header>
  )
}

// ── Bottom nav ───────────────────────────────────────────────────────

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[oklch(0.118_0.014_284)]/95 backdrop-blur-md border-t border-white/[0.06] z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around py-2">
        <a href="#" className="flex flex-col items-center gap-1 text-white">
          <Activity size={20} className="text-lime-500" />
          <span className="text-[11px] font-medium">Home</span>
        </a>
        <a href="#" className="flex flex-col items-center gap-1 text-white/40">
          <TrendingUp size={20} />
          <span className="text-[11px]">Chart</span>
        </a>
        <a href="#" className="flex flex-col items-center gap-1 text-white/40">
          <Wallet size={20} />
          <span className="text-[11px]">Positions</span>
        </a>
        <a href="#" className="flex flex-col items-center gap-1 text-white/40">
          <ExternalLink size={20} />
          <span className="text-[11px]">Burrow</span>
        </a>
      </div>
    </nav>
  )
}
