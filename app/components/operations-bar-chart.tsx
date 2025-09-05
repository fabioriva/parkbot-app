import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

export function OperationsBarChart({ operations }) {
  console.log(operations);
  const chartData = operations[0].data.map((item) => ({
    hour: item.name,
    entries: item.entries,
    exits: item.exits,
  }));
  console.log(chartData);
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

  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="hour"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          // tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="entries"
          stackId="a"
          fill="var(--color-entries)"
          radius={[0, 0, 4, 4]}
        />
        <Bar
          dataKey="exits"
          stackId="a"
          fill="var(--color-exits)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
