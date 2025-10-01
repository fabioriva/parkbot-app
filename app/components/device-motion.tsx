import { CircleStop, RotateCw, RotateCcw } from "lucide-react";
import {
  // Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";

interface DeviceMotionProps {
  motor: object;
}

const DigitalIO = ({ bit, color }) => {
  const { label, status } = bit;
  return (
    <Badge
      className={
        status
          ? `bg-${color}-200 text-${color}-600`
          : "bg-slate-100 text-slate-600"
      }
      variant="default"
    >
      {label}
    </Badge>
  );
};

export function DeviceMotion({ motor }: DeviceMotionProps) {
  return (
    <AccordionItem value={`motor-${motor.id}`}>
      <AccordionTrigger className="flex hover:no-underline py-2">
        <div className="grow">
          {motor.name.key}&nbsp;{motor.name.query?.id}
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
      <AccordionContent className="flex flex-col gap-1.5">
        <p className="text-muted-foreground">PLC digital I/O</p>
        <div className="flex gap-1.5">
          {motor.io.map((bit, key) => (
            <DigitalIO bit={bit} color="green" key={key} />
          ))}
        </div>
        {/* <div className="flex gap-3">
                    {motor.encoders !== undefined &&
                      motor.encoders.map((encoder, key) => (
                        <>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">
                              Position{" "}
                            </span>
                            <span>{encoder.position}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-muted-foreground">
                              Destination{" "}
                            </span>
                            <span>{encoder.destination}</span>
                          </div>
                        </>
                      ))}
                  </div> */}
      </AccordionContent>
    </AccordionItem>
  );
}
