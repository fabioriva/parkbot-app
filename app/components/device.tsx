import clsx from "clsx";
import { AlertCircleIcon } from "lucide-react";
import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Spinner } from "~/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ActionPP } from "~/components/action-pp";
import { CardWrapper } from "~/components/card-wrapper";
import { Drive } from "~/components/drive";
import { Garage } from "~/components/garage";
import { IoTooltip } from "~/components/io-tooltip";
import { Motion } from "~/components/motion";
import { Silomat } from "~/components/silomat";
import { deviceT, logT } from "~/lib/trans";
import { cn } from "~/lib/utils";
import { m } from "@paraglide/messages.js";

const Lamp = ({ bit, color }) => (
  <IoTooltip io={bit}>
    <div
      className={clsx("w-4 h-4 rounded-full", {
        "bg-slate-100 dark:bg-slate-600": bit.status === 0,
        "bg-red-500": bit.status === 1 && color === "red",
        "bg-yellow-500": bit.status === 1 && color === "yellow",
        "bg-green-500": bit.status === 1 && color === "green",
      })}
    />
  </IoTooltip>
);

const Mode = ({ mode }) => (
  <Badge
    className={
      mode.id !== 8
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
    }
  >
    {m[`mode.${mode.key}`]()}
  </Badge>
);

const Step = ({ step }) => (
  <Badge variant="outline">
    <Spinner data-icon="inline-start" />
    {step}
  </Badge>
);

export function Device({ device, advanced = false }) {
  // console.log(device);
  const [LS, LC, LA] = device.c;
  const action = (
    <div className="flex items-center gap-1">
      {device.step !== 0 && <Step step={device.step} />}
      <Mode mode={device.mode} />
      <Lamp bit={LA} color="red" />
      <Lamp bit={LC} color="yellow" />
      <Lamp bit={LS} color="green" />
    </div>
  );
  const actions = (
    <div className={`grid grid-cols-${device.d.length} gap-3 w-full`}>
      {device.d.map((action, key) => {
        switch (action.key) {
          case "action-pp":
          case "action-pp-reset":
            return <ActionPP action={action} disabled={false} key={key} />;
        }
      })}
    </div>
  );
  const bg = device.operation !== 0 ? "bg-blue-50 dark:bg-blue-950" : undefined;

  if (advanced) {
    return (
      <Tabs defaultValue="tab-0">
        <TabsList>
          {device?.views.map((item, key) => (
            <TabsTrigger value={`tab-${key}`} key={key}>
              {m[`device.${item.name}`]()}
            </TabsTrigger>
          ))}
          <TabsTrigger value="diagnostic" disabled={device.alarms.length === 0}>
            {m["device.view-diag"]()}{" "}
            {device.alarms.length > 0 && (
              <Badge variant="destructive">{device.alarms.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        {device.views.map((view, key) => (
          <TabsContent key={key} value={`tab-${key}`}>
            <CardWrapper
              className={bg}
              title={device.name}
              action={action}
              footer={actions}
            >
              <p
                className={cn(
                  "mb-1.5",
                  device.operation !== 0
                    ? "text-normal"
                    : "text-muted-foreground",
                )}
              >
                {deviceT(device)}
              </p>
              {view.name === "view-garage" && <Garage sensors={view.sensors} />}
              {view.name === "view-sil" && <Silomat sensors={view.sensors} />}
              <Accordion type="multiple" collapsible="true">
                {view.drives.map((drive, key) => (
                  <AccordionItem value={`drive-${key}`} key={key}>
                    <Drive drive={drive} />
                  </AccordionItem>
                ))}
                {view.motors.map((motor, key) => (
                  <AccordionItem value={`motor-${key}`} key={key}>
                    <Motion motor={motor} />
                  </AccordionItem>
                ))}
              </Accordion>
            </CardWrapper>
          </TabsContent>
        ))}
        <TabsContent value="diagnostic">
          <CardWrapper
            className={bg}
            title={device.name}
            action={action}
            footer={actions}
          >
            <div className="flex flex-col gap-1">
              {device.alarms.map((alarm) => (
                <Alert variant="destructive" key={alarm.id}>
                  <AlertCircleIcon />
                  <AlertTitle>{alarm.date}</AlertTitle>
                  <AlertDescription>
                    {/* {`AL${alarm.id} ${m["alarm." + alarm.key]({ ...alarm.query })}`} */}
                    {`AL${alarm.id}`}{" "}
                    {alarm.key &&
                      `${m["alarm." + alarm.key]({ ...alarm.query })}`}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardWrapper>
        </TabsContent>
      </Tabs>
    );
  } else {
    return (
      <CardWrapper className={bg} title={device.name} action={action}>
        <p
          className={
            device.operation !== 0 ? "text-normal" : "text-muted-foreground"
          }
        >
          {deviceT(device)}
        </p>
      </CardWrapper>
    );
  }
}
