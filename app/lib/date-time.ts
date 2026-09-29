import { formatInTimeZone, fromZonedTime } from "date-fns-tz"

/** Civil dates selected in the plant calendar, inclusive at both ends. */
export type PlantDateRange = { from: string; to: string }

export function isValidTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim() || /^[+-]/.test(value))
    return false
  try {
    new Intl.DateTimeFormat("en", { timeZone: value })
    return true
  } catch {
    return false
  }
}

function requireTimeZone(timeZone: string): void {
  if (!isValidTimeZone(timeZone))
    throw new RangeError("Invalid plant time zone")
}

/** UTC is only a carrier for civil calendar dates, never the plant's midnight. */
export function calendarDate(value: string): Date {
  const date = new Date(`${value}T00:00:00.000Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw new RangeError("Invalid calendar date")
  }
  return date
}

function shiftCalendarDate(value: string, days: number): string {
  const date = calendarDate(value)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function formatPlantDateTime(
  value: Date | string,
  timeZone: string,
  pattern = "dd/MM/yyyy HH:mm:ss"
): string {
  requireTimeZone(timeZone)
  // Do not silently interpret legacy timestamps in the browser's time zone.
  if (typeof value === "string" && !/(?:Z|[+-]\d{2}:\d{2})$/i.test(value))
    return "—"
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return "—"
  return formatInTimeZone(date, timeZone, pattern)
}

export function getDefaultPlantDateRange(
  timeZone: string,
  daysBefore = 1,
  now = new Date()
): PlantDateRange {
  requireTimeZone(timeZone)
  const to = formatInTimeZone(now, timeZone, "yyyy-MM-dd")
  return { from: shiftCalendarDate(to, -daysBefore), to }
}

function plantMidnight(value: string, timeZone: string): string {
  calendarDate(value)
  const wallTime = `${value}T00:00:00`
  const date = fromZonedTime(wallTime, timeZone)
  if (formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm:ss") !== wallTime) {
    throw new RangeError("This date has no midnight in the plant time zone")
  }
  // Reject repeated midnights instead of silently choosing a DST occurrence.
  // Sample the offsets on either side of the boundary to find other candidates.
  for (const delta of [-36, 36]) {
    const sample = new Date(date.getTime() + delta * 3_600_000)
    const offset = formatInTimeZone(sample, timeZone, "xxx")
    const candidate = new Date(`${wallTime}${offset}`)
    if (
      candidate.getTime() !== date.getTime() &&
      formatInTimeZone(candidate, timeZone, "yyyy-MM-dd'T'HH:mm:ss") ===
        wallTime
    ) {
      throw new RangeError(
        "This date has an ambiguous midnight in the plant time zone"
      )
    }
  }
  return date.toISOString()
}

export function buildPlantDateRangeQuery(
  range: PlantDateRange,
  timeZone: string
): { dateFrom: string; dateTo: string } {
  requireTimeZone(timeZone)
  calendarDate(range.from)
  calendarDate(range.to)
  if (range.from > range.to) throw new RangeError("Invalid date range")
  return {
    dateFrom: plantMidnight(range.from, timeZone),
    dateTo: plantMidnight(shiftCalendarDate(range.to, 1), timeZone),
  }
}
