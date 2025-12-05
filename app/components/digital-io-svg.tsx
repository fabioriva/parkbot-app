import clsx from "clsx";
// import { useTranslation } from "react-i18next";

import type { Bit } from "~/routes/aps/types";

interface SensorProps {
  x: string;
  y: string;
  sensor: Bit;
}

export const Sensor = ({ x, y, sensor }: SensorProps) => {
  // const { t } = useTranslation();
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
  );
};
