import { useTranslation } from "react-i18next";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { deviceT } from "~/lib/translation";

const Mode = ({ mode }) => {
  const { t } = useTranslation();
  return (
    <Badge
      className={
        mode.id !== 8
          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
          : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      }
    >
      {t("mode." + mode.key)}
    </Badge>
  );
};

export function Device({ device, advanced = false }) {
  const { t } = useTranslation();
  const [LS, LC, LA] = device.c;
  if (advanced) {
    return (
      <Tabs defaultValue="tab-0">
        <TabsList>
          {device.views.map((item, key) => (
            <TabsTrigger value={`tab-${key}`} key={key}>
              {t("device.view." + item.name)}
            </TabsTrigger>
          ))}
        </TabsList>
        {device.views.map((view, key) => (
          <TabsContent key={key} value={`tab-${key}`}>
            <Card size="sm">
              <CardHeader>
                <CardTitle>{device.name}</CardTitle>
                <CardDescription>
                  <p>{deviceT(device, t)}</p>
                </CardDescription>
                <CardAction className="flex items-center gap-1">
                  <Mode mode={device.mode} />
                  <div
                    className={`w-3 h-3 rounded-full ${LA.status ? "bg-red-500" : "bg-slate-100 dark:bg-slate-600"}`}
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${LC.status ? "bg-yellow-500" : "bg-slate-100 dark:bg-slate-600"}`}
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${LS.status ? "bg-green-500" : "bg-slate-100 dark:bg-slate-600"}`}
                  />
                </CardAction>
              </CardHeader>
              <CardContent>
                <p>Tab {key}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Action
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    );
  }
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{device.name}</CardTitle>
        <CardDescription>
          <p>{deviceT(device, t)}</p>
        </CardDescription>
        <CardAction className="flex items-center gap-1">
          <Mode mode={device.mode} />
          <div
            className={`w-3 h-3 rounded-full ${LA.status ? "bg-red-500" : "bg-slate-100 dark:bg-slate-600"}`}
          />
          <div
            className={`w-3 h-3 rounded-full ${LC.status ? "bg-yellow-500" : "bg-slate-100 dark:bg-slate-600"}`}
          />
          <div
            className={`w-3 h-3 rounded-full ${LS.status ? "bg-green-500" : "bg-slate-100 dark:bg-slate-600"}`}
          />
        </CardAction>
      </CardHeader>
    </Card>
  );
}
