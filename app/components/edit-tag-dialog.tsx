import { useState, useEffect } from "react";
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
  FieldLabel,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";

export function EditTagDialog({ open, onConfirm, onOpenChange, tag }) {
  const { t } = useTranslation();
  const [error, setError] = useState(false);
  const [value, setValue] = useState("");
  useEffect(() => {
    setValue(tag?.code);
  }, [tag]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const schema = z.coerce
      .string()
      .length(3)
      .regex(/^[a-fA-F0-9]{3}$/);
    const result = schema.safeParse(e.target.value);
    if (!result.success) {
      setError(true);
    } else {
      setError(false);
    }
    setValue(e.target.value);
  };
  const handleConfirm = () => {
    // console.log(tag);
    // console.log(value);
    setError(false);
    onConfirm(value);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change PIN code</DialogTitle>
          <DialogDescription>{`Edit PIN code for tag ${tag.nr}`}</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="pin">PIN code</FieldLabel>
          <Input
            className="uppercase"
            minLength={3}
            maxLength={3}
            name="pin"
            value={value}
            onChange={handleChange}
          />
          {error && <FieldError>{t("aps.tags.edit-error")}</FieldError>}
          <FieldDescription>
            {t("aps.tags.edit-field-description")}
          </FieldDescription>
        </Field>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              onClick={() => {
                setError(false);
              }}
            >
              Cancel
            </Button>
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
