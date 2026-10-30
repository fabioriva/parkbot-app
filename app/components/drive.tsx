import { AccordionContent, AccordionTrigger } from "~/components/ui/accordion"
import { m } from "@paraglide/messages.js"
import { clsx } from "cn"
import type { DeviceData } from "~/components/device"

interface ItemProps {
  title: string
  value: string | number
}

interface DriveProps {
  drive: DeviceData["views"][number]["drives"][number]
}

const Item = ({ title, value }: ItemProps) => (
  <div className="device-metric flex flex-col">
    <span className="text-xs text-muted-foreground">{title}</span>
    <span className="device-metric-value font-bold">{value}</span>
  </div>
)

export function Drive({ drive }: DriveProps) {
  return (
    <>
      <AccordionTrigger className="flex items-center gap-1.5 py-1.5 hover:no-underline">
        <div className="device-drive-heading">
          <span className="device-detail-name">{drive.name}</span>
          <span
            className={clsx("grow", {
              "text-green-500": drive.enable.status,
              "text-red-500": !drive.enable.status,
            })}
          >
            {drive.enable.status ? m.drive_ready() : m.drive_not_ready()}
          </span>
        </div>
        <div className="device-drive-preview mr-2 flex gap-1.5 text-xs">
          <span>{drive.speed}&nbsp;Hz</span>
          <span>{drive.current}&nbsp;A</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="device-drive-values grid grid-cols-4">
          <Item title={m.drive_speed()} value={`${drive.speed} Hz`} />
          <Item title={m.drive_current()} value={`${drive.current} A`} />
          <Item title={m.drive_load()} value={`${drive.load} %`} />
          <Item title={m.drive_trip()} value={drive.trip} />
        </div>
      </AccordionContent>
    </>
  )
}
