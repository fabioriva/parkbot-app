import clsx from "clsx";
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
            {view.drives.map((drive, key) => (
              <AccordionItem value={`item-${key}`}>
                <AccordionTrigger className="flex hover:no-underline">
                  <div
                    className={clsx("flex gap-3 grow", {
                      "text-green-600": drive.enable,
                    })}
                  >
                    {drive.name}
                  </div>
                  <div>{drive.speed}&nbsp;Hz</div>
                  <div>{drive.current}&nbsp;A</div>
                  {/* <Info bit={drive.enable} color="green" /> */}
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>0</span>
                    <span>status word</span>
                    <span>15</span>
                  </div>
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
          </Accordion>
        </TabsContent>
      ))}
      {/* <TabsContent value="tab-1">
        <DeviceInfo />
        <Accordion className="border px-3 w-full" type="single" collapsible>
          <AccordionItem value="item-1">
            <AccordionTrigger className="flex hover:no-underline">
              <div className="flex gap-3 grow">IV1</div>
              <div>0 Hz</div>
              <div>0 A</div>
              <Info color="green" label="IV1" status={true} />
            </AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Shipping Details</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We offer worldwide shipping through trusted courier partners.
                Standard delivery takes 3-5 business days, while express
                shipping ensures delivery within 1-2 business days.
              </p>
              <p>
                All orders are carefully packaged and fully insured. Track your
                shipment in real-time through our dedicated tracking portal.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </TabsContent>
      <TabsContent value="tab-2">
        <DeviceInfo />
      </TabsContent>
      <TabsContent value="tab-3">
        <DeviceInfo />
      </TabsContent> */}
    </Tabs>
  );
}
