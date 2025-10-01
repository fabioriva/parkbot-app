// import clsx from "clsx";
// import { CircleStop, RotateCw, RotateCcw } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
// import { Badge } from "~/components/ui/badge";
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
            {/* Drives */}
            {view.drives.map((drive, key) => (
              <Drive drive={drive} key={key} />
            ))}
            {/* Motors */}
            {view.motors.map((motor, key) => (
              <Motion motor={motor} key={key} />
            ))}
          </Accordion>
        </TabsContent>
      ))}
    </Tabs>
  );
}
