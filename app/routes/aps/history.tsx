import { format, endOfDay, startOfDay, subDays } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useIsMobile } from "~/hooks/use-mobile";
import { HistoryList } from "~/components/history-list";
import { HistoryTable } from "~/components/history-table";
import fetcher from "~/lib/fetch.server";

import type { Route } from "./+types/history";

export async function loader({ params }: Route.LoaderArgs) {
  const from = format(
    subDays(startOfDay(new Date()), 3),
    "yyyy-MM-dd HH:mm:ss"
  );
  const to = format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss");
  const filter = "a";
  const query = `system=0&dateFrom=${from}&dateTo=${to}&filter=${filter}&device=0&number=0`;
  const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/history?${query}`;
  const data = await fetcher(url);
  return { data };
}

export default function History({ loaderData, params }: Route.ComponentProps) {
  // console.log(loaderData?.data);
  if (!loaderData?.data) return <Error />;

  const { count, query } = loaderData?.data;
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("aps.history.title")}</CardTitle>
        <CardDescription>
          {t("aps.history.description", {
            from: loaderData?.data.dateFrom,
            to: loaderData?.data.dateTo,
            count,
          })}
        </CardDescription>
        {/* <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction> */}
      </CardHeader>
      <CardContent>
        {isMobile ? (
          <HistoryList history={query} />
        ) : (
          <HistoryTable history={query} />
        )}
      </CardContent>
      {/* <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter> */}
    </Card>
  );
}
