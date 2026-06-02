// ── Formatting helpers ─────────────────────────────────────────────────

/** Format a number as USD with commas */
export function usd(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

/** Format an ISO date as "Jun 2" */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/** Format an ISO date as "2:30 PM" */
export function shortTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/** Format an ISO date as "M/DD" for chart axis ticks */
export function chartDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

/** Format Y-axis value as "$X.Xk" */
export function yAxisDollar(value: number): string {
  return `$${(value / 1000).toFixed(1)}k`
}
