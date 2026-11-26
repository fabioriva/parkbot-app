import { CheckCircle2Icon, CopyIcon, Eye, EyeOff } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { QRCode } from "react-qr-code"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group"
import { Spinner } from "~/components/ui/spinner"
import { authClient } from "~/lib/auth"
import { cn } from "~/lib/utils"
import { m } from "@paraglide/messages.js"

interface Setup2FAProps {
  isTwoFactorEnabled?: boolean | null
  success: boolean
  setSuccess: (success: boolean) => void
  showStatus?: boolean
  onComplete?: () => void
}

export function Setup2FA({
  isTwoFactorEnabled,
  success,
  setSuccess,
  showStatus = false,
  onComplete,
}: Setup2FAProps) {
  const passwordId = useId()
  const totpId = `${passwordId}-totp`
  const totpRef = useRef<HTMLInputElement>(null)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const copyRequest = useRef({ pending: false, version: 0 })
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [totp, setTotp] = useState("")
  const [totpURI, setTotpURI] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    isTwoFactorEnabled ?? false
  )
  const [showPassword, setShowPassword] = useState(false)
  const [totpInvalid, setTotpInvalid] = useState(false)
  const [completion, setCompletion] = useState<"enabled" | "disabled" | null>(
    null
  )
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">(
    "idle"
  )
  const [copyError, setCopyError] = useState<string | null>(null)
  const isTotpValid = /^[0-9]{6}$/.test(totp)

  useEffect(() => {
    if (completion) feedbackRef.current?.focus()
  }, [completion])

  const clearTemporaryCredentials = () => {
    setPassword("")
    setTotp("")
    setTotpURI("")
    setShowPassword(false)
    setTotpInvalid(false)
  }

  const clearRecoveryCodes = () => {
    copyRequest.current.version++
    copyRequest.current.pending = false
    setBackupCodes([])
    setCopyState("idle")
    setCopyError(null)
  }

  const disable2FA = async () => {
    setCompletion(null)
    const { data, error } = await authClient.twoFactor.disable({
      password,
    })
    if (error) {
      return setError(
        error.message ?? "Unable to disable two-factor authentication."
      )
    }
    if (!data?.status) return setError(m.two_factor_disable_error())
    setError(null)
    setTwoFactorEnabled(false)
    clearTemporaryCredentials()
    clearRecoveryCodes()
    setSuccess(false)
    setCompletion("disabled")
  }
  const enable2FA = async () => {
    setCompletion(null)
    const { data, error } = await authClient.twoFactor.enable({
      password,
    })
    if (error) {
      return setError(
        error.message ?? "Unable to enable two-factor authentication."
      )
    }
    if (
      !data ||
      data.method !== "totp" ||
      !data.totpURI ||
      !Array.isArray(data.backupCodes) ||
      !data.backupCodes.length ||
      !data.backupCodes.every(
        (code) => typeof code === "string" && code.length > 0
      )
    )
      return setError(m.two_factor_enable_error())
    setError(null)
    clearRecoveryCodes()
    setBackupCodes(data.backupCodes)
    setTotpURI(data.totpURI)
    setShowPassword(false)
  }
  const verify2FA = async () => {
    if (!isTotpValid) {
      setTotpInvalid(true)
      totpRef.current?.focus()
      return
    }
    setTotpInvalid(false)
    setCompletion(null)
    const { data, error } = await authClient.twoFactor.verifyTotp({
      code: totp, // required
      trustDevice: true,
    })
    if (error) {
      return setError(error.message ?? "Unable to verify code.")
    }
    if (!data) return setError(m.two_factor_verify_error())
    setError(null)
    setSuccess(true)
    setTwoFactorEnabled(true)
    clearTemporaryCredentials()
    setCompletion("enabled")
  }

  const copyCodes = async () => {
    if (!success || !backupCodes.length || copyRequest.current.pending) return
    const version = ++copyRequest.current.version
    copyRequest.current.pending = true
    setCopyState("copying")
    setCopyError(null)
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable")
      await navigator.clipboard.writeText(backupCodes.join("\n"))
      if (version === copyRequest.current.version) setCopyState("copied")
    } catch {
      if (version === copyRequest.current.version) {
        setCopyState("idle")
        setCopyError(m.two_factor_copy_error())
      }
    } finally {
      if (version === copyRequest.current.version)
        copyRequest.current.pending = false
    }
  }

  const finishSetup = () => {
    clearRecoveryCodes()
    clearTemporaryCredentials()
    setError(null)
    setSuccess(false)
    onComplete?.()
  }
  return (
    <>
      {showStatus && (
        <Badge
          role="status"
          variant="secondary"
          className={cn(
            "h-auto min-h-5 max-w-full font-normal whitespace-normal",
            twoFactorEnabled
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "text-muted-foreground"
          )}
        >
          {twoFactorEnabled
            ? m.two_factor_status_enabled()
            : m.two_factor_status_disabled()}
        </Badge>
      )}
      {completion && (
        <Alert
          role="status"
          ref={feedbackRef}
          tabIndex={-1}
          className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
        >
          <CheckCircle2Icon aria-hidden="true" />
          <AlertTitle>
            {completion === "enabled"
              ? m.two_factor_success_title()
              : m.two_factor_disabled_title()}
          </AlertTitle>
          <AlertDescription className="text-inherit">
            {completion === "enabled"
              ? m.two_factor_success_description()
              : m.two_factor_disabled_description()}
          </AlertDescription>
        </Alert>
      )}
      {!success && !totpURI && (
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={passwordId}>
              {m.two_factor_password_field_label()}
            </FieldLabel>
            <InputGroup aria-label={m.two_factor_password_field_label()}>
              <InputGroupInput
                id={passwordId}
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setCompletion(null)
                }}
                autoComplete="current-password"
                aria-describedby={`${passwordId}-description`}
                required
                autoFocus={completion === null}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-xs"
                  aria-label={
                    showPassword
                      ? m.two_factor_hide_password()
                      : m.two_factor_show_password()
                  }
                  aria-controls={passwordId}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription id={`${passwordId}-description`}>
              {twoFactorEnabled
                ? m.two_factor_disable_field_description()
                : m.two_factor_enable_field_description()}
            </FieldDescription>
          </Field>
          <Field>
            <Button
              type="button"
              className="w-full"
              variant={twoFactorEnabled ? "destructive" : "default"}
              onClick={twoFactorEnabled ? disable2FA : enable2FA}
              disabled={!password || totpURI !== ""}
            >
              {twoFactorEnabled
                ? m.two_factor_disable_button()
                : m.two_factor_enable_button()}
            </Button>
          </Field>
          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
      )}
      {!success && totpURI && (
        <FieldGroup>
          <section
            aria-labelledby={`${totpId}-scan-title`}
            className="min-w-0 space-y-3"
          >
            <div className="flex items-start gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium tabular-nums"
              >
                1
              </span>
              <div className="min-w-0">
                <h3 id={`${totpId}-scan-title`} className="text-sm font-medium">
                  {m.two_factor_scan_qr_title()}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {m.two_factor_scan_qr_description()}
                </p>
              </div>
            </div>
            <div className="mx-auto w-full max-w-64 rounded-xl border bg-white p-4">
              <QRCode
                value={totpURI}
                size={256}
                bgColor="#ffffff"
                fgColor="#000000"
                role="img"
                title={m.two_factor_qr_label()}
                aria-label={m.two_factor_qr_label()}
                style={{ width: "100%", maxWidth: "100%", height: "auto" }}
              />
            </div>
          </section>
          <section
            aria-labelledby={`${totpId}-verify-title`}
            className="min-w-0 space-y-3"
          >
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full border bg-muted text-xs font-medium tabular-nums"
              >
                2
              </span>
              <h3 id={`${totpId}-verify-title`} className="text-sm font-medium">
                {m.two_factor_verify_submit()}
              </h3>
            </div>
            <Field data-invalid={totpInvalid}>
              <FieldLabel htmlFor={totpId}>
                {m.two_factor_verify_totp()}
              </FieldLabel>
              <Input
                id={totpId}
                ref={totpRef}
                type="text"
                name="totp"
                value={totp}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                spellCheck={false}
                autoCapitalize="none"
                autoFocus
                onChange={(e) => {
                  setTotp(e.target.value)
                  setTotpInvalid(false)
                }}
                onBlur={() => setTotpInvalid(totp.length > 0 && !isTotpValid)}
                aria-invalid={totpInvalid}
                aria-describedby={`${totpId}-description${totpInvalid ? ` ${totpId}-error` : ""}`}
                className="text-center font-mono tracking-[0.25em] tabular-nums"
                required
              />
              <FieldDescription
                id={`${totpId}-description`}
                className="text-xs"
              >
                {m.two_factor_setup_code_description()}
              </FieldDescription>
              {totpInvalid && (
                <FieldError id={`${totpId}-error`}>
                  {m.two_factor_code_invalid()}
                </FieldError>
              )}
            </Field>
            <Field>
              <Button
                type="button"
                className="w-full"
                onClick={verify2FA}
                disabled={!isTotpValid}
              >
                {m.two_factor_verify_submit()}
              </Button>
            </Field>
            {error && <FieldError>{error}</FieldError>}
          </section>
        </FieldGroup>
      )}
      {success && (
        <div className="flex flex-col gap-3">
          <section
            aria-labelledby={`${passwordId}-backup-title`}
            className="min-w-0 space-y-3 rounded-xl border bg-card p-3"
          >
            <div>
              <h3
                id={`${passwordId}-backup-title`}
                className="text-sm font-semibold"
              >
                {m.two_factor_backup_title()}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {m.two_factor_backup_description()}
              </p>
            </div>
            <ul
              className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              aria-label={m.two_factor_backup_title()}
            >
              {backupCodes.map((code, i) => (
                <li key={`${code}-${i}`}>
                  <code className="block rounded-lg border bg-muted/50 px-3 py-2 text-center font-mono text-sm break-all tabular-nums select-all">
                    {code}
                  </code>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              disabled={copyState === "copying"}
              aria-busy={copyState === "copying"}
              onClick={copyCodes}
            >
              {copyState === "copying" ? (
                <Spinner
                  aria-hidden="true"
                  className="motion-reduce:animate-none"
                />
              ) : copyState === "copied" ? (
                <CheckCircle2Icon aria-hidden="true" />
              ) : (
                <CopyIcon aria-hidden="true" />
              )}
              {copyState === "copying"
                ? m.two_factor_copy_pending()
                : copyState === "copied"
                  ? m.two_factor_codes_copied()
                  : m.two_factor_copy_codes()}
            </Button>
            {copyState === "copied" && (
              <p role="status" className="sr-only">
                {m.two_factor_codes_copied()}
              </p>
            )}
            {copyError && <FieldError>{copyError}</FieldError>}
          </section>
          <Field>
            <Button type="button" className="w-full" onClick={finishSetup}>
              {m.two_factor_backup_done()}
            </Button>
          </Field>
        </div>
      )}
    </>
  )
}
