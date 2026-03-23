export function deviceT(device, t) {
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

export function logT(log, t) {
  const { alarm, card, operation, mode, stall, uid } = log;
  switch (operation.id) {
    case 1:
    case 2:
      return t("alarms." + alarm.key, alarm.query);
    case 3:
      return t("history.log.op-id-3", { id: mode.id });
    case 4:
      return t("history.log.op-id-4", { card });
    case 5:
      return t("history.log.op-id-5", { card, stall });
    case 6:
      return t("history.log.op-id-6", { card, stall });
    case 7:
      return t("history.log.op-id-7", { card, stall });
    case 8:
      return t("history.log.op-id-8", { card, stall });
    case 9:
      return t("history.log.op-id-9", { stall });
    case 10:
      return t("history.log.op-id-10", { card });
    case 11:
      return t("history.log.op-id-11", { card });
    case 12:
      return t("history.log.op-id-12", { card });
    case 13:
      return t("history.log.op-id-13", { card });
    case 14:
      return t("history.log.op-id-14", { card });
    default:
      return `Operation ${operation.id}`;
  }
}
