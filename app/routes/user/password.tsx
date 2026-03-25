import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
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
import { Switch } from "~/components/ui/switch";
import { authClient } from "~/lib/auth";
import type { Route } from "./+types/settings";

export default function Password() {
  const user = useOutletContext();
  console.log(user);

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
    console.log(data, error);
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
          <FieldLegend>Change password</FieldLegend>
          <FieldDescription>
            Change your current password. The new password must be at least 8
            characters long.
          </FieldDescription>
          {error && <FieldError>{error}</FieldError>}
          {success && (
            <Alert className="max-w-md border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-50">
              <CheckCircle2Icon />
              <AlertTitle>Password updated successfully</AlertTitle>
              <AlertDescription>
                Your profile information has been saved. Changes will be
                reflected immediately.
              </AlertDescription>
            </Alert>
          )}
          <Field>
            <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
            <Input
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <FieldDescription>Enter your current password.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
            <Input
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
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
              Change password
            </Button>
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
