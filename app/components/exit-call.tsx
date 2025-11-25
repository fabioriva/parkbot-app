import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  // console.log(exit);
  const { t } = useTranslation();
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
          {t("aps.exit-call.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("aps.exit-call.dialog-title")}</DialogTitle>
          <DialogDescription>
            {t("aps.exit-call.dialog-description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 mb-3">
          <Label htmlFor="card">
            {t("aps.exit-call.dialog-label", { min, max })}
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
            <p className="text-red-500 text-sm">
              {t("aps.exit-call.dialog-error")}
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("aps.cancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleConfirm} disabled={error}>
              {t("aps.confirm")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
