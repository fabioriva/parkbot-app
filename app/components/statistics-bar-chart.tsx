import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
// export const description = "Operations statistics";

const chartConfig = {
  views: {
    label: "Operations",
  },
  entries: {
    label: "Entries",
    color: "var(--chart-2)",
  },
  exits: {
    label: "Exits",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function StatisticsBarChart({ data, date }: StatisticsBarChartProps) {
  const chartData = data;

  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("entries");
  const total = React.useMemo(
    () => ({
      entries: chartData.reduce((acc, curr) => acc + curr.entries, 0),
      exits: chartData.reduce((acc, curr) => acc + curr.exits, 0),
    }),
    []
  );

  return (
    <Card className="py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle>Operations Bar Chart - Interactive</CardTitle>
          <CardDescription>Showing total operations for {date}</CardDescription>
        </div>
        <div className="flex">
          {["entries", "exits"].map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-muted-foreground text-xs">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg leading-none font-bold sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name" // "date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                const tick =
                  date instanceof Date && !isNaN(date.getTime())
                    ? date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : value;
                return tick;
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      // year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey={activeChart}
              fill={`var(--color-${activeChart})`}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
