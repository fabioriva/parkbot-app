import { m } from "@paraglide/messages.js";

export function deviceT(device) {
  const t = (t) => t;
  const { card, mode, operation, stall } = device;
  const ce = (card, stall) => {
    if (card === 0 && stall === 0) return t("device.operation.ce-0");
    if (stall === 0) return t("device.operation.ce-1", { card });
    return t("device.operation.ce-2", { card, stall });
  };
  const cu = (card, stall) => {
    if (card === 0 && stall === 0) return t("device.operation.cu-0");
    if (stall === 0) return t("device.operation.cu-1", { card });
    return t("device.operation.cu-2", { card, stall });
  };
  const mv = (card, stall) => {
    if (card === 0 && stall === 0) return t("device.operation.mv-0");
    if (stall === 0) return t("device.operation.mv-1", { card });
    return t("device.operation.mv-2", { card, stall });
  };
  const pp = (stall) => {
    if (stall === 0) return t("device.operation.pp-0");
    return t("device.operation.pp-1", { stall });
  };
  if (!device.c[0].status) {
    return t("device.operation.off");
  } else if (mode.id === 0) {
    return t("mode.mode-no");
  } else if (mode.id === 6) {
    return t("device.operation.off");
  } else if (mode.id === 8 && operation === 1) {
    return ce(card, stall);
  } else if (mode.id === 8 && operation === 2) {
    return cu(card, stall);
  } else if (mode.id === 8 && operation === 3) {
    return t("device.operation.idle-0");
  } else if (mode.id === 8 && operation === 4) {
    return mv(card, stall);
  } else if (mode.id === 8) {
    return t("device.operation.ready");
  } else {
    return t("mode.mode-man");
  }
}

export function logT(log) {
  const { alarm, card, operation, mode, stall, uid } = log;
  switch (operation.id) {
    case 1:
    case 2:
      // return m["alarms." + alarm.key]({ ...alarm.query });
      return m[`alarms.${alarm.key}`]({ ...alarm.query });
    case 3:
      return m.log_id_3({ id: mode.id });
    case 4:
      return m.log_id_4({ card });
    case 5:
      return m.log_id_5({ card, stall });
    case 6:
      return m.log_id_6({ card, stall });
    case 7:
      return m.log_id_7({ card, stall });
    case 8:
      return m.log_id_8({ card, stall });
    case 9:
      return m.log_id_9({ stall });
    case 10:
      return m.log_id_10({ card });
    case 11:
      return m.log_id_11({ card });
    case 12:
      return m.log_id_12({ card });
    case 13:
      return m.log_id_13({ card });
    case 14:
      return m.log_id_14({ card });
    default:
      return `Operation ${operation.id}`;
  }
}
