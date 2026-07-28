import { m } from "@paraglide/messages.js";

export function deviceT(device) {
  const { card, mode, operation, stall } = device;
  const ce = (card, stall) => {
    if (card === 0 && stall === 0) return m.device_ce0();
    if (stall === 0) return m.device_ce1({ card });
    return m.device_ce2({ card, stall });
  };
  const cu = (card, stall) => {
    if (card === 0 && stall === 0) return m.device_cu0();
    if (stall === 0) return m.device_cu1({ card });
    return m.device_cu2({ card, stall });
  };
  const mv = (card, stall) => {
    if (card === 0 && stall === 0) return m.device_mv0();
    if (stall === 0) return m.device_mv1({ card });
    return m.device_mv2({ card, stall });
  };
  const pp = (stall) => {
    if (stall === 0) return m.device_pp0();
    return m.device_pp1({ stall });
  };
  if (!device.c[0].status) {
    return m.device_off();
  } else if (mode.id === 0) {
    return m["mode.mode-no"]();
  } else if (mode.id === 6) {
    return pp(stall);
  } else if (mode.id === 8 && operation === 1) {
    return ce(card, stall);
  } else if (mode.id === 8 && operation === 2) {
    return cu(card, stall);
  } else if (mode.id === 8 && operation === 3) {
    return m.device_idle0();
  } else if (mode.id === 8 && operation === 4) {
    return mv(card, stall);
  } else if (mode.id === 8) {
    return m.device_ready();
  } else {
    return m["mode.mode-man"]();
  }
}

export function logT(log) {
  try {
    const { alarm, card, operation, mode, stall, uid } = log;
    switch (operation.id) {
      case 1:
      case 2:
        return m["alarm." + alarm.key]({ ...alarm.query });
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
  } catch (error) {
    // console.error(error);
    return null;
  }
}

export function safeMessageT(prefix, key, params = {}) {
  const fn = m[`${prefix}.${key}`] || m[`${prefix}_${key}`];

  if (typeof fn !== "function") {
    // Chiave non presente → ritorna fallback
    return `Missing translation: ${prefix}.${key}`;
  }

  return fn(params);
}
