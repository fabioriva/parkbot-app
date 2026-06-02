import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Success } from "~/components/success-alert";
import { authClient } from "~/lib/auth";
import { m } from "@paraglide/messages.js";

// import type { Route } from "./+types/settings";

export default function Password() {
  const [error, setError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const changePassword = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      return setError("Password doesn't match");
    }
    const { data, error } = await authClient.changePassword({
      newPassword, // required
      currentPassword, // required
      revokeOtherSessions: true,
    });
    if (error) {
      return setError(error.message);
    }
    setError(null);
    setSuccess(true);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>{m.password_change_field_legend()}</FieldLegend>
          <FieldDescription>
            {m.password_change_field_description()}
          </FieldDescription>
          {error && <FieldError>{error}</FieldError>}
          {success && (
            <Success
              description={m.password_change_success_description()}
              title={m.password_change_success_title()}
            />
          )}
          <Field>
            <FieldLabel htmlFor="currentPassword">
              {m.password_change_field_current()}
            </FieldLabel>
            <Input
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <FieldDescription>
              {m.password_change_field_description_current()}
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="newPassword">
              {m.password_change_field_new()}
            </FieldLabel>
            <Input
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">
              {m.password_change_field_confirm()}
            </FieldLabel>
            <Input
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Field>
          <Field>
            <Button
              className="w-full"
              onClick={changePassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              {m.password_change_button()}
            </Button>
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
