"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pie, PieChart } from "recharts";
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
import { ExternalLink } from "~/components/external-link-button";

export function Occupancy({ occupancy, link = false }) {
  const { t } = useTranslation();
  const chartConfig = {
    busy: {
      label: t("occupancy.busy"),
      color: "var(--chart-5)",
    },
    free: {
      label: t("occupancy.free"),
      color: "var(--chart-2)",
    },
    lock: {
      label: t("occupancy.lock"),
      color: "var(--chart-4)",
    },
  } satisfies ChartConfig;
  const chartData = occupancy.map((item) => ({
    ...item,
    fill: `var(--color-${item.id})`,
  }));
  const [busy, free, lock] = occupancy;
  const totalSpaces = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0);
  }, []);
  return (
    <Card size="sm">
      <CardHeader className="items-center pb-0">
        <CardTitle>{t("occupancy.title")}</CardTitle>
        <CardDescription>
          {t("occupancy.description", { count: totalSpaces })}
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          {link && <ExternalLink link={link} />}
        </CardAction>
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
