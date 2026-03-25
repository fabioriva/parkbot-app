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
  const [error, setError] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user.twoFactorEnabled,
  );
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
    <div className="w-full max-w-md">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Two-Factor Authentication (2FA)</FieldLegend>
          <FieldDescription>
            Enhance your app's security with two-factor authentication.
          </FieldDescription>
          <Field>
            <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
            <Input
              name="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <FieldDescription>
              Enter your current password to log in.
            </FieldDescription>
          </Field>
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
