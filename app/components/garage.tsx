import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { IoTooltip } from "~/components/io-tooltip";
import { Sensor } from "~/components/sensor-svg";

export function Garage({ sensors }) {
  const [FRE, FPE, FLA, FLP, FDR, FDL] = sensors;
  return (
    <div className="svg-container">
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 100 50"
      >
        <image width="100%" height="100%" href="/car.png" />
        <Sensor x="80" y="45" sensor={FRE} />
        <Sensor x="45" y="25" sensor={FPE} />
        <Sensor x="97" y="25" sensor={FLA} />
        <Sensor x="3" y="25" sensor={FLP} />
        <Sensor x="45" y="45" sensor={FDR} />
        <Sensor x="45" y="5" sensor={FDL} />
      </svg>
      <Accordion collapsible="true">
        <AccordionItem value="garage-sensors">
          <AccordionTrigger className="hover:no-underline py-1.5 flex items-center gap-1.5">
            Garage sensors
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex gap-1.5 overflow-auto">
              {sensors.map((item, key) => (
                <IoTooltip io={item} key={key}>
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
                </IoTooltip>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
