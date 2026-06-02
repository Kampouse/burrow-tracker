import { usd, shortDate, shortTime } from '../lib/format'
import type { Snapshot } from '../lib/types'

interface SnapshotTableProps {
  snapshots: Snapshot[]
}

export function SnapshotTable({ snapshots }: SnapshotTableProps) {
  if (snapshots.length === 0) return null

  const first = snapshots[0]
  const recent = [...snapshots].reverse().slice(0, 20)

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] overflow-hidden backdrop-blur-sm">
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <span className="text-sm font-medium text-white">Snapshots</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/30 text-left border-b border-white/[0.06]">
              <th className="px-4 py-2.5 font-medium">Time</th>
              <th className="px-4 py-2.5 font-medium text-right">Net</th>
              <th className="px-4 py-2.5 font-medium text-right">PnL</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((s, i) => {
              const pnl = s.net_value_usd - first.net_value_usd
              return (
                <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                  <td className="px-4 py-2.5 text-white/50 font-mono">
                    {shortDate(s.ts)}
                    <span className="text-white/25 ml-1">{shortTime(s.ts)}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-white">
                    {usd(s.net_value_usd)}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-medium ${pnl >= 0 ? 'text-lime-500' : 'text-red-500'}`}>
                    {pnl >= 0 ? '+' : ''}{usd(pnl)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
