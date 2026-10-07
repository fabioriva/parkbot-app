"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart"
import { m } from "@paraglide/messages.js"

interface OperationsProps {
  operations: {
    name: string | number
    entries: number
    exits: number
  }[]
  stacked?: boolean
}

export function Operations({ operations, stacked = false }: OperationsProps) {
  const chartConfig = {
    entries: {
      label: m.operations_entries(),
      color: "var(--chart-1)",
    },
    exits: {
      label: m.operations_exits(),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig
  const chartData = operations.map((item) => ({
    name: item.name,
    entries: item.entries,
    exits: item.exits,
  }))

  return (
    <ChartContainer config={chartConfig} className="min-h-50 w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => String(value).toUpperCase()}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="entries"
          fill="var(--color-entries)"
          radius={stacked ? [0, 0, 6, 6] : [6, 6, 0, 0]}
          stackId={(stacked && "a") || undefined}
        />
        <Bar
          dataKey="exits"
          fill="var(--color-exits)"
          radius={stacked ? [6, 6, 0, 0] : [6, 6, 0, 0]}
          stackId={(stacked && "a") || undefined}
        />
      </BarChart>
    </ChartContainer>
  )
}
