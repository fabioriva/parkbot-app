import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { DeviceDrive as Drive } from "~/components/device-drive";
import { DeviceMotion as Motion } from "~/components/device-motion";

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
        <TabsContent value={`tab-${key}`} key={key}>
          <Accordion
            type="multiple" // "single"
            collapsible
            className="w-full"
            // defaultValue="item-0"
          >
            {view.drives.map((drive, key) => (
              <AccordionItem value={`drive-${key}`}>
                <Drive drive={drive} key={key} />
              </AccordionItem>
            ))}
            {view.motors.map((motor, key) => (
              <AccordionItem value={`motor-${key}`}>
                <Motion motor={motor} key={key} />
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
