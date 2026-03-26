"use client";

import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ];

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "var(--chart-1)",
//   },
//   mobile: {
//     label: "Mobile",
//     color: "var(--chart-2)",
//   },
// } satisfies ChartConfig;

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

export function Operations({ operations }) {
  const chartData = operations.map((item) => ({
    hour: item.name,
    entries: item.entries,
    exits: item.exits,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily operations</CardTitle>
        <CardDescription>{format(new Date(), "MM/dd/yyyy")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.toUpperCase()}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="entries"
              stackId="a"
              fill="var(--color-entries)"
              // radius={[0, 0, 10, 10]}
            />
            <Bar
              dataKey="exits"
              stackId="a"
              fill="var(--color-exits)"
              // radius={[10, 10, 0, 0]}
            />
            {/* <Bar
              dataKey="entries"
              fill="var(--color-entries)"
              radius={[10, 10, 0, 0]}
            />
            <Bar
              dataKey="exits"
              fill="var(--color-exits)"
              radius={[10, 10, 0, 0]}
            /> */}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {/* <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div> */}
      </CardFooter>
    </Card>
  );
}
