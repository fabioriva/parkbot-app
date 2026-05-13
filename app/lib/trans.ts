import { m } from "@paraglide/messages.js";

export function logT(log) {
  const { alarm, card, operation, mode, stall, uid } = log;
  switch (operation.id) {
    case 1:
    case 2:
      return m["alarms." + alarm.key]({ ...alarm.query });
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
