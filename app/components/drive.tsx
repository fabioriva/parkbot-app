import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";

const Item = ({ title, value }) => (
  <div className="flex flex-col">
    <span className="text-muted-foreground text-xs">{title}</span>
    <span className="font-bold">{value}</span>
  </div>
);

export function Drive({ drive }) {
  const { t } = useTranslation();
  return (
    <>
      <AccordionTrigger className="hover:no-underline py-2">
        <div
          className={clsx("grow", {
            "text-green-500": drive.enable.status,
            "text-red-500": !drive.enable.status,
          })}
        >
          {drive.name}&nbsp;
          {drive.enable.status
            ? t("device.drive.ready")
            : t("device.drive.not-ready")}
        </div>
        <div className="flex gap-1.5 mr-2 text-xs">
          <span>{drive.speed}&nbsp;Hz</span>
          <span>{drive.current}&nbsp;A</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-4">
          <Item title={t("device.drive.speed")} value={`${drive.speed} Hz`} />
          <Item
            title={t("device.drive.current")}
            value={`${drive.current} A`}
          />
          <Item title={t("device.drive.load")} value={`${drive.load} %`} />
          <Item title={t("device.drive.trip")} value={drive.trip} />
        </div>
      </AccordionContent>
    </>
  );
}
