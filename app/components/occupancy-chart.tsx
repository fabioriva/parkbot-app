"use client";

// import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { m } from "@paraglide/messages.js";

export function Occupancy({ occupancy }) {
  const chartConfig = {
    busy: {
      label: m["occupancy.busy"](),
      color: "var(--chart-5)",
    },
    free: {
      label: m["occupancy.free"](),
      color: "var(--chart-2)",
    },
    lock: {
      label: m["occupancy.lock"](),
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;
  const chartData = occupancy.map((item) => ({
    ...item,
    fill: `var(--color-${item.id})`,
  }));
  // const [busy, free, lock] = occupancy;
  // const totalSpaces = useMemo(() => {
  //   return chartData.reduce((acc, curr) => acc + curr.value, 0);
  // }, []);
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
