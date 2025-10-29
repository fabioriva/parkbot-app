import { CircleStop, RotateCw /*, RotateCcw*/ } from "lucide-react";
import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { DevicePosition as Position } from "~/components/device-position";
import { DigitalIO } from "~/components/digital-io-badge";

import type { Bit, Encoder, Motor } from "~/routes/aps/types";

interface DeviceMotionProps {
  motor: Motor;
}

export function DeviceMotion({ motor }: DeviceMotionProps) {
  // console.log(motor);
  return (
    <>
      <AccordionTrigger className="flex hover:no-underline py-3">
        <div className="grow">
          {motor.name.key}
          {/* &nbsp;{motor.name.query?.id} */}
        </div>
        {motor.run.status ? (
          <Badge className="bg-yellow-200 text-yellow-600" variant="secondary">
            <RotateCw className="animate-spin" /> {motor.message}
          </Badge>
        ) : (
          <Badge variant="secondary">
            <CircleStop /> {motor.message}
          </Badge>
        )}
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-3 pt-3">
        {motor.encoders !== undefined &&
          motor.encoders.map((encoder, key) => (
            <Position encoder={encoder} key={key} />
          ))}
        <div className="flex gap-1.5 overflow-auto">
          {motor.io.map((bit, key) => (
            <DigitalIO bit={bit} key={key} />
          ))}
        </div>
      </AccordionContent>
    </>
  );
}
