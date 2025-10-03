import clsx from "clsx";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";

interface DeviceDriveProps {
  drive: object;
}

export function DeviceDrive({ drive }: DeviceDriveProps) {
  // console.log(drive);
  return (
    <>
      <AccordionTrigger className="flex hover:no-underline py-3">
        <div
          className={clsx("grow", {
            "text-green-600": drive.enable.status,
            "text-red-600": !drive.enable.status,
          })}
        >
          {drive.name}&nbsp;{drive.enable.status ? "ready" : "not ready"}
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
            <span className="text-muted-foreground text-xs">Speed</span>
            <span>{drive.speed}&nbsp;Hz</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Current</span>
            <span>{drive.current}&nbsp;A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Load</span>
            <span>{drive.load}&nbsp;%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">
              {"Last trip"}{" "}
            </span>
            <span>{drive.trip}</span>
          </div>
        </div>
      </AccordionContent>
    </>
  );
}
