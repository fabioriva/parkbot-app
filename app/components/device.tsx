import clsx from "clsx";
import { Loader } from "lucide-react";
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
import { DeviceView } from "~/components/device-view";
import { DigitalIoInfo } from "~/components/digital-io-info";
import { getDeviceInfo } from "~/lib/translation";
import { useTranslation } from "react-i18next";

interface DeviceProps {
  device: any;
  enhanced: boolean;
}

export function Device({ device, enhanced }: DeviceProps) {
  // console.log(device);
  const { t } = useTranslation();
  const [LS, LC, LA] = device.c;
  return (
    <Card
      className={clsx("py-4 gap-3", {
        "bg-warning/10": device.mode.id !== 8,
      })}
    >
      <CardHeader className="px-4">
        <CardTitle>{device.name}</CardTitle>
        <CardDescription>
          {device.mode.id} {t("aps.mode." + device.mode.key)}
        </CardDescription>
        <CardAction className="flex gap-1.5">
          {device.operation !== 0 && (
            <Loader
              role="status"
              aria-label="Loading"
              className="animate-spin"
            />
          )}
          <DigitalIoInfo io={LA}>
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
          </DigitalIoInfo>
          <DigitalIoInfo io={LC}>
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
          </DigitalIoInfo>
          <DigitalIoInfo io={LS}>
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
          </DigitalIoInfo>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 px-4">
        <span>{getDeviceInfo(device, t)}</span>
        {device.alarms.length > 0 && (
          <ul className="list-inside list-disc text-sm text-alert">
            {device.alarms.map((item, key) => (
              <li key={key}>
                AL{item?.id}&#9;
                {t("aps.alarms." + item?.key, item?.query)}
              </li>
            ))}
          </ul>
        )}
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
