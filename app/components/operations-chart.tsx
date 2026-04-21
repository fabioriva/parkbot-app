"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardAction,
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
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

const chartConfig = {
  entries: {
    label: "Entries",
    color: "var(--chart-1)",
  },
  exits: {
    label: "Exits",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function Operations({ operations, title, description }) {
  const chartData = operations.map((item) => ({
    name: item.name,
    entries: item.entries,
    exits: item.exits,
  }));
  const [stacked, setStacked] = useState(true);

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <CardAction className="flex items-center gap-2">
          <Label htmlFor="stacked">Stacked</Label>
          <Switch id="stacked" checked={stacked} onCheckedChange={setStacked} />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.toUpperCase()}
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
      </CardContent>
    </Card>
  );
}
