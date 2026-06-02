import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { usd, chartDate, yAxisDollar } from '../lib/format'

// ── Custom tooltip ────────────────────────────────────────────────────

interface TooltipPayload {
  value: number
  dataKey: string
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/[0.08] rounded-xl p-3 text-xs">
      <div className="text-white/50 mb-2">{new Date(label ?? '').toLocaleString()}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-8">
          <span className="text-white/50 capitalize">
            {p.dataKey.replace(/_/g, ' ')}
          </span>
          <span className="text-white font-medium">{usd(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ── Legend dot ────────────────────────────────────────────────────────

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-white/40 text-xs">{label}</span>
    </div>
  )
}

// ── PositionChart ──────────────────────────────────────────────────────

export interface ChartDataPoint {
  time: string
  net_value_usd: number
  collateral_usd: number
  borrowed_usd: number
}

interface PositionChartProps {
  data: ChartDataPoint[]
  snapshotCount: number
  isLoading: boolean
  hasError: boolean | string
}

export function PositionChart({ data, snapshotCount, isLoading, hasError }: PositionChartProps) {
  const isEmpty = data.length < 2

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur-sm">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-lime-500" />
          <span className="text-sm font-medium text-white">Position History</span>
        </div>
        <span className="text-white/30 text-xs">{snapshotCount} snapshots</span>
      </div>

      {/* body */}
      {isLoading && isEmpty ? (
        <div className="flex items-center justify-center text-white/40 text-sm h-48">
          Loading…
        </div>
      ) : isEmpty ? (
        <div className="flex items-center justify-center text-white/30 text-sm text-center px-4 h-48">
          {hasError ? `Error: ${hasError}` : 'No snapshots yet.'}
        </div>
      ) : (
        <div style={{ height: 'calc(100vh - 420px)', minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCollateral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

              <XAxis
                dataKey="time"
                tickFormatter={chartDate}
                stroke="rgba(255,255,255,0.25)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.25)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisDollar}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />

              <Area type="monotone" dataKey="net_value_usd" stroke="#22c55e" fill="url(#gradNet)" strokeWidth={2} name="Net Value" />
              <Area type="monotone" dataKey="collateral_usd" stroke="#3b82f6" fill="url(#gradCollateral)" strokeWidth={1.5} strokeDasharray="4 3" name="Collateral" />
              <Area type="monotone" dataKey="borrowed_usd" stroke="#ef4444" fill="none" strokeWidth={1.5} strokeDasharray="4 3" name="Borrowed" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* legend */}
      <div className="flex items-center justify-center gap-5 mt-3">
        <LegendDot color="bg-lime-500" label="Net Value" />
        <LegendDot color="bg-blue-500" label="Collateral" />
        <LegendDot color="bg-red-500" label="Borrowed" />
      </div>
    </div>
  )
}
