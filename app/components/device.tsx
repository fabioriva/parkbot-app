import { AlertCircleIcon, ArrowUpRightIcon } from "lucide-react"
import { useState, useEffect, type ComponentProps } from "react"
import { Link, useOutletContext, useParams } from "react-router"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Badge } from "~/components/ui/badge"
import { Spinner } from "~/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ActionEntry } from "~/components/action-entry"
import { ActionPP } from "~/components/action-pp"
import { CardWrapper } from "~/components/card-wrapper"
import { Drive } from "~/components/drive"
import { Garage } from "~/components/garage"
import { IoTooltip } from "~/components/io-tooltip"
import { Motion } from "~/components/motion"
import { Silomat } from "~/components/silomat"
import { deviceT, safeMessageT } from "~/lib/trans"
import { cn } from "~/lib/utils"
import { formatPlantDateTime } from "~/lib/date-time"
import { usePlantTimeZone } from "~/hooks/use-plant-time-zone"
import { m } from "@paraglide/messages.js"
import { clsx } from "cn"

interface DeviceBit {
  addr: string
  label?: string
  status: boolean | 0 | 1
}

interface DeviceMode {
  id: number
  key: string
}

interface DeviceDrive {
  name: string
  enable: DeviceBit
  speed: number
  current: number
  load: number
  trip: number
}

interface DevicePosition {
  name: string
  destination: number
  position: number
}

interface DeviceMotor {
  name: { key: string; query?: { id?: number } }
  run: Pick<DeviceBit, "status">
  message: string
  io: DeviceBit[]
  encoders?: DevicePosition[]
}

type DeviceView = {
  drives: DeviceDrive[]
  motors: DeviceMotor[]
} & (
  | { name: "view-main" }
  | { name: "view-garage" | "view-sil"; sensors: DeviceBit[] }
)

export interface DeviceData {
  name: string
  card: number
  stall: number
  step: number
  mode: DeviceMode
  operation: number
  motor: number
  c: DeviceBit[]
  d: (
    | ComponentProps<typeof ActionEntry>["action"]
    | (Omit<ComponentProps<typeof ActionPP>["action"], "key"> & {
        key: "action-pp" | "action-pp-reset"
      })
  )[]
  views: DeviceView[]
  alarms: {
    id: number
    key: string
    date: string
    query?: Record<string, unknown>
  }[]
}

interface DeviceProps {
  device: DeviceData
  advanced?: boolean
}

const ExternalLink = ({ link }: { link: string }) => (
  <Link to={link} aria-label={link}>
    <ArrowUpRightIcon className="size-4 hover:text-blue-500" />
  </Link>
)

const Lamp = ({
  bit,
  color,
}: {
  bit: DeviceBit
  color: "red" | "yellow" | "green"
}) => (
  <IoTooltip io={bit}>
    <div
      className={clsx("h-4 w-4 rounded-full", {
        "bg-slate-100 dark:bg-slate-600": bit.status === 0,
        "bg-red-500": bit.status === 1 && color === "red",
        "bg-yellow-500": bit.status === 1 && color === "yellow",
        "bg-green-500": bit.status === 1 && color === "green",
      })}
    />
  </IoTooltip>
)

const Mode = ({ mode }: { mode: DeviceMode }) => (
  <Badge
    className={
      mode.id !== 8
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
        : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
    }
  >
    {safeMessageT("mode", mode.key)}
  </Badge>
)

const Step = ({ step }: { step: number }) => (
  <Badge variant="outline">
    <Spinner data-icon="inline-start" />
    {step}
  </Badge>
)

export function Device({ device, advanced = false }: DeviceProps) {
  const timeZone = usePlantTimeZone()
  const { user } = useOutletContext<{ user: { role: string } }>()
  // console.log(device);
  const params = useParams()
  const [LS, LC, LA] = device.c
  const action = (
    <div className="flex items-center gap-1">
      {device.step !== 0 && <Step step={device.step} />}
      <Mode mode={device.mode} />
      <Lamp bit={LA} color="red" />
      <Lamp bit={LC} color="yellow" />
      <Lamp bit={LS} color="green" />
      {!advanced && user.role !== "valet" && (
        <ExternalLink link={`/aps/${params.aps}/devices`} />
      )}
    </div>
  )
  const actions = (
    <div className={`grid grid-cols-${device.d.length} w-full gap-3`}>
      {device.d.map((action, key) => {
        switch (action.key) {
          case "action-entry":
            return <ActionEntry action={action} key={key} />
          case "action-pp":
          case "action-pp-reset":
            return <ActionPP action={action} disabled={false} key={key} />
        }
      })}
    </div>
  )
  const bg = device.operation !== 0 ? "bg-blue-50 dark:bg-blue-950" : undefined
  const [tab, setTab] = useState("tab-0")
  useEffect(() => setTab(`tab-${device.motor}`), [device.motor])

  if (advanced) {
    return (
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {device?.views.map((item, key) => (
            <TabsTrigger value={`tab-${key}`} key={key}>
              {safeMessageT("device", item.name)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="diagnostic" disabled={device.alarms.length === 0}>
            {safeMessageT("device", "view-diag")}{" "}
            {device.alarms.length > 0 && (
              <Badge variant="destructive">{device.alarms.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        {device.views.map((view, key) => (
          <TabsContent key={key} value={`tab-${key}`}>
            <CardWrapper
              className={cn("", bg)}
              title={device.name}
              action={action}
              footer={actions}
            >
              <p
                className={cn(
                  "mb-1.5 font-bold",
                  device.operation !== 0
                    ? "text-normal"
                    : "text-muted-foreground"
                )}
              >
                {deviceT(device)}
              </p>
              {view.name === "view-garage" && <Garage sensors={view.sensors} />}
              {view.name === "view-sil" && <Silomat sensors={view.sensors} />}
              <Accordion multiple>
                {view.name === "view-garage" && (
                  <AccordionItem value="garage-sensors">
                    <AccordionTrigger className="flex items-center gap-1.5 py-1.5 hover:no-underline">
                      Garage sensors
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex max-w-xs gap-1 overflow-auto sm:max-w-none">
                        {view.sensors.slice(6).map((item, key) => (
                          <IoTooltip io={item} key={key}>
                            <Badge
                              className={
                                item.status
                                  ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                                  : "bg-slate-50 text-slate-700 dark:bg-slate-600 dark:text-slate-300"
                              }
                              key={key}
                            >
                              {item.label}
                            </Badge>
                          </IoTooltip>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
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
                  <AlertTitle>
                    {/(?:Z|[+-]\d{2}:\d{2})$/i.test(alarm.date) ? (
                      timeZone ? (
                        formatPlantDateTime(
                          alarm.date,
                          timeZone,
                          "dd/MM/yyyy HH:mm:ss xxx"
                        )
                      ) : (
                        "—"
                      )
                    ) : (
                      <>
                        {alarm.date}{" "}
                        <span className="font-normal">
                          ({m.date_time_zone_unspecified()})
                        </span>
                      </>
                    )}
                  </AlertTitle>
                  <AlertDescription>
                    {`AL${alarm.id}`}{" "}
                    {safeMessageT("alarm", alarm.key, { ...alarm.query })}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardWrapper>
        </TabsContent>
      </Tabs>
    )
  } else {
    return (
      <CardWrapper className={bg} title={device.name} action={action}>
        <p
          className={cn(
            "font-bold",
            device.operation !== 0 ? "text-normal" : "text-muted-foreground"
          )}
        >
          {deviceT(device)}
        </p>
      </CardWrapper>
    )
  }
}
