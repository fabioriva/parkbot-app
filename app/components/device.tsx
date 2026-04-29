import { AlertCircleIcon, ArrowUpRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Accordion, AccordionItem } from "~/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  // CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Spinner } from "~/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Drive } from "~/components/drive";
import { IoInfo } from "~/components/io-info";
import { Motion } from "~/components/motion";
import { Garage } from "~/components/view-garage";
import { Silomat } from "~/components/view-silomat";
import { deviceT } from "~/lib/translation";

const Active = ({ alarm }) => {
  // console.log(alarm);
  const { t } = useTranslation();
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{alarm.date}</AlertTitle>
      <AlertDescription>
        AL{alarm.id} {t("alarms." + alarm.key, alarm.query)}
      </AlertDescription>
    </Alert>
  );
};

export function ExternalLink({ link }) {
  return (
    <Badge variant="ghost" asChild>
      <a href={link}>
        <ArrowUpRightIcon data-icon="inline-end" />
      </a>
    </Badge>
  );
}

const Info = ({ device }) => {
  const [LS, LC, LA] = device.c;
  const { t } = useTranslation();
  return (
    <>
      <IoInfo io={LA}>
        <div
          className={`w-3 h-3 rounded-full ${LA.status ? "bg-red-500" : "bg-slate-100 dark:bg-slate-600"}`}
        />
      </IoInfo>
      <IoInfo io={LC}>
        <div
          className={`w-3 h-3 rounded-full ${LC.status ? "bg-yellow-500" : "bg-slate-100 dark:bg-slate-600"}`}
        />
      </IoInfo>
      <IoInfo io={LS}>
        <div
          className={`w-3 h-3 rounded-full ${LS.status ? "bg-green-500" : "bg-slate-100 dark:bg-slate-600"}`}
        />
      </IoInfo>
    </>
  );
};

const Mode = ({ mode }) => {
  const { t } = useTranslation();
  return (
    <Badge
      className={
        mode.id !== 8
          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      }
    >
      {t("mode." + mode.key)}
    </Badge>
  );
};

const Step = ({ step }) => {
  return (
    <Badge variant="outline">
      <Spinner data-icon="inline-start" />
      {step}
    </Badge>
  );
};

export function Device({ device, advanced = false, link = false }) {
  const { t } = useTranslation();
  if (advanced) {
    return (
      <Tabs defaultValue="tab-0">
        <TabsList>
          {device.views.map((item, key) => (
            <TabsTrigger value={`tab-${key}`} key={key}>
              {t("device.view." + item.name)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="diagnostic" disabled={!device.alarms.length}>
            Diagnostic {device.alarms.length > 0 && <Badge variant="destructive">{device.alarms.length}</Badge>}
          </TabsTrigger>
        </TabsList>
        {device.views.map((view, key) => (
          <TabsContent key={key} value={`tab-${key}`}>
            <Card className="max-w-sm" size="sm">
              <CardHeader>
                <CardTitle>{device.name}</CardTitle>
                <CardAction className="flex items-center gap-1">
                  {device.step !== 0 && <Step step={device.step} />}
                  <Mode mode={device.mode} />
                  <Info device={device} />
                </CardAction>
              </CardHeader>
              <CardContent>
                <p
                  className={`mb-1.5 ${
                    device.operation !== 0
                      ? "text-normal"
                      : "text-muted-foreground"
                  }`}
                >
                  {deviceT(device, t)}
                </p>
                {view.name === "view-garage" && (
                  <Garage sensors={view.sensors} />
                )}
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
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">
                  Action
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        ))}
        <TabsContent value="diagnostic">
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>{device.name}</CardTitle>
              <CardAction className="flex items-center gap-1">
                {device.step !== 0 && <Step step={device.step} />}
                <Mode mode={device.mode} />
                <Info device={device} />
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {device.alarms.map((alarm) => (
                  <Active alarm={alarm} key={alarm.id} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  }
  return (
    <Card
      className={
        device.operation !== 0
          ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : undefined
      }
      size="sm"
    >
      <CardHeader>
        <CardTitle>{device.name}</CardTitle>
        <CardAction className="flex items-center gap-1">
          {device.step !== 0 && <Step step={device.step} />}
          <Mode mode={device.mode} />
          <Info device={device} />
          {link && <ExternalLink link={link} />}
        </CardAction>
      </CardHeader>
      <CardContent>
        <p
          className={
            device.operation !== 0 ? "text-normal" : "text-muted-foreground"
          }
        >
          {deviceT(device, t)}
        </p>
      </CardContent>
    </Card>
  );
}
