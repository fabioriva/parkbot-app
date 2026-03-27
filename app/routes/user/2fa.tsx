import { CheckCircle2Icon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { useOutletContext } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
// import { Switch } from "~/components/ui/switch";
import { authClient } from "~/lib/auth";
import type { Route } from "./+types/settings";

export default function TwoFactor() {
  let { t } = useTranslation();
  const user = useOutletContext();
  // console.log(user);
  const [backupCodes, setBackupCodes] = useState(null);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [totp, setTotp] = useState(null);
  const [totpURI, setTotpURI] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user.twoFactorEnabled,
  );

  const disable2FA = async () => {
    const { data, error } = await authClient.twoFactor.disable({
      password,
    });
    // console.log(data, error);
    if (error) {
      return setError(error.message);
    }
    setTwoFactorEnabled(false);
  };
  const enable2FA = async () => {
    const { data, error } = await authClient.twoFactor.enable({
      password,
    });
    // console.log(data, error);
    if (error) {
      return setError(error.message);
    }
    setError(null);
    setBackupCodes(data?.backupCodes);
    setTotpURI(data?.totpURI);
    setTwoFactorEnabled(true);
  };
  const verify2FA = async () => {
    const { data, error } = await authClient.twoFactor.verifyTotp({
      code: totp, // required
      trustDevice: true,
    });
    // console.log(data, error);
    if (error) {
      return setError(error.message);
    }
    setError(null);
    setSuccess(true);
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
            <FieldLabel htmlFor="password">Current password</FieldLabel>
            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FieldDescription>
              Enter your password to{" "}
              {twoFactorEnabled ? (
                <span>disable</span>
              ) : (
                <span>enable</span>
              )}{" "}
              2FA
            </FieldDescription>
          </Field>
          {/* <Field orientation="horizontal" className="w-fit">
            <FieldContent>
              <FieldLabel htmlFor="2fa">Multi-factor authentication</FieldLabel>
              <FieldDescription>
                {t("twoFA.setupTwo.cardDescription")}
              </FieldDescription>
            </FieldContent>
            <Switch
              id="2fa"
              checked={twoFactorEnabled}
              disabled={!password}
              onClick={twoFactorEnabled ? disable2FA : enable2FA}
            />
          </Field> */}
          <Field>
            <Button
              className="w-full"
              onClick={twoFactorEnabled ? disable2FA : enable2FA}
              disabled={!password}
            >
              {twoFactorEnabled ? (
                <span>Disable</span>
              ) : (
                <span>Enable</span>
              )}{" "}
              2FA
            </Button>
          </Field>
          {!success && totpURI && (
            <FieldSet>
              <Field>
                <FieldContent>
                  <QRCode value={totpURI || ""} />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="totp">
                  {t("twoFA.verify.codeLabel")}
                </FieldLabel>
                <Input
                  type="totp"
                  name="totp"
                  onChange={(e) => setTotp(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Button className="w-full" onClick={verify2FA}>
                  {t("twoFA.verify.submit")}
                </Button>
              </Field>
            </FieldSet>
          )}
          {error && <FieldError>{error}</FieldError>}
          {success && (
            <Alert className="max-w-md border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-50">
              <CheckCircle2Icon />
              <AlertTitle>
                Two Factor Authenticaton updated successfully
              </AlertTitle>
              <AlertDescription>
                <p className="text-muted-foreground text-sm">
                  {t("twoFA.setupTwo.cardContent")}
                </p>
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="max-w-md">
              <CheckCircle2Icon />
              <AlertTitle>Backup codes</AlertTitle>
              <AlertDescription>
                <div className="pt-1 relative w-full">
                  <pre className="grid grid-cols-1">
                    {backupCodes.map((code, i) => (
                      <code key={i}>{code}</code>
                    ))}
                  </pre>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-0 right-0 size-8 cursor-pointer"
                    onClick={() =>
                      navigator.clipboard.writeText(
                        backupCodes.map((code) => code).join("\n"),
                      )
                    }
                  >
                    <CopyIcon size="20" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </FieldSet>
      </FieldGroup>
    </div>
  );
}
