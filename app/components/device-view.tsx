import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DeviceDrive as Drive } from "~/components/device-drive";
import { DeviceMotion as Motion } from "~/components/device-motion";
import { DeviceSilomat as Silomat } from "~/components/device-silomat";

interface DeviceProps {
  device: object;
}

export function DeviceView({ device }: DeviceProps) {
  // console.log(device);
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
        <TabsContent
          className="flex flex-col gap-3"
          key={key}
          value={`tab-${key}`}
        >
          {view.name === "view-sil" && <Silomat sensors={view.sensors} />}
          <Accordion
            type="multiple" // "single"
            collapsible="true"
            className="w-full"
            // defaultValue="item-0"
          >
            {view.drives.map((drive, key) => (
              <AccordionItem
                value={`drive-${key}`}
                key={key}
                className="border border-b-0 last:border-b first:rounded-t-md last:rounded-b-md px-4"
              >
                <Drive drive={drive} />
              </AccordionItem>
            ))}
            {view.motors.map((motor, key) => (
              <AccordionItem
                value={`motor-${key}`}
                key={key}
                className="border border-b-0 last:border-b first:rounded-t-md last:rounded-b-md px-4"
              >
                <Motion motor={motor} />
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
