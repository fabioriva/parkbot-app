import { useTranslation } from "react-i18next";

export function getDeviceInfo(device) {
  const { t } = useTranslation();
  const { card, mode, operation, stall } = device;
  const ce = (card, stall) => {
    if (card === 0 && stall === 0) return t("aps.device.ce-0");
    if (stall === 0) return t("aps.device.ce-1", { card });
    return t("aps.device.ce-2", { card, stall });
  };
  const cu = (card, stall) => {
    if (card === 0 && stall === 0) return t("aps.device.cu-0");
    if (stall === 0) return t("aps.device.cu-1", { card });
    return t("aps.device.cu-2", { card, stall });
  };
  const mv = (card, stall) => {
    if (card === 0 && stall === 0) return t("aps.device.mv-0");
    if (stall === 0) return t("aps.device.mv-1", { card });
    return t("aps.device.mv-2", { card, stall });
  };
  const pp = (stall) => {
    if (stall === 0) return t("aps.device.pp-0");
    return t("aps.device-pp-1", { stall });
  };

  if (!device.c[0].status) {
    return t("aps.device.off");
  } else if (mode.id === 0) {
    return t("aps.mode.mode-no");
  } else if (mode.id === 6) {
    return t("aps.device.off");
  } else if (mode.id === 8 && operation === 1) {
    return ce(card, stall);
  } else if (mode.id === 8 && operation === 2) {
    return cu(card, stall);
  } else if (mode.id === 8 && operation === 3) {
    return t("aps.device.idle-0");
  } else if (mode.id === 8 && operation === 4) {
    return mv(card, stall);
  } else if (mode.id === 8) {
    return t("aps.device.ready");
  } else {
    return t("aps.mode.mode-man");
  }
}

export function getTranslation(message) {
  const { t } = useTranslation();
  const { alarm, card, operation, mode, stall, uid } = message;
  switch (operation.id) {
    case 1:
    case 2:
      return t("aps.alarms." + alarm.key, alarm.query);
    case 3:
      return t("aps.history.log.op-id-3", { id: mode.id });
    case 4:
      return t("aps.history.log.op-id-4", { card });
    case 5:
      return t("aps.history.log.op-id-5", { card, stall });
    case 6:
      return t("aps.history.log.op-id-6", { card, stall });
    case 7:
      return t("aps.history.log.op-id-7", { card, stall });
    case 8:
      return t("aps.history.log.op-id-8", { card, stall });
    case 9:
      return t("aps.history.log.op-id-9", { stall });
    case 10:
      return t("aps.history.log.op-id-10", { card });
    case 11:
      return t("aps.history.log.op-id-11", { card });
    case 12:
      return t("aps.history.log.op-id-12", { card });
    case 13:
      return t("aps.history.log.op-id-13", { card });
    case 14:
      return t("aps.history.log.op-id-14", { card });
    default:
      return `Operation ${operation.id}`;
  }
}
