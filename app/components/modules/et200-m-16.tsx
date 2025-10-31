import clsx from "clsx";
// import BitInfo from "@/components/BitInfo";
// import Tooltip from "@/components/Tooltip";
import "./et200-m-16.css";

function Bit({ item, nr }) {
  const { addr, label, status } = item;
  const bit = addr.slice(-1);
  // const tooltip = <BitInfo bit={item} />;
  return (
    <div className="cursor-default">
      {/* <Tooltip tooltip={tooltip}> */}
      <span
        className="absolute h-[18px] w-[45px] bg-white border-b border-slate-100 pl-1 text-left text-[0.7rem] text-slate-950"
        id={"id-".concat(nr, bit)}
      >
        {label}
      </span>
      {/* </Tooltip> */}
      {/* <Tooltip tooltip={tooltip}> */}
      <span
        className={clsx(
          "absolute h-[18px] w-[12px] text-center text-xs text-slate-950",
          {
            "bg-slate-200": !status,
            "bg-green-500": status,
          }
        )}
        id={"st-".concat(nr, bit)}
      >
        {bit}
      </span>
      {/* </Tooltip> */}
    </div>
  );
}

function Byte({ byte, nr }) {
  const { bits, label } = byte;
  return (
    <div>
      <span
        className="absolute bg-[#c0dcec] h-[16px] w-[57px] flex items-center justify-center text-xs text-blue-500"
        id={"label-" + nr}
      >
        {label}
      </span>
      {bits.map((item, key) => (
        <Bit key={key} item={item} nr={nr} />
      ))}
    </div>
  );
}

export default function Module({ module }) {
  const { bytes, nr, type } = module;
  return (
    <div
      className="absolute bg-[#64748b] h-[360px] w-[136px] top-1"
      id={"card-" + nr}
    >
      <span className="absolute bottom-0 left-0 w-full text-center text-xs">
        {type}
      </span>
      {bytes.map((item, key) => (
        <Byte key={key} byte={item} nr={key} />
      ))}
    </div>
  );
}
