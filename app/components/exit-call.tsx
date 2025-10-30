import React, { useState } from "react";
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

type Exit = {
  enable: { addr: string; status: number };
  key: string;
  max: number;
  min: number;
  writeArea?: any;
};

interface ExitCallProps {
  exit: Exit;
}

export default function ExitCall({ exit }: ExitCallProps) {
  console.log(exit);
  const { enable, max, min } = exit;
  const [card, setCard] = useState(min);
  const [error, setError] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce.number().min(min).max(max);
    const result = schema.safeParse(e.target.value);
    if (!result.success) {
      setError(true);
      setCard(Number(e.target.value));
    } else {
      setError(false);
      setCard(result.data);
    }
  };
  const handleConfirm = async () => {
    console.log(card);
  };
  const handleOpen = () => {
    setError(false);
    setCard(min);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full"
          disabled={!enable.status}
          onClick={handleOpen}
        >
          Exit car
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exit call</DialogTitle>
          <DialogDescription>Enter card number and confirm.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 mb-3">
          <Label htmlFor="card">
            Card number [{min}-{max}]
          </Label>
          <Input
            id="card"
            min={min}
            max={max}
            name="card"
            type="number"
            value={card}
            onChange={handleChange}
          />
          {error && (
            <p className="text-red-500 text-sm">Card number is not valid!</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleConfirm} disabled={error}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
