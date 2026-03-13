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
