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
import { DeviceInfo } from "~/components/device-info";
import { DeviceView } from "~/components/device-view";

interface DeviceProps {
  device: object;
}

export function Device({ device, enhanced }: DeviceProps) {
  // console.log(device);
  const [LS, LC, LA] = device.c;
  return (
    <Card className="max-w-sm py-4">
      <CardHeader className="px-4">
        <CardTitle>{device.name}</CardTitle>
        <CardDescription>{`Mode ${device.mode.id} - ${device.mode.key}`}</CardDescription>
        <CardAction className="flex gap-1.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            // fill={LA.status ? "#fecaca" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              LA.status
                ? "fill-alert/10 dark:fill-alert/20 text-alert"
                : "fill-none text-slate-300"
            }
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
            // fill={LC.status ? "#fed7aa" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              LC.status
                ? "fill-warning/10 dark:fill-warning/20 text-warning"
                : "fill-none text-slate-300"
            }
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="1" />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            // fill={LS.status ? "fill-green-500" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={
              LS.status
                ? "fill-ready/10 dark:fill-ready/20 text-ready"
                : "fill-none text-slate-300"
            }
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <DeviceInfo device={device} />
        {enhanced && <DeviceView device={device} />}
      </CardContent>
      {enhanced && (
        <CardFooter className="flex gap-3">
          <Button>Action 1</Button>
          <Button>Action 2</Button>
          <Button>Action 3</Button>
        </CardFooter>
      )}
    </Card>
  );
}
