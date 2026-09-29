import assert from "node:assert/strict"
import { test } from "node:test"
import {
  buildPlantDateRangeQuery,
  calendarDate,
  formatPlantDateTime,
  getDefaultPlantDateRange,
  isValidTimeZone,
} from "../app/lib/date-time.ts"

test("plant dates and UTC boundaries do not depend on the host time zone", async (t) => {
  const original = process.env.TZ
  try {
    for (const host of [
      "UTC",
      "Europe/Rome",
      "America/New_York",
      "Pacific/Auckland",
    ]) {
      process.env.TZ = host
      await t.test(host, () => {
        assert.equal(
          formatPlantDateTime(
            "2026-01-27T11:18:47.731Z",
            "Asia/Dubai",
            "dd/MM/yyyy HH:mm:ss.SSS"
          ),
          "27/01/2026 15:18:47.731"
        )
        assert.equal(
          formatPlantDateTime("2026-01-27T15:18:47.731+04:00", "Asia/Kolkata"),
          "27/01/2026 16:48:47"
        )
        assert.deepEqual(
          buildPlantDateRangeQuery(
            { from: "2026-01-27", to: "2026-01-27" },
            "Asia/Dubai"
          ),
          {
            dateFrom: "2026-01-26T20:00:00.000Z",
            dateTo: "2026-01-27T20:00:00.000Z",
          }
        )
        assert.deepEqual(
          buildPlantDateRangeQuery(
            { from: "2026-01-27", to: "2026-01-28" },
            "Asia/Kolkata"
          ),
          {
            dateFrom: "2026-01-26T18:30:00.000Z",
            dateTo: "2026-01-28T18:30:00.000Z",
          }
        )
        assert.deepEqual(
          getDefaultPlantDateRange(
            "Asia/Dubai",
            1,
            new Date("2026-01-27T21:30:00Z")
          ),
          { from: "2026-01-27", to: "2026-01-28" }
        )
        assert.deepEqual(
          getDefaultPlantDateRange(
            "America/Los_Angeles",
            1,
            new Date("2026-01-27T01:30:00Z")
          ),
          { from: "2026-01-25", to: "2026-01-26" }
        )
        const civilDate = "2026-03-29"
        assert.equal(
          calendarDate(civilDate).toISOString(),
          "2026-03-29T00:00:00.000Z"
        )
        // Calendar dates survive loader JSON serialization without moving a day.
        const range = JSON.parse(
          JSON.stringify({ from: civilDate, to: civilDate })
        )
        assert.deepEqual(buildPlantDateRangeQuery(range, "Europe/Rome"), {
          dateFrom: "2026-03-28T23:00:00.000Z",
          dateTo: "2026-03-29T22:00:00.000Z",
        })
        assert.deepEqual(
          buildPlantDateRangeQuery(
            { from: "2026-10-25", to: "2026-10-25" },
            "Europe/Rome"
          ),
          {
            dateFrom: "2026-10-24T22:00:00.000Z",
            dateTo: "2026-10-25T23:00:00.000Z",
          }
        )
        assert.deepEqual(
          buildPlantDateRangeQuery(
            { from: "2024-02-29", to: "2024-02-29" },
            "UTC"
          ),
          {
            dateFrom: "2024-02-29T00:00:00.000Z",
            dateTo: "2024-03-01T00:00:00.000Z",
          }
        )
        assert.deepEqual(
          buildPlantDateRangeQuery(
            { from: "2026-12-31", to: "2026-12-31" },
            "UTC"
          ),
          {
            dateFrom: "2026-12-31T00:00:00.000Z",
            dateTo: "2027-01-01T00:00:00.000Z",
          }
        )
      })
    }
  } finally {
    if (original === undefined) delete process.env.TZ
    else process.env.TZ = original
  }
})

test("invalid configuration, reversed ranges and non-existent dates are rejected", () => {
  for (const zone of [undefined, null, "", "invalid/timezone", "+04:00"])
    assert.equal(isValidTimeZone(zone), false)
  for (const zone of ["UTC", "Europe/Rome", "Asia/Dubai"])
    assert.equal(isValidTimeZone(zone), true)
  assert.throws(
    () =>
      buildPlantDateRangeQuery({ from: "2026-01-01", to: "2026-01-01" }, ""),
    RangeError
  )
  assert.throws(
    () =>
      buildPlantDateRangeQuery({ from: "2026-01-02", to: "2026-01-01" }, "UTC"),
    RangeError
  )
  for (const day of ["2026-02-29", "2026-13-01", "bad-date"])
    assert.throws(() => calendarDate(day), RangeError)
  assert.equal(formatPlantDateTime("2026-01-27 11:18:47", "Asia/Dubai"), "—")
  assert.equal(formatPlantDateTime("bad-date", "Asia/Dubai"), "—")
})

test("missing and repeated midnights require another range", () => {
  assert.throws(
    () =>
      buildPlantDateRangeQuery(
        { from: "2018-11-04", to: "2018-11-04" },
        "America/Sao_Paulo"
      ),
    /no midnight/
  )
  assert.throws(
    () =>
      buildPlantDateRangeQuery(
        { from: "2026-11-01", to: "2026-11-01" },
        "America/Havana"
      ),
    /ambiguous midnight/
  )
})

test("the repeated DST hour remains distinguishable by its offset", () => {
  assert.equal(
    formatPlantDateTime("2026-10-25T00:30:00Z", "Europe/Rome", "HH:mm:ss xxx"),
    "02:30:00 +02:00"
  )
  assert.equal(
    formatPlantDateTime("2026-10-25T01:30:00Z", "Europe/Rome", "HH:mm:ss xxx"),
    "02:30:00 +01:00"
  )
})
