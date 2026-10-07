import { AlertTriangleIcon, CheckCircle2Icon, CopyIcon } from "lucide-react"
import { useState } from "react"
import { QRCode } from "react-qr-code"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Success } from "~/components/success-alert"
import { authClient } from "~/lib/auth"
import { m } from "@paraglide/messages.js"

interface Setup2FAProps {
  isTwoFactorEnabled?: boolean | null
  success: boolean
  setSuccess: (success: boolean) => void
}

export function Setup2FA({
  isTwoFactorEnabled,
  success,
  setSuccess,
}: Setup2FAProps) {
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [totp, setTotp] = useState("")
  const [totpURI, setTotpURI] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    isTwoFactorEnabled ?? false
  )

  const disable2FA = async () => {
    const { error } = await authClient.twoFactor.disable({
      password,
    })
    if (error) {
      return setError(
        error.message ?? "Unable to disable two-factor authentication."
      )
    }
    setError(null)
    setTwoFactorEnabled(false)
  }
  const enable2FA = async () => {
    const { data, error } = await authClient.twoFactor.enable({
      password,
    })
    if (error) {
      return setError(
        error.message ?? "Unable to enable two-factor authentication."
      )
    }
    if (!data || data.method !== "totp")
      return setError("Unable to enable two-factor authentication.")
    setError(null)
    setBackupCodes(data.backupCodes)
    setTotpURI(data.totpURI)
  }
  const verify2FA = async () => {
    if (!totp.trim()) return
    const { error } = await authClient.twoFactor.verifyTotp({
      code: totp, // required
      trustDevice: true,
    })
    if (error) {
      return setError(error.message ?? "Unable to verify code.")
    }
    setError(null)
    setSuccess(true)
    setTwoFactorEnabled(true)
  }
  return (
    <>
      {!success && !totpURI && (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="password">
              {m.two_factor_password_field_label()}
            </FieldLabel>
            <Input
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <FieldDescription>
              {twoFactorEnabled
                ? m.two_factor_disable_field_description()
                : m.two_factor_enable_field_description()}
            </FieldDescription>
          </Field>
          <Field>
            <Button
              // className="w-full"
              onClick={twoFactorEnabled ? disable2FA : enable2FA}
              disabled={!password || totpURI !== ""}
            >
              {twoFactorEnabled
                ? m.two_factor_disable_button()
                : m.two_factor_enable_button()}{" "}
            </Button>
          </Field>
          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
      )}
      {!success && totpURI && (
        <FieldGroup>
          <Alert className="max-w-md border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
            <AlertTriangleIcon />
            <AlertTitle>{m.two_factor_scan_qr_title()}</AlertTitle>
            <AlertDescription>
              {m.two_factor_scan_qr_description()}
            </AlertDescription>
          </Alert>
          <Field>
            <FieldContent className="max-w-fit rounded-xl border bg-white p-4">
              <QRCode value={totpURI} />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="totp">{m.two_factor_verify_totp()}</FieldLabel>
            <Input
              type="totp"
              name="totp"
              onChange={(e) => setTotp(e.target.value)}
              required
            />
            <FieldDescription>
              <p
                dangerouslySetInnerHTML={{
                  __html: m.two_factor_verify_totp_field_description(),
                }}
              />
            </FieldDescription>
          </Field>
          <Field>
            <Button onClick={verify2FA} disabled={!totp.trim()}>
              {m.two_factor_verify_submit()}
            </Button>
          </Field>
          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
      )}
      {success && (
        <div className="flex flex-col gap-3">
          <Success
            description={m.two_factor_success_description()}
            title={m.two_factor_success_title()}
          />
          <Alert className="relative">
            <CheckCircle2Icon />
            <AlertTitle>Two-factor authentication backup codes</AlertTitle>
            <AlertDescription>
              <pre className="grid grid-cols-1">
                {backupCodes.map((code, i) => (
                  <code key={i}>{code}</code>
                ))}
              </pre>
            </AlertDescription>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 size-8 cursor-pointer"
              onClick={() =>
                navigator.clipboard.writeText(
                  backupCodes.map((code) => code).join("\n")
                )
              }
            >
              <CopyIcon size="20" />
            </Button>
          </Alert>
        </div>
      )}
    </>
  )
}
