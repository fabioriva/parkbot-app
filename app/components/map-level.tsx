import clsx from "clsx";
import { useState } from "react";
import { useLoaderData, useParams } from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import type { Stall } from "~/routes/aps/types";

interface MapLevelProps {
  definitions: any;
  level: any;
  view: string;
}

export function Level({ definitions, level, view }: MapLevelProps) {
  // console.log(definitions, level, view);
  const loaderData = useLoaderData<typeof loader>();
  const params = useParams();
  const { FREE, LOCK, PAPA, RSVD } = definitions.stallStatus;
  const min = definitions.minCard !== undefined ? definitions.minCard : 1;
  const max =
    definitions.maxCard !== undefined ? definitions.maxCard : definitions.cards;
  const [error, setError] = useState<boolean>(false);
  const [stall, setStall] = useState<Stall>({
    date: "",
    nr: 0,
    size: 0,
    status: 0,
  });
  // const [status, setStatus] = useState(min);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce.number().min(min).max(max);
    const result = schema.safeParse(e.target.value);
    // console.log(result);
    if (!result.success) {
      setError(true);
      // setStatus(Number(e.target.value));
      setStall((prev) => ({ ...prev, status: Number(e.target.value) }));
    } else {
      setError(false);
      // setStatus(result.data);
      setStall((prev) => ({ ...prev, status: result.data }));
    }
  };
  const handleConfirm = async ({
    stall,
    status,
  }: {
    stall: number;
    status: number;
  }) => {
    const url = `${import.meta.env.VITE_BACKEND_URL}/${params?.aps}/map/edit`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + loaderData?.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ stall, status }),
    });
    // console.log(res);
    
  };
  const handleOpen = (stall: Stall) => {
    setError(false);
    setStall(stall);
  };
  return (
    <div>
      <span className="text-sm">
        {level.label}: {level.min} - {level.max}
      </span>
      <div
        className="l relative bg-card border border-dotted"
        id={"l-" + level.nr}
      >
        {level.elevators &&
          level.elevators.map((elevator: any) => (
            <div
              className="absolute h-[30px] w-[40px] bg-slate-700/10 dark:bg-slate-700/20 text-center el"
              id={elevator.id}
              key={elevator.id}
            >
              <span className="font-semibold text-xs">{elevator.label}</span>
            </div>
          ))}
        <Dialog>
          {level?.stalls.map((stall: Stall) => (
            <DialogTrigger key={stall.nr} asChild>
              <div
                className={clsx(
                  "absolute h-[30px] w-[40px] border text-center",
                  {
                    "bg-alert/20 text-alert": stall.status !== 0,
                    "bg-ready/20 text-ready": stall.status === FREE,
                    "bg-op-exit/20 text-op-exit": stall.status === LOCK,
                    "bg-sky-700/20 text-sky-700": stall.status === PAPA,
                    "bg-yellow-700/20 text-yellow-700": stall.status === RSVD,
                  }
                )}
                id={"s-" + stall.nr}
              >
                <span
                  className="hover:cursor-pointer hover:font-bold no-underline text-xs"
                  onClick={() => handleOpen(stall)}
                >
                  {view === "view-1" && stall.status}
                  {view === "view-2" && stall.nr}
                  {view === "view-3" && stall.size}
                </span>
              </div>
            </DialogTrigger>
          ))}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit stall {stall.nr} status</DialogTitle>
              <DialogDescription>
                Edit stall {stall.nr} status and confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 mb-3">
              <Label htmlFor="card">
                Card number range [{min}-{max}]
              </Label>
              <Input
                min={min}
                max={max}
                name="status"
                type="number"
                value={stall.status}
                onChange={handleChange}
              />
              {error && (
                <p className="text-red-500 text-sm">
                  Card number is not valid!
                </p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() =>
                    handleConfirm({ stall: stall.nr, status: stall.status })
                  }
                  disabled={error}
                >
                  Card
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() =>
                    handleConfirm({ stall: stall.nr, status: FREE })
                  }
                >
                  Clear
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button
                  onClick={() =>
                    handleConfirm({ stall: stall.nr, status: LOCK })
                  }
                >
                  Lock
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
