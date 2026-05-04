"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
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
import { ExternalLink } from "~/components/external-link-button";

export function Operations({
  operations,
  title,
  description,
  layout = "horizontal",
  link = false,
}) {
  // console.log(operations);
  const { t } = useTranslation();
  const chartConfig = {
    entries: {
      label: t("operations.entries"),
      color: "var(--chart-1)",
    },
    exits: {
      label: t("operations.exits"),
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;
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
          {link && <ExternalLink link={link} />}
        </CardAction>
      </CardHeader>
      <CardContent>
        {layout === "vertical" ? (
          <ChartContainer config={chartConfig}>
            <BarChart
              accessibilityLayer
              data={chartData}
              layout="vertical"
              margin={{
                left: -20,
              }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                interval={0} // If set 0, all the ticks will be shown.
                tickFormatter={(value) => String(value).toUpperCase()}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="entries"
                fill="var(--color-entries)"
                radius={[3, 0, 0, 3]}
                stackId={(stacked && "a") || undefined}
              >
                {/* <LabelList
                  dataKey="entries"
                  position="insideLeft"
                  offset={8}
                  className="fill-(--color-label)"
                  fontSize={12}
                /> */}
              </Bar>
              <Bar
                dataKey="exits"
                fill="var(--color-exits)"
                radius={[0, 3, 3, 0]}
                stackId={(stacked && "a") || undefined}
              >
                {/* <LabelList
                  dataKey="exits"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                /> */}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => String(value).toUpperCase()}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="line" />}
              />
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
        )}
      </CardContent>
    </Card>
  );

  // return (
  //   <Card size="sm">
  //     <CardHeader>
  //       <CardTitle>{title}</CardTitle>
  //       <CardDescription>{description}</CardDescription>
  //       <CardAction className="flex items-center gap-2">
  //         <Label htmlFor="stacked">Stacked</Label>
  //         <Switch id="stacked" checked={stacked} onCheckedChange={setStacked} />
  //         {link && <ExternalLink link={link} />}
  //       </CardAction>
  //     </CardHeader>
  //     <CardContent>
  //       <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
  //         <BarChart accessibilityLayer data={chartData}>
  //           <CartesianGrid vertical={false} />
  //           <XAxis
  //             dataKey="name"
  //             tickLine={false}
  //             tickMargin={10}
  //             axisLine={false}
  //             tickFormatter={(value) => String(value).toUpperCase()}
  //           />
  //           <ChartTooltip content={<ChartTooltipContent hideLabel />} />
  //           <ChartLegend content={<ChartLegendContent />} />
  //           <Bar
  //             dataKey="entries"
  //             fill="var(--color-entries)"
  //             radius={stacked ? [0, 0, 6, 6] : [6, 6, 0, 0]}
  //             stackId={(stacked && "a") || undefined}
  //           />
  //           <Bar
  //             dataKey="exits"
  //             fill="var(--color-exits)"
  //             radius={stacked ? [6, 6, 0, 0] : [6, 6, 0, 0]}
  //             stackId={(stacked && "a") || undefined}
  //           />
  //         </BarChart>
  //       </ChartContainer>
  //     </CardContent>
  //   </Card>
  // );
}
