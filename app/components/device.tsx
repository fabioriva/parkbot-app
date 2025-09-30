// import { Badge } from "~/components/ui/badge";
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
import { DeviceInfo } from "~/components/device-info";
import { DeviceView } from "~/components/device-view";

interface DeviceProps {
  device: object;
}

export function Device({ device }: DeviceProps) {
  const [LS, LC, LA] = device.c;
  const ADVANCED = true;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{device.name}</CardTitle>
        <CardDescription>{`Mode ${device.mode.id} - ${device.mode.key}`}</CardDescription>
        <CardAction className="flex gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={LA.status ? "#fecaca" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={LA.status ? "text-red-600" : "text-slate-300"}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={LC.status ? "#fed7aa" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={LC.status ? "text-orange-600" : "text-slate-300"}
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="1" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={LS.status ? "#bbf7d0" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={LS.status ? "text-green-600" : "text-slate-300"}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          {/* <Info color="red" label="LA" status={LA.status} />
          <Info color="orange" label="LC" status={LC.status} />
          <Info color="green" label="LS" status={LS.status} /> */}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DeviceInfo />
        {ADVANCED && <DeviceView device={device} />}
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
