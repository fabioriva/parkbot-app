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
import { deviceT } from "~/lib/translation";

export function Device({ device }) {
  // console.log(device);
  const { t } = useTranslation();
  const [LS, LC, LA] = device.c;
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{device.name}</CardTitle>
        <CardDescription>
          {device.mode.id} {t("mode." + device.mode.key)}
        </CardDescription>
        <CardAction className="flex gap-1">
          <Badge
            className={
              LA.status
                ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                : undefined
            }
            variant={LA.status ? "default" : "secondary"}
          >
            LA
          </Badge>
          <Badge
            className={
              LC.status
                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                : undefined
            }
            variant={LC.status ? "default" : "secondary"}
          >
            LC
          </Badge>
          <Badge
            className={
              LS.status
                ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                : undefined
            }
            variant={LS.status ? "default" : "secondary"}
          >
            LS
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>{deviceT(device, t)}</p>
      </CardContent>
      {/* <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Action
        </Button>
      </CardFooter> */}
    </Card>
  );
}
