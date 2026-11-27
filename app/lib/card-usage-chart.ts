import { calendarDate, type PlantDateRange } from "./date-time.ts"

export interface CardMovementDay {
  name: string
  entries: number
  exits: number
}

export interface CardMovementTotal {
  card: number
  movements: number
}

export function buildCardMovementShares(
  topCards: CardMovementTotal[],
  total: number
) {
  const remaining =
    total - topCards.reduce((sum, card) => sum + card.movements, 0)
  const slices: { card?: number; movements: number }[] = [...topCards]
  if (remaining > 0) slices.push({ movements: remaining })
  return slices
}

const dayMs = 24 * 60 * 60 * 1000
const maxDailyDays = 31

function monday(day: number) {
  const daysSinceMonday = (new Date(day).getUTCDay() + 6) % 7
  return day - daysSinceMonday * dayMs
}

function dateLabel(day: number) {
  return new Date(day).toISOString().slice(0, 10)
}

export function buildCardUsageSeries(
  range: PlantDateRange,
  daily: CardMovementDay[]
) {
  const from = calendarDate(range.from).getTime()
  const to = calendarDate(range.to).getTime()
  const weekly = (to - from) / dayMs + 1 > maxDailyDays
  const buckets = new Map<number, CardMovementDay>()

  // Use the plant's civil dates as UTC calendar placeholders so DST cannot
  // change the number of dates or the Monday boundaries.
  for (let start = from; start <= to;) {
    const end = weekly ? Math.min(to, monday(start) + 6 * dayMs) : start
    const name =
      start === end
        ? dateLabel(start)
        : `${dateLabel(start)} – ${dateLabel(end)}`
    buckets.set(start, { name, entries: 0, exits: 0 })
    start = end + dayMs
  }

  for (const { name, entries, exits } of daily) {
    const day = calendarDate(name).getTime()
    if (day < from || day > to) continue
    const bucket = buckets.get(weekly ? Math.max(from, monday(day)) : day)
    if (bucket) {
      bucket.entries += entries
      bucket.exits += exits
    }
  }

  return { weekly, series: [...buckets.values()] }
}
