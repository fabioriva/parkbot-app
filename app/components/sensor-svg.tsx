import { clsx } from "cn"
import type { DeviceData } from "~/components/device"

interface SensorProps {
  x: string | number
  y: string | number
  sensor: DeviceData["c"][number]
}

export const Sensor = ({ x, y, sensor }: SensorProps) => {
  return (
    <circle
      cx={x}
      cy={y}
      r="1.75"
      strokeWidth="0.1"
      className={clsx({
        "fill-green-500 stroke-slate-600": sensor.status,
        "fill-slate-100 stroke-slate-600": !sensor.status,
      })}
    >
      <title className="uppercase">{`${sensor.label} ${sensor.addr} ${sensor.status ? "ON" : "OFF"}`}</title>
    </circle>
  )
}
