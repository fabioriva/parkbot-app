import { useTranslation } from "react-i18next";

export function DeviceInfo({ device }) {
  // console.log(device);
  const { t } = useTranslation();
  const { card, mode, operation, stall } = device;
  const ce = (card, stall) => {
    if (card === 0 && stall === 0) return <span>{t("aps.device.ce-0")}</span>;
    if (stall === 0) return <span>{t("aps.device.ce-1", { card })}</span>;
    return <span>{t("aps.device.ce-2", { card, stall })}</span>;
  };
  const cu = (card, stall) => {
    if (card === 0 && stall === 0) return <span>{t("aps.device.cu-0")}</span>;
    if (stall === 0) return <span>{t("aps.device.cu-1", { card })}</span>;
    return <span>{t("aps.device.cu-2", { card, stall })}</span>;
  };
  const mv = (card, stall) => {
    if (card === 0 && stall === 0) return <span>{t("aps.device.mv-0")}</span>;
    if (stall === 0) return <span>{t("aps.device.mv-1", { card })}</span>;
    return <span>{t("aps.device.mv-2", { card, stall })}</span>;
  };
  const pp = (stall) => {
    if (stall === 0) return <span>{t("aps.device.pp-0")}</span>;
    return <span>{t("aps.device-pp-1", { stall })}</span>;
  };

  if (!device.c[0].status) {
    return <span>{t("aps.device.off")}</span>;
  } else if (mode.id === 0) {
    return <span>{t("aps.mode.mode-no")}</span>;
  } else if (mode.id === 6) {
    return <span>{t("aps.device.off")}</span>;
  } else if (mode.id === 8 && operation === 1) {
    return ce(card, stall);
  } else if (mode.id === 8 && operation === 2) {
    return cu(card, stall);
  } else if (mode.id === 8 && operation === 3) {
    return <span>{t("aps.device.idle-0")}</span>;
  } else if (mode.id === 8 && operation === 4) {
    return mv(card, stall);
  } else if (mode.id === 8) {
    return <span>{t("aps.device.ready")}</span>;
  } else {
    return <span>{t("aps.mode.mode-man")}</span>;
  }
}

// import clsx from "clsx";
// import {
//   ArrowLeftRight,
//   CheckCircle2Icon,
//   UserRoundPlus,
//   UserRoundMinus,
//   Wrench,
// } from "lucide-react";
// import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

// export function DeviceInfo({ device }) {
//   // console.log(device);
//   const { card, mode, operation, stall } = device;
//   const ENTRY = mode.id === 8 && operation === 1;
//   const EXIT = mode.id === 8 && operation === 2;
//   const SWAP = mode.id === 8 && operation === 4;
//   const WARNING = !device.c[0].status || mode.id !== 8;
//   const READY = !ENTRY && !EXIT && !SWAP && !WARNING;

//   return (
//     <Alert
//       className={clsx("bg-slate-500/10 text-slate-500", {
//         "bg-op-entry/10 bg-op-entry/20 border-l-4 border-l-op-entry text-op-entry":
//           ENTRY,
//         "bg-op-exit/10 dark:bg-op-exit/20 border-l-4 border-l-op-exit text-op-exit":
//           EXIT,
//         "bg-op-swap/10 bg-op-swap/20 border-l-4 border-l-op-swap text-op-swap":
//           SWAP,
//         "bg-ready/10 dark:bg-ready/20 border-l-4 border-l-ready text-ready":
//           READY,
//         "bg-warning/10 dark:bg-warning/20 border-l-4 border-l-warning text-warning":
//           WARNING,
//       })}
//     >
//       {ENTRY && <UserRoundPlus />}
//       {EXIT && <UserRoundMinus />}
//       {SWAP && <ArrowLeftRight />}
//       {WARNING && <Wrench />}
//       {READY && <CheckCircle2Icon />}
//       <AlertTitle>
//         {ENTRY && (
//           <span>
//             Entering card {card}, stall {stall}
//           </span>
//         )}
//         {EXIT && (
//           <span>
//             Exiting card {card}, stall {stall}
//           </span>
//         )}
//         {SWAP && "swap"}
//         {WARNING && "man"}
//         {READY && <span>Waiting for operation request</span>}
//       </AlertTitle>
//       {/* <AlertDescription
//         className={clsx("text-card-foreground", {
//           "text-op-entry": ENTRY,
//           "text-op-exit": EXIT,
//           "text-op-swap": SWAP,
//           "text-ready": READY,
//           "text-warning": WARNING,
//         })}
//       >
//         This is an alert with icon, title and description.
//       </AlertDescription> */}
//     </Alert>
//   );
// }
