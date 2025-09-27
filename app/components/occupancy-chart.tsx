import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

interface OccupancyItem {
  id: string;
  value: number;
}

interface OccupancyChartProps {
  occupancy: OccupancyItem[];
}

export function OccupancyChart({ occupancy }: OccupancyChartProps) {
  const chartData = occupancy.map((item) => ({
    ...item,
    fill: `var(--color-${item.id})`,
  }));
  const chartConfig = {
    // spaces: { label: "Total spaces" },
    busy: {
      label: "Busy",
      color: "oklch(0.628 0.2577 29.23)", // rgb(255, 0, 0)
    },
    free: {
      label: "Available",
      color: "oklch(0.8664 0.294827 142.4953)", // rgb(0, 255, 0)
    },
    lock: {
      label: "Locked",
      color: "oklch(0.7017 0.3225 328.36)", // rgb(255, 0, 255)
    },
  } satisfies ChartConfig;

  const totalSpaces = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, []);

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-square mx-auto max-h-[240px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="id"
          innerRadius={60}
          strokeWidth={5}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="text-3xl font-bold fill-neutral-500"
                    >
                      {totalSpaces.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground"
                    >
                      Slots
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
