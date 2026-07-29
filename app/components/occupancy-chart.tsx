"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { safeMessageT } from "~/lib/trans";

export function Occupancy({ occupancy }) {
  const chartConfig = {
    busy: {
      label: safeMessageT("occupancy", "busy"),
      color: "var(--chart-5)",
    },
    free: {
      label: safeMessageT("occupancy", "free"),
      color: "var(--chart-2)",
    },
    lock: {
      label: safeMessageT("occupancy", "lock"),
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;
  const chartData = occupancy.map((item) => ({
    ...item,
    fill: `var(--color-${item.id})`,
  }));
  return (
    <ChartContainer config={chartConfig}>
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie data={chartData} dataKey="value" nameKey="id" />
        <ChartLegend
          content={<ChartLegendContent nameKey="id" />}
          className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
