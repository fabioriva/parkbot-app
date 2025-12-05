import { useTranslation } from "react-i18next";
// import { CircleStop, RotateCw /*, RotateCcw*/ } from "lucide-react";
import { Loader } from "lucide-react";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { DevicePosition as Position } from "~/components/device-position";
import { DigitalIoInfo } from "~/components/digital-io-info";

import type { Bit, Encoder, Motor } from "~/routes/aps/types";

interface DeviceMotionProps {
  motor: Motor;
}

export function DeviceMotion({ motor }: DeviceMotionProps) {
  // console.log(motor);
  const { t } = useTranslation();
  const id = motor.name.query?.id !== 0 ? motor.name.query?.id : "";
  const isRunning = motor.run.status;
  return (
    <>
      <AccordionTrigger className="flex hover:no-underline py-3">
        <div className="grow">
          {t("aps.device.motion." + motor.name.key, { id })}
        </div>
        <Badge
          className={isRunning ? "bg-warning/10 dark:bg-warning/20" : ""}
          variant="secondary"
        >
          {/* {isRunning ? <RotateCw className="animate-spin" /> : <CircleStop />}{" "} */}
          {isRunning !== 0 && <Loader className="animate-spin" />}
          {t("aps.device.motion." + motor.message)}
        </Badge>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 pt-3">
        {motor.encoders !== undefined &&
          motor.encoders.map((encoder, key) => (
            <Position encoder={encoder} key={key} />
          ))}
        <div className="flex gap-1.5 overflow-auto">
          {motor.io.map((item, key) => (
            <DigitalIoInfo io={item} key={key}>
              <Badge
                className={
                  item.status
                    ? `bg-ready/10 dark:bg-ready/20 text-ready`
                    : "bg-slate-500/10 text-slate-500"
                }
                variant="default"
              >
                {item.label}
              </Badge>
            </DigitalIoInfo>
          ))}
        </div>
      </AccordionContent>
    </>
  );
}
