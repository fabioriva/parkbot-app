import { CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { useOutletContext } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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

export default function Settings() {
  const user = useOutletContext();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user.twoFactorEnabled,
  );
  const [error, setError] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
    error ? setError(error.message) : setError("");
  };

  const disable2FA = async () => {
    setTwoFactorEnabled(false);
    // const { data, error } = await authClient.twoFactor.disable({
    //   password,
    // });
    // console.log(data, error);
  };

  const enable2FA = async () => {
    setTwoFactorEnabled(true);
    // const { data, error } = await authClient.twoFactor.enable({
    //   password,
    // });
    // console.log(data, error);
    // setTotpURI(data?.totpURI);
    // console.log(totpURI);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Current password */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Current password</FieldLegend>
          <FieldDescription>
            Enter your current password to log in.
          </FieldDescription>
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
        </FieldSet>
      </FieldGroup>
      {/* Change password */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Change password</FieldLegend>
          <FieldDescription>
            Change your current password. The new password must be at least 8
            characters long.
          </FieldDescription>
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
            {error && <FieldError>{error}</FieldError>}
            <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
              <CheckCircle2Icon />
              <AlertTitle>Account updated successfully</AlertTitle>
              <AlertDescription>
                Your profile information has been saved. Changes will be
                reflected immediately.
              </AlertDescription>
            </Alert>
          </Field>
        </FieldSet>
      </FieldGroup>
      {/* 2FA */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Two Factor Authentication</FieldLegend>
          <FieldDescription>
            Enable/Disable Two Factor Authentication.
          </FieldDescription>
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel htmlFor="2fa">Multi-factor authentication</FieldLabel>
            <Switch
              id="2fa"
              checked={twoFactorEnabled}
              disabled={!currentPassword}
              onClick={twoFactorEnabled ? disable2FA : enable2FA}
            />
          </Field>
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
