import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "~/components/ui/item";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { CardWrapper } from "~/components/card-wrapper";
import { DateRange } from "~/components/date-range";
import { Operations as Statistics } from "~/components/operations-chart";
import { NoDataAlert } from "~/components/no-data-alert";
import { getToken } from "~/lib/cookie.server";
import fetcher from "~/lib/fetch";
import { m } from "@paraglide/messages.js";

import type { Route } from "./+types/operations";

export async function loader({ params, request }: Route.LoaderArgs) {
  const token = getToken(request);
  const from = format(
    subDays(startOfDay(new Date()), 7),
    "yyyy-MM-dd HH:mm:ss",
  );
  const to = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss");
  const query = `dateFrom=${from}&dateTo=${to}`;
  const url = `${process.env.BACKEND_URL}/${params?.aps}/statistics?${query}`;
  const data = await fetcher(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return { data, token };
}

export default function Operations({
  loaderData,
  params,
}: Route.ComponentProps) {
  if (!loaderData.data) return <NoDataAlert />;

  const [data, setData] = useState(loaderData.data);
  const [stacked, setStacked] = useState(true);
  const { cards, devices, operations } = data;
  const [dateFrom, dateTo] = operations.query.date.split(" ");
  const handleQuery = async ({ from, to }) => {
    const strFrom = format(startOfDay(from), "yyyy-MM-dd HH:mm:ss");
    const strTo = format(endOfDay(to), "yyyy-MM-dd HH:mm:ss");
    const query = `dateFrom=${strFrom}&dateTo=${strTo}`;
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/statistics?${query}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${loaderData.token}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3 mb-3 xl:hidden ">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>{m.operations_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.operations_description({
                from: dateFrom,
                to: dateTo,
              })}
            </ItemDescription>
          </ItemContent>
        </Item>
        <DateRange
          from={dateFrom + " 00:00"}
          to={dateTo + " 00:00"}
          handleQuery={handleQuery}
        />
      </div>
      <div className="hidden xl:block">
        <Item className="mb-3" variant="outline">
          <ItemContent>
            <ItemTitle>{m.operations_title()}</ItemTitle>
            <ItemDescription className="text-xs">
              {m.operations_description({
                from: dateFrom,
                to: dateTo,
              })}
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <DateRange
              from={dateFrom + " 00:00"}
              to={dateTo + " 00:00"}
              handleQuery={handleQuery}
            />
          </ItemActions>
        </Item>
      </div>
      <div className="grid 2xl:grid-cols-2 gap-6">
        <CardWrapper
          title={m.operations_card_title()}
          // description={m.operations_card_description({ dateFrom, dateTo })}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Label htmlFor="stacked">Stacked</Label>
              <Switch
                id="stacked"
                checked={stacked}
                onCheckedChange={setStacked}
              />
            </div>
          }
        >
          <Statistics operations={operations.data} stacked={stacked} />
        </CardWrapper>
        <CardWrapper
          title={m.operations_card_title_by_device()}
          // description={m.operations_card_description({ dateFrom, dateTo })}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Label htmlFor="stacked">Stacked</Label>
              <Switch
                id="stacked"
                checked={stacked}
                onCheckedChange={setStacked}
              />
            </div>
          }
        >
          <Statistics operations={devices.data} stacked={stacked} />
        </CardWrapper>
      </div>
    </>
  );
}
