import { AlertCircleIcon, CheckCircle2Icon, PopcornIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
// import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface DeviceProps {
  device: object;
}

// function Info({}) {

// }

export function Device({ device }: DeviceProps) {
  const [LS, LC, LA] = device.c;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{device.name}</CardTitle>
        <CardDescription>{`Mode ${device.mode.id} - ${device.mode.key}`}</CardDescription>
        <CardAction className="flex gap-1.5">
          <Badge
            className={
              LA.status
                ? "bg-red-200 text-red-600"
                : "bg-slate-100 text-slate-600"
            }
            variant="default"
          >
            LA
          </Badge>
          <Badge
            className={
              LC.status
                ? "bg-orange-200 text-orange-600"
                : "bg-slate-100 text-slate-600"
            }
            variant="default"
          >
            LC
          </Badge>
          <Badge
            className={
              LS.status
                ? "bg-green-200 text-green-600"
                : "bg-slate-100 text-slate-600"
            }
            variant="default"
          >
            LS
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Alert className="text-green-600">
          <CheckCircle2Icon />
          <AlertTitle>Success! Your changes have been saved</AlertTitle>
          <AlertDescription>
            This is an alert with icon, title and description.
          </AlertDescription>
        </Alert>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Vacant {free.value}, occupied {busy.value} and locked {lock.value}.
        </div>
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
