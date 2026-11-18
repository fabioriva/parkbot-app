import { buildPlantDateRangeQuery } from "./date-time"

export type HistoryParameters = {
  dateFrom: string
  dateTo: string
  card: number
  device: number
  stall: number
}

export function historySearchParams(
  parameters: HistoryParameters,
  page: number
) {
  return new URLSearchParams(
    Object.entries({ ...parameters, page, limit: 15 }).map(([key, value]) => [
      key,
      String(value),
    ])
  )
}

export function reportParameters(search: URLSearchParams, timeZone: string) {
  const get = (key: string) => {
    if (search.getAll(key).length !== 1)
      throw new RangeError("Invalid report parameter")
    return search.get(key)!
  }
  const range = { from: get("from"), to: get("to") }
  const filter = (key: string) => {
    const value = get(key)
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)))
      throw new RangeError("Invalid report filter")
    return Number(value)
  }
  return {
    range,
    parameters: {
      ...buildPlantDateRangeQuery(range, timeZone),
      card: filter("card"),
      device: filter("device"),
      stall: filter("stall"),
    },
  }
}
