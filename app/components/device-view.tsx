import clsx from "clsx";
import { CircleStop, RotateCw, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DeviceInfo } from "~/components/device-info";

interface DeviceProps {
  device: object;
}

function Info({ bit, color }) {
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
}

export function DeviceView({ device }: DeviceProps) {
  console.log(typeof device.views, device.views.length, device.views);
  const statusWord = [
    ...(device.views[0].status >>> 0).toString(2).padEnd(16, "0"),
  ].map((b, key) => ({
    b,
  }));
  console.log(statusWord);
  return (
    <Tabs defaultValue="tab-0">
      <TabsList className="w-full">
        {device.views.map((item, key) => (
          <TabsTrigger value={`tab-${key}`} key={key}>
            {item.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {device.views.map((view, key) => (
        <TabsContent value={`tab-${key}`} key={key}>
          <Accordion
            type="multiple" // "single"
            collapsible
            className="w-full"
            // defaultValue="item-0"
          >
            {/* Drives */}
            {view.drives.map((drive, key) => (
              <AccordionItem value={`drive-${key}`}>
                <AccordionTrigger className="flex hover:no-underline">
                  <div
                    className={clsx("flex gap-3 grow uppercase", {
                      "text-green-600": drive.enable,
                      "text-red-600": !drive.enable,
                    })}
                  >
                    {drive.name}&nbsp;{drive.enable ? "ready" : "not ready"}
                  </div>
                  <div>{drive.speed}&nbsp;Hz</div>
                  <div>{drive.current}&nbsp;A</div>
                  {/* <Info bit={drive.enable} color="green" /> */}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1.5">
                  <p className="flex justify-between text-muted-foreground">
                    <span>0</span>
                    <span>status word</span>
                    <span>15</span>
                  </p>
                  <div className="grid grid-cols-16 gap-0.5">
                    {[...(drive.status >>> 0).toString(2).padEnd(16, "0")].map(
                      (bit, key) => (
                        <p
                          className={clsx("rounded-xs text-center", {
                            "bg-green-600": Boolean(parseInt(bit)),
                            "bg-slate-200": !Boolean(parseInt(bit)),
                          })}
                        >
                          {bit}
                        </p>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">{"Speed"} </span>
                      <span>{drive.speed}&nbsp;Hz</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">
                        {"Current"}{" "}
                      </span>
                      <span>{drive.current}&nbsp;A</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">{"Load"} </span>
                      <span>{drive.load}&nbsp;%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">
                        {"Last trip"}{" "}
                      </span>
                      <span>{drive.trip}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
            {/* Motors */}
            {view.motors.map((motor, key) => (
              <AccordionItem value={`motor-${key}`}>
                <AccordionTrigger className="flex hover:no-underline">
                  <div className="grow">
                    {motor.name.key}&nbsp;{motor.name.query?.id}
                  </div>
                  {motor.run.status ? (
                    <Badge
                      className="bg-yellow-200 text-yellow-600"
                      variant="secondary"
                    >
                      <RotateCw className="animate-spin" /> {motor.message}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <CircleStop /> {motor.message}
                    </Badge>
                  )}
                </AccordionTrigger>
                <AccordionContent className="flex gap-1.5">
                  {motor.io.map((bit, key) => (
                    <Info bit={bit} color="green" key={key} />
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
