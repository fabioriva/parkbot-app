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
      className={clsx("bg-slate-500/10 text-slate-500", {
        "bg-op-entry/10 bg-op-entry/20 border-0 border-l-4 border-l-op-entry text-op-entry":
          ENTRY,
        "bg-op-exit/10 dark:bg-op-exit/20 border-0 border-l-4 border-l-op-exit text-op-exit":
          EXIT,
        "bg-op-swap/10 bg-op-swap/20 border-0 border-l-4 border-l-op-swap text-op-swap":
          SWAP,
        "bg-ready/10 dark:bg-ready/20 border-0 border-l-4 border-l-ready text-ready":
          READY,
        "bg-warning/10 dark:bg-warning/20 border-0 border-l-4 border-l-warning text-warning":
          WARNING,
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
      {/* <AlertDescription
        className={clsx("text-card-foreground", {
          "text-op-entry": ENTRY,
          "text-op-exit": EXIT,
          "text-op-swap": SWAP,
          "text-ready": READY,
          "text-warning": WARNING,
        })}
      >
        This is an alert with icon, title and description.
      </AlertDescription> */}
    </Alert>
  );
}
