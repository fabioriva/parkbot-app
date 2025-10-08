import clsx from "clsx";

interface Sensor {
  addr: string;
  label: string;
  status: number;
}

interface SilomatProps {
  sensors: Sensor[];
}

const Sensor = ({ className, sensor }) => (
  // <Tooltip tooltip={<BitInfo bit={sensor} />}>
  <div
    className={clsx(`w-4 h-4 rounded-full border-solid border absolute`, {
      [className]: true,
      [`bg-green-500`]: sensor.status,
      [`bg-slate-500`]: !sensor.status,
    })}
  />
  // </Tooltip>
);

export function DeviceSilomat({ sensors }: SilomatProps) {
  // console.log(sensors);
  const [RMV, RMH, RES, REH, RCV, RAV, RAH, RCH] = sensors;
  return (
    <div className="my-3 relative">
      <Sensor sensor={RMV} className="left-[38%] top-[14%]" id="rmv" />
      <Sensor sensor={RMH} className="left-[43%] top-[14%]" id="rmh" />
      <Sensor sensor={RES} className="left-[43%] top-[32%]" id="res" />
      <Sensor sensor={REH} className="left-[43%] top-[54%]" id="reh" />
      <Sensor sensor={RCV} className="left-[16%] top-[42%]" id="rcv" />
      <Sensor sensor={RAV} className="left-[16%] top-[12%]" id="eav1" />
      <Sensor sensor={RAV} className="left-[16%] top-[76%]" id="eav2" />
      <Sensor sensor={RAH} className="left-[67%] top-[12%]" id="eah1" />
      <Sensor sensor={RAH} className="left-[67%] top-[76%]" id="eah2" />
      <Sensor sensor={RCH} className="left-[67%] top-[42%]" id="rch" />
      <img src={"/silomat.png"} alt="Silomat" height={"100%"} width={"100%"} />
    </div>
  );
}
