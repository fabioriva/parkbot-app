import { useState } from "react";
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
import {
  Field,
  FieldError,
  FieldDescription,
  // FieldGroup,
  FieldLabel,
  // FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { useConfirmDialog } from "~/components/confirm-dialog";

export default function ExitCall({ exit }) {
  const { t } = useTranslation();
  const { enable, max, min } = exit;
  const { showConfirm } = useConfirmDialog();
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
    // console.log(card);
    showConfirm({
      title: "Do you confirm?",
      description: `Click confirm to request exit for tag number ${card}`,
      onConfirm: () => console.log(card),
    });
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
          {t("exit-call.dialogButton")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("exit-call.dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("exit-call.dialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="card">
            {t("exit-call.fieldLabel", { min, max })}
          </FieldLabel>
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
            <FieldError>{t("exit-call.fieldError", { min, max })}</FieldError>
          )}
          <FieldDescription>
            {t("exit-call.fieldDescription", { min, max })}
          </FieldDescription>
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("exit-call.dialogCancel")}</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button onClick={handleConfirm} disabled={error}>
              {t("exit-call.dialogConfirm")}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
