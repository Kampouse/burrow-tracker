import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { usd } from '../lib/format'
import type { Snapshot } from '../lib/types'

// ── MetricCard ────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: string
  color: string
}

export function MetricCard({ icon: Icon, label, value, color }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4 mb-5">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
        <span className="text-white/50 text-xs font-medium">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white tracking-tight">{value}</div>
    </div>
  )
}

// ── PnlHero ───────────────────────────────────────────────────────────

interface PnlHeroProps {
  snapshot: Snapshot | undefined
  pnl: number
  pnlPct: number
  hasMultipleSnapshots: boolean
}

export function PnlHero({ snapshot, pnl, pnlPct, hasMultipleSnapshots }: PnlHeroProps) {
  return (
    <div className="text-center pt-4">
      <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Net Position</div>
      <div className="text-4xl font-bold text-white tracking-tight">
        {snapshot ? usd(snapshot.net_value_usd) : '—'}
      </div>
      {hasMultipleSnapshots && (
        <div
          className={`inline-flex items-center gap-1 mt-2 text-sm font-medium px-2.5 py-0.5 rounded-full ${
            pnl >= 0 ? 'bg-lime-500/15 text-lime-500' : 'bg-red-500/15 text-red-500'
          }`}
        >
          {pnl >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {pnl >= 0 ? '+' : ''}
          {pnlPct.toFixed(1)}%
        </div>
      )}
    </div>
  )
}
