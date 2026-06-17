import clsx from "clsx";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { m } from "@paraglide/messages.js";

const Item = ({ title, value }) => (
  <div className="flex flex-col">
    <span className="text-muted-foreground text-xs">{title}</span>
    <span className="font-bold">{value}</span>
  </div>
);

export function Drive({ drive }) {
  return (
    <>
      <AccordionTrigger className="hover:no-underline py-1.5 flex items-center gap-1.5">
        <div
          className={clsx("grow", {
            "text-green-500": drive.enable.status,
            "text-red-500": !drive.enable.status,
          })}
        >
          {drive.name}&nbsp;
          {drive.enable.status ? m.drive_ready() : m.drive_not_ready()}
        </div>
        <div className="flex gap-1.5 mr-2 text-xs">
          <span>{drive.speed}&nbsp;Hz</span>
          <span>{drive.current}&nbsp;A</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-4">
          <Item title={m.drive_speed()} value={`${drive.speed} Hz`} />
          <Item title={m.drive_current()} value={`${drive.current} A`} />
          <Item title={m.drive_load()} value={`${drive.load} %`} />
          <Item title={m.drive_trip()} value={drive.trip} />
        </div>
      </AccordionContent>
    </>
  );
}
