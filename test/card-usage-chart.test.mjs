import assert from "node:assert/strict"
import { test } from "node:test"
import {
  buildCardMovementShares,
  buildCardUsageSeries,
} from "../app/lib/card-usage-chart.ts"

test("the other-cards slice contains all movements outside the five ranked cards", () => {
  const topCards = [
    { card: 4, movements: 20 },
    { card: 2, movements: 15 },
    { card: 3, movements: 10 },
    { card: 1, movements: 6 },
    { card: 8, movements: 5 },
  ]
  assert.deepEqual(buildCardMovementShares(topCards, 80), [
    ...topCards,
    { movements: 24 },
  ])
})

test("no other-cards slice is added when every movement belongs to a listed card", () => {
  const topCards = [{ card: 4, movements: 20 }]
  assert.deepEqual(buildCardMovementShares(topCards, 20), topCards)
  assert.deepEqual(buildCardMovementShares([], 0), [])
})

test("includes leading, intervening and trailing zero days across a DST change", () => {
  assert.deepEqual(
    buildCardUsageSeries({ from: "2026-03-27", to: "2026-03-31" }, [
      { name: "2026-03-28", entries: 1, exits: 0 },
      { name: "2026-03-30", entries: 0, exits: 1 },
    ]),
    {
      weekly: false,
      series: [
        { name: "2026-03-27", entries: 0, exits: 0 },
        { name: "2026-03-28", entries: 1, exits: 0 },
        { name: "2026-03-29", entries: 0, exits: 0 },
        { name: "2026-03-30", entries: 0, exits: 1 },
        { name: "2026-03-31", entries: 0, exits: 0 },
      ],
    }
  )
})

test("groups longer periods by Monday, including empty and partial weeks", () => {
  assert.deepEqual(
    buildCardUsageSeries({ from: "2026-12-30", to: "2027-01-30" }, [
      { name: "2026-12-29", entries: 7, exits: 7 },
      { name: "2026-12-30", entries: 2, exits: 0 },
      { name: "2027-01-03", entries: 1, exits: 2 },
      { name: "2027-01-04", entries: 0, exits: 3 },
      { name: "2027-01-30", entries: 1, exits: 1 },
      { name: "2027-01-31", entries: 8, exits: 8 },
    ]),
    {
      weekly: true,
      series: [
        { name: "2026-12-30 – 2027-01-03", entries: 3, exits: 2 },
        { name: "2027-01-04 – 2027-01-10", entries: 0, exits: 3 },
        { name: "2027-01-11 – 2027-01-17", entries: 0, exits: 0 },
        { name: "2027-01-18 – 2027-01-24", entries: 0, exits: 0 },
        { name: "2027-01-25 – 2027-01-30", entries: 1, exits: 1 },
      ],
    }
  )
})

test("keeps a 31-day interval on the daily scale", () => {
  const { weekly, series } = buildCardUsageSeries(
    { from: "2026-10-01", to: "2026-10-31" },
    []
  )
  assert.equal(weekly, false)
  assert.equal(series.length, 31)
})
