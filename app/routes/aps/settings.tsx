import { useState } from "react";
import { useOutletContext } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Field,
  // FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { authClient } from "~/lib/auth";
import type { Route } from "./+types/settings";

export default function Settings() {
  const user = useOutletContext();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user.twoFactorEnabled,
  );
  const [error, setError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const changePassword = async () => {
    const { data, error } = await authClient.changePassword({
      newPassword, // required
      currentPassword, // required
      revokeOtherSessions: true,
    });
    console.log(data, error);
    error ? setError(error.message) : setError("")
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
    <FieldGroup className="w-96">
      <FieldSet>
        <FieldLegend>Enter password</FieldLegend>
        <FieldDescription>Enter current password.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
            <Input
              type="password"
              name="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Change password</FieldLegend>
        <FieldDescription>Change current password.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="newPassword">New password</FieldLabel>
            <Input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">
              Confirm new password
            </FieldLabel>
            <Input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
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
            {error ? <FieldError>{error}</FieldError> : null}
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Two-factor</FieldLegend>
        <FieldDescription>
          Enable/Disable Two Factor Authentication.
        </FieldDescription>
        <FieldGroup>
          <div className="flex items-center space-x-3">
            <Switch
              id="two-factor"
              checked={twoFactorEnabled}
              onClick={twoFactorEnabled ? disable2FA : enable2FA}
              disabled={!currentPassword}
            />
            <Label htmlFor="two-factor">
              {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
            </Label>
          </div>
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend>Email notifications</FieldLegend>
        <FieldDescription>
          Enable/Disable e-mail notifications.
        </FieldDescription>
        <FieldGroup></FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
