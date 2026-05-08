import { useTranslation } from "react-i18next";
import { Loader } from "lucide-react";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { IoInfo } from "~/components/io-info";
import { Position } from "~/components/position";

export function Motion({ motor }) {
  const { t } = useTranslation();
  const id = motor.name.query?.id !== 0 ? motor.name.query?.id : "";
  const isRunning = motor.run.status;
  return (
    <>
      <AccordionTrigger className="hover:no-underline py-1.5 flex items-center gap-1.5">
        <div className="grow">
          {t("device.motion." + motor.name.key, { id })}
        </div>
        <Badge
          className={
            isRunning
              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : undefined
          }
          variant="ghost"
        >
          {isRunning !== 0 && <Loader className="animate-spin" />}
          {t("device.motion." + motor.message)}
        </Badge>
      </AccordionTrigger>
      <AccordionContent className="space-y-3">
        <div className="flex flex-col gap-1.5 ">
          {motor.encoders !== undefined &&
            motor.encoders.map((encoder, key) => (
              <Position encoder={encoder} key={key} />
            ))}
        </div>

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
