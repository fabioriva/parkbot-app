import { format } from "date-fns";
import { toast as sonner } from "sonner";

export default function toast({ message, severity }) {
  // console.log(message, severity);
  const now = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  switch (severity) {
    case "error":
      return sonner.error(message);
    case "success":
      return sonner.success(message);
    case "warning":
      return sonner.warning(message, { description: now });
    default:
      return sonner.message(message, { description: now });
  }
}
