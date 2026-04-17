import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

function get(label) {
  // console.log(label);
  switch (label) {
    case "AD1":
    case "AD2":
    case "AD3":
    case "AF7":
    case "AF8":
    case "DB32":
    case "FE12":
    case "K12":
    case "L1":
    case "L2":
    case "L3":
    case "L4":
    case "L5":
    case "RS12":
    case "RS3":
    case "RT12":
    case "S1":
    case "S2":
    case "T10":
    case "T2":
      return { key: label, query: {} };

    default:
      if (label) {
        let array = label.split("");
        const dash = array[array.length - 2];
        if (dash === "-") {
          const last = parseInt(array[array.length - 3]);
          if (!isNaN(last)) {
            return {
              key: array.slice(0, -3).join("").concat("x"),
              query: { nr: last },
            };
          } else {
            return { key: label.slice(0, -2), query: {} };
          }
        }
        const last = parseInt(array[array.length - 1]);
        if (!isNaN(last)) {
          return {
            key: array.slice(0, -1).join("").concat("x"),
            query: { nr: last },
          };
        } else {
          return { key: label, query: {} };
        }
      } else {
        return { key: "label", query: {} };
      }
  }
}

export function IoInfo({ io, children }) {
  const { t } = useTranslation();
  const { key, query } = get(io?.label);
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>
        <table className="m-0 p-0 text-sm">
          <thead>
            <tr>
              <th className="text-left">Bit info</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Address</td>
              <td className="w-16 text-right font-semibold">{io?.addr}</td>
            </tr>
            <tr>
              <td>Label</td>
              <td className="w-16 text-right font-semibold">{io?.label}</td>
            </tr>
            <tr>
              <td>Status</td>
              <td className="w-16 text-right font-semibold">
                <span
                  className={
                    io?.status ? "text-green-500" : "text-muted-foreground"
                  }
                >
                  {io?.status ? "TRUE" : "FALSE"}
                </span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>{io.label ? key && t("io." + key, query) : ""}</td>
            </tr>
          </tfoot>
        </table>
      </TooltipContent>
    </Tooltip>
  );
}
