import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";

type Bit = {
  addr: string;
  label: string;
  status: number;
};

type Drive = {
  enable: Bit;
  current: number;
  load: number;
  name: string;
  speed: number;
  status: number;
  trip: number;
};

interface DeviceDriveProps {
  drive: Drive;
}

export function DeviceDrive({ drive }: DeviceDriveProps) {
  // console.log(drive);
  const { t } = useTranslation();
  return (
    <>
      <AccordionTrigger className="flex hover:no-underline py-3">
        <div
          className={clsx("grow", {
            "text-green-600": drive.enable.status,
            "text-red-600": !drive.enable.status,
          })}
        >
          {drive.name}&nbsp;
          {drive.enable.status
            ? t("aps.device.drive.ready")
            : t("aps.device.drive.not-ready")}
        </div>
        <div>{drive.speed}&nbsp;Hz</div>
        <div>{drive.current}&nbsp;A</div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 pt-3">
        <div>
          <p className="flex justify-between text-muted-foreground text-xs">
            <span>0</span>
            <span>status word</span>
            <span>15</span>
          </p>
          <div className="grid grid-cols-16 gap-0.5">
            {[...(drive.status >>> 0).toString(2).padEnd(16, "0")].map(
              (bit, key) => (
                <p
                  className={clsx("rounded-xs text-center", {
                    "bg-green-200 text-green-600": Boolean(parseInt(bit)),
                    "bg-slate-100 text-slate-600": !Boolean(parseInt(bit)),
                  })}
                  key={key}
                >
                  {bit}
                </p>
              )
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {t("aps.device.drive.speed")}
            </span>
            <span>{drive.speed}&nbsp;Hz</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {t("aps.device.drive.current")}
            </span>
            <span>{drive.current}&nbsp;A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {t("aps.device.drive.load")}
            </span>
            <span>{drive.load}&nbsp;%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {t("aps.device.drive.trip")}
            </span>
            <span>{drive.trip}</span>
          </div>
        </div>
      </AccordionContent>
    </>
  );
}
