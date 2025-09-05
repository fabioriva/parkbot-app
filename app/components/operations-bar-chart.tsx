import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

interface OperationsItem {
  name: string;
  entries: number;
  exits: number;
  total: number;
}

interface OperationsBarChartProps {
  operations: OperationsItem[];
}

export function OperationsBarChart({ operations }: OperationsBarChartProps) {
  const chartData = operations.map((item) => ({
    hour: item.name,
    entries: item.entries,
    exits: item.exits,
  }));
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
