import clsx from "clsx";
import {
  ArrowLeftRight,
  CheckCircle2Icon,
  UserRoundPlus,
  UserRoundMinus,
  Wrench,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function DeviceInfo({ device }) {
  // console.log(device);
  const { card, mode, operation, stall } = device;
  const ENTRY = mode.id === 8 && operation === 1;
  const EXIT = mode.id === 8 && operation === 2;
  const SWAP = mode.id === 8 && operation === 4;
  const WARNING = !device.c[0].status || mode.id !== 8;
  const READY = !ENTRY && !EXIT && !SWAP && !WARNING;

  return (
    <Alert
      className={clsx("text-slate-600", {
        "bg-blue-100 border-blue-200 text-blue-600": ENTRY,
        "bg-green-100 border-green-200 text-green-600": READY,
        "bg-purple-100 border-purple-200 text-purple-600": EXIT,
        "bg-teal-100 border-teal-200 text-teal-600": SWAP,
        "bg-yellow-100 border-yellow-200 text-yellow-600": WARNING,
      })}
    >
      {ENTRY && <UserRoundPlus />}
      {EXIT && <UserRoundMinus />}
      {SWAP && <ArrowLeftRight />}
      {WARNING && <Wrench />}
      {READY && <CheckCircle2Icon />}
      <AlertTitle>
        {ENTRY && (
          <span>
            Entering card {card}, stall {stall}
          </span>
        )}
        {EXIT && (
          <span>
            Exiting card {card}, stall {stall}
          </span>
        )}
        {SWAP && "swap"}
        {WARNING && "man"}
        {READY && <span>Waiting for operation request</span>}
      </AlertTitle>
      {/* <AlertDescription>
        This is an alert with icon, title and description.
      </AlertDescription> */}
    </Alert>
  );
}
