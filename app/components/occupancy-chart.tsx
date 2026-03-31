"use client";

import * as React from "react";
import { Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";

const chartConfig = {
  busy: {
    label: "Busy",
    color: "var(--chart-5)",
  },
  free: {
    label: "Vacant",
    color: "var(--chart-2)",
  },
  lock: {
    label: "Locked",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function Occupancy({ occupancy }) {
  const chartData = occupancy.map((item) => ({
    ...item,
    fill: `var(--color-${item.id})`,
  }));
  const [busy, free, lock] = occupancy;
  const totalSpaces = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, []);
  return (
    <Card size="sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>Parking occupancy</CardTitle>
        <CardDescription>
          Total number of parking spaces: {totalSpaces}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          // className="mx-auto aspect-square max-h-[250px]"
        >
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
      </CardContent>
    </Card>
  );
}
