import { useTranslation } from "react-i18next";
import { Loader } from "lucide-react";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { IoInfo } from "~/components/io-info";
// import { DevicePosition as Position } from "~/components/device-position";

export function Motion({ motor }) {
  const { t } = useTranslation();
  const id = motor.name.query?.id !== 0 ? motor.name.query?.id : "";
  const isRunning = motor.run.status;
  return (
    <>
      <AccordionTrigger className="hover:no-underline">
        <div className="grow">
          {t("device.motion." + motor.name.key, { id })}
        </div>
        <Badge
          className={
            isRunning
              ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
              : undefined
          }
          variant="ghost"
        >
          {isRunning !== 0 && <Loader className="animate-spin" />}
          {t("device.motion." + motor.message)}
        </Badge>
      </AccordionTrigger>
      <AccordionContent>
        {/* {motor.encoders !== undefined &&
          motor.encoders.map((encoder, key) => (
            <Position encoder={encoder} key={key} />
          ))} */}
        <div className="flex gap-1.5 overflow-auto">
          {motor.io.map((item, key) => (
            <IoInfo io={item} key={key}>
              <Badge
                className={
                  item.status
                    ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                    : "bg-slate-50 text-slate-700 dark:bg-slate-600 dark:text-slate-300"
                }
                key={key}
              >
                {item.label}
              </Badge>
            </IoInfo>
          ))}
        </div>
      </AccordionContent>
    </>
  );
}
