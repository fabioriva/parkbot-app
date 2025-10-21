import React, { useState } from "react";
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

interface ExitCallProps {}

export default function ExitCall({}: ExitCallProps) {
  const [card, setCard] = useState(0);
  const handleConfirm = async () => {
    console.log(card);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">Exit car</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Exit call</DialogTitle>
          <DialogDescription>Enter card number and confirm.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 mb-3">
          <Label htmlFor="card">Card number</Label>
          <Input
            id="card"
            name="card"
            type="number"
            value={card}
            onChange={(e) => setCard(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
