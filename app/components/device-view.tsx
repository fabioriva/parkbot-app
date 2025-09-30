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

function Info({ color, label, status }) {
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
  console.log(device.views);

  return (
    <Tabs defaultValue="tab-1">
      <TabsList className="w-full">
        <TabsTrigger value="tab-1">Main</TabsTrigger>
        <TabsTrigger value="tab-2">Garage</TabsTrigger>
        <TabsTrigger value="tab-3">Silomat</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">
        {/* <DeviceInfo /> */}
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
      </TabsContent>
    </Tabs>
  );
}
