import clsx from "clsx";
import { useLoaderData, useParams } from "react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { useEditStallDialog } from "~/components/map-edit";
import fetcher from "~/lib/fetch";
import toast from "~/lib/toast";
import { m } from "@paraglide/messages.js";

export function Stall({ definitions, stall, view }) {
  const data = useLoaderData();
  const params = useParams();
  const { showEditDialog } = useEditStallDialog();
  const { date, nr, size, status } = stall;
  const { FREE, LOCK, PAPA, RSVD } = definitions.stallStatus;
  const handleConfirm = async (value) => {
    // console.log(`Stall nr ${nr} changed from ${status} to ${value}`);
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params.aps}/map/edit`;
    const res = await fetcher(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ card: value, stall: nr }),
    });
    console.log(res);

    toast(res);
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={clsx(
            "absolute h-[30px] w-[40px] border flex items-center justify-center text-xs hover:cursor-pointer",
            {
              "bg-red-300 text-red-950 dark:bg-red-950 dark:text-red-300":
                status !== 0 &&
                status !== LOCK &&
                status !== PAPA &&
                status !== RSVD,
              "bg-green-300 text-green-950 dark:bg-green-950 dark:text-green-300":
                status === FREE,
              "bg-purple-300 text-purple-950 dark:bg-purple-950 dark:text-purple-300":
                status === LOCK,
              "bg-blue-300 text-blue-950 dark:bg-blue-950 dark:text-blue-300":
                status === PAPA,
              "bg-amber-300 text-amber-950 dark:bg-amber-950 dark:text-amber-300":
                status === RSVD,
            },
          )}
          id={"s-" + nr}
          onClick={() =>
            showEditDialog({
              definitions,
              stall,
              onConfirm: (value) => handleConfirm(value),
            })
          }
        >
          {view === "view0" && status === LOCK && (
            <span className="text-xl">🔒</span>
          )}
          {view === "view0" && status === PAPA && (
            <span className="text-xl">🚗</span>
          )}
          {view === "view0" && status === RSVD && (
            <span className="text-xl">🚗</span>
          )}
          {view === "view0" &&
            status !== LOCK &&
            status !== PAPA &&
            status !== RSVD &&
            status !== 0 && <span className="text-xl">🚗</span>}
          {view === "view1" && status}
          {view === "view2" && nr}
          {view === "view3" && size}
        </div>
      </TooltipTrigger>
      <TooltipContent className="text-center text-sm">
        {status === 0
          ? m.map_stall_free({ date, nr })
          : status === LOCK
            ? m.map_stall_lock({ date, nr })
            : m.map_stall_busy({ date, nr, status })}
      </TooltipContent>
    </Tooltip>
  );
}
