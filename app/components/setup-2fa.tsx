import {
  AlertCircle,
  CheckCircle2Icon,
  CopyIcon,
  Eye,
  EyeOff,
} from "lucide-react"
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

type TwoFactorRequest = "enable" | "disable" | "verify"

function requestErrorMessage(action: TwoFactorRequest) {
  if (action === "enable") return m.two_factor_enable_error()
  if (action === "disable") return m.two_factor_disable_error()
  return m.two_factor_verify_error()
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
  const passwordRef = useRef<HTMLInputElement>(null)
  const request = useRef<TwoFactorRequest | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [totp, setTotp] = useState("")
  const [totpURI, setTotpURI] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    isTwoFactorEnabled ?? false
  )
  const [showPassword, setShowPassword] = useState(false)
  const [totpError, setTotpError] = useState<string | null>(null)
  const [completion, setCompletion] = useState<"enabled" | "disabled" | null>(
    null
  )
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">(
    "idle"
  )
  const [copyError, setCopyError] = useState<string | null>(null)
  const [pending, setPending] = useState<TwoFactorRequest | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const busy = pending !== null
  const isTotpValid = /^[0-9]{6}$/.test(totp)

  useEffect(() => {
    if (error || completion) feedbackRef.current?.focus()
    else if (passwordError) passwordRef.current?.focus()
    else if (totpError) totpRef.current?.focus()
  }, [error, completion, passwordError, totpError])

  const startRequest = (action: TwoFactorRequest) => {
    if (request.current) return false
    request.current = action
    setPending(action)
    setError(null)
    setPasswordError(null)
    setTotpError(null)
    setCompletion(null)
    return true
  }

  const endRequest = () => {
    request.current = null
    setPending(null)
  }

  const handleRequestError = (
    failure: { code?: string; status?: number },
    action: TwoFactorRequest
  ) => {
    if (
      failure.status === 429 ||
      failure.code === "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE" ||
      failure.code === "ACCOUNT_TEMPORARILY_LOCKED"
    ) {
      setError(m.two_factor_error_rate_limit())
    } else if (
      failure.status === 401 ||
      failure.code === "SESSION_EXPIRED" ||
      failure.code === "UNAUTHORIZED" ||
      failure.code === "INVALID_TWO_FACTOR_COOKIE"
    ) {
      setError(m.two_factor_error_session())
    } else if (action !== "verify" && failure.code === "INVALID_PASSWORD") {
      setPasswordError(m.two_factor_error_password())
    } else if (action === "verify" && failure.code === "INVALID_CODE") {
      setTotpError(m.two_factor_error_code())
    } else if (
      failure.code === "TOTP_ALREADY_ENABLED" ||
      failure.code === "TOTP_NOT_ENABLED" ||
      failure.code === "TWO_FACTOR_NOT_ENABLED"
    ) {
      setError(m.two_factor_error_state())
    } else {
      setError(requestErrorMessage(action))
    }
  }

  const hasPassword = () => {
    if (password) return true
    setError(null)
    setCompletion(null)
    setPasswordError(m.two_factor_password_required())
    passwordRef.current?.focus()
    return false
  }

  const clearTemporaryCredentials = () => {
    setPassword("")
    setTotp("")
    setTotpURI("")
    setShowPassword(false)
    setTotpError(null)
    setPasswordError(null)
  }

  const clearRecoveryCodes = () => {
    copyRequest.current.version++
    copyRequest.current.pending = false
    setBackupCodes([])
    setCopyState("idle")
    setCopyError(null)
  }

  const disable2FA = async () => {
    if (request.current || !hasPassword() || !startRequest("disable")) return
    try {
      const { data, error } = await authClient.twoFactor.disable({ password })
      if (error) return handleRequestError(error, "disable")
      if (!data?.status) return setError(m.two_factor_disable_error())
      setTwoFactorEnabled(false)
      clearTemporaryCredentials()
      clearRecoveryCodes()
      setSuccess(false)
      setCompletion("disabled")
    } catch {
      setError(m.two_factor_error_network())
    } finally {
      endRequest()
    }
  }
  const enable2FA = async () => {
    if (request.current || !hasPassword() || !startRequest("enable")) return
    try {
      const { data, error } = await authClient.twoFactor.enable({ password })
      if (error) return handleRequestError(error, "enable")
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
      clearRecoveryCodes()
      setBackupCodes(data.backupCodes)
      setTotpURI(data.totpURI)
      setShowPassword(false)
    } catch {
      setError(m.two_factor_error_network())
    } finally {
      endRequest()
    }
  }
  const verify2FA = async () => {
    if (request.current) return
    if (!isTotpValid) {
      setError(null)
      setTotpError(m.two_factor_code_invalid())
      totpRef.current?.focus()
      return
    }
    if (!startRequest("verify")) return
    try {
      const { data, error } = await authClient.twoFactor.verifyTotp({
        code: totp,
        trustDevice: true,
      })
      if (error) return handleRequestError(error, "verify")
      if (!data || ("status" in data && data.status === false))
        return setError(m.two_factor_verify_error())
      setSuccess(true)
      setTwoFactorEnabled(true)
      clearTemporaryCredentials()
      setCompletion("enabled")
    } catch {
      setError(m.two_factor_error_network())
    } finally {
      endRequest()
    }
  }

  const copyCodes = async () => {
    if (
      request.current ||
      !success ||
      !backupCodes.length ||
      copyRequest.current.pending
    )
      return
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
    if (request.current) return
    clearRecoveryCodes()
    clearTemporaryCredentials()
    setError(null)
    setSuccess(false)
    onComplete?.()
  }
  const requestFeedback =
    !busy && error ? (
      <Alert variant="destructive" ref={feedbackRef} tabIndex={-1}>
        <AlertCircle aria-hidden="true" />
        <AlertTitle>{m.two_factor_error_title()}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    ) : null
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
      {!busy && completion && (
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
        <form
          noValidate
          aria-label={
            twoFactorEnabled
              ? m.two_factor_disable_button()
              : m.two_factor_enable_button()
          }
          aria-busy={busy}
          onSubmit={(event) => {
            event.preventDefault()
            return twoFactorEnabled ? disable2FA() : enable2FA()
          }}
        >
          <FieldGroup>
            <Field data-invalid={!!passwordError}>
              <FieldLabel htmlFor={passwordId}>
                {m.two_factor_password_field_label()}
              </FieldLabel>
              <InputGroup aria-label={m.two_factor_password_field_label()}>
                <InputGroupInput
                  id={passwordId}
                  ref={passwordRef}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    if (request.current) return
                    setPassword(e.target.value)
                    setCompletion(null)
                    setError(null)
                    setPasswordError(null)
                  }}
                  disabled={busy}
                  autoComplete="current-password"
                  aria-invalid={!!passwordError}
                  aria-describedby={`${passwordId}-description${passwordError ? ` ${passwordId}-error` : ""}`}
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
                    disabled={busy}
                    onClick={() => {
                      if (!request.current)
                        setShowPassword((current) => !current)
                    }}
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
              {passwordError && (
                <FieldError id={`${passwordId}-error`}>
                  {passwordError}
                </FieldError>
              )}
            </Field>
            {requestFeedback}
            <Field>
              <Button
                type="submit"
                className="w-full"
                variant={twoFactorEnabled ? "destructive" : "default"}
                disabled={busy || !password || totpURI !== ""}
                aria-busy={busy}
              >
                {busy && (
                  <Spinner
                    aria-hidden="true"
                    className="motion-reduce:animate-none"
                  />
                )}
                {pending === "disable"
                  ? m.two_factor_disabling()
                  : pending === "enable"
                    ? m.two_factor_enabling()
                    : twoFactorEnabled
                      ? m.two_factor_disable_button()
                      : m.two_factor_enable_button()}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      )}
      {!success && totpURI && (
        <form
          noValidate
          aria-label={m.two_factor_verify_submit()}
          aria-busy={busy}
          onSubmit={(event) => {
            event.preventDefault()
            return verify2FA()
          }}
        >
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
                  <h3
                    id={`${totpId}-scan-title`}
                    className="text-sm font-medium"
                  >
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
                <h3
                  id={`${totpId}-verify-title`}
                  className="text-sm font-medium"
                >
                  {m.two_factor_verify_submit()}
                </h3>
              </div>
              <Field data-invalid={!!totpError}>
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
                    if (request.current) return
                    setTotp(e.target.value)
                    setTotpError(null)
                    setError(null)
                  }}
                  onBlur={() => {
                    if (!request.current && totp.length > 0 && !isTotpValid)
                      setTotpError(m.two_factor_code_invalid())
                  }}
                  disabled={busy}
                  aria-invalid={!!totpError}
                  aria-describedby={`${totpId}-description${totpError ? ` ${totpId}-error` : ""}`}
                  className="text-center font-mono tracking-[0.25em] tabular-nums"
                  required
                />
                <FieldDescription
                  id={`${totpId}-description`}
                  className="text-xs"
                >
                  {m.two_factor_setup_code_description()}
                </FieldDescription>
                {totpError && (
                  <FieldError id={`${totpId}-error`}>{totpError}</FieldError>
                )}
              </Field>
              {requestFeedback}
              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={busy || !isTotpValid}
                  aria-busy={busy}
                >
                  {busy && (
                    <Spinner
                      aria-hidden="true"
                      className="motion-reduce:animate-none"
                    />
                  )}
                  {busy
                    ? m.two_factor_verifying()
                    : m.two_factor_verify_submit()}
                </Button>
              </Field>
            </section>
          </FieldGroup>
        </form>
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
