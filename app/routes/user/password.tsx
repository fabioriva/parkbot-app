import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
} from "react"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "~/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "~/components/ui/input-group"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Spinner } from "~/components/ui/spinner"
import { authClient } from "~/lib/auth"
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  validatePasswordChange,
  type PasswordChangeValues,
  type PasswordValidationError,
  type PasswordValidationErrors,
} from "~/lib/password-validation"
import { m } from "@paraglide/messages.js"

function validationMessage(error: PasswordValidationError | undefined) {
  if (error === "required") return m.password_change_error_required()
  if (error === "length") return m.password_change_error_length()
  if (error === "mismatch") return m.password_change_error_match()
}

function passwordChangeError(error: { code?: string; status?: number }) {
  if (error.status === 429) return m.password_change_error_rate_limit()
  if (
    error.status === 401 ||
    error.code === "SESSION_EXPIRED" ||
    error.code === "UNAUTHORIZED"
  )
    return m.password_change_error_session()
  if (error.code === "INVALID_PASSWORD")
    return m.password_change_error_current()
  if (error.code === "PASSWORD_TOO_SHORT" || error.code === "PASSWORD_TOO_LONG")
    return m.password_change_requirements({
      min: PASSWORD_MIN_LENGTH,
      max: PASSWORD_MAX_LENGTH,
    })
  if (error.code === "PASSWORD_COMPROMISED")
    return m.password_change_error_compromised()
  return m.password_change_error_generic()
}

function PasswordInput({
  label,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: string }) {
  const [visible, setVisible] = useState(false)
  const toggleLabel = visible
    ? m.password_change_hide_field({ field: label })
    : m.password_change_show_field({ field: label })

  return (
    <InputGroup aria-label={label}>
      <InputGroupInput {...props} type={visible ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          aria-label={toggleLabel}
          aria-controls={props.id}
          aria-pressed={visible}
          disabled={props.disabled}
          onClick={() => {
            if (!props.disabled) setVisible((current) => !current)
          }}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export default function Password() {
  const titleId = useId()
  const currentId = `${titleId}-current`
  const newId = `${titleId}-new`
  const confirmId = `${titleId}-confirm`
  const currentRef = useRef<HTMLInputElement>(null)
  const newRef = useRef<HTMLInputElement>(null)
  const confirmRef = useRef<HTMLInputElement>(null)
  const submitting = useRef(false)
  const feedbackRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [success, setSuccess] = useState(false)
  const [validationErrors, setValidationErrors] =
    useState<PasswordValidationErrors>({})
  const [isPending, setIsPending] = useState(false)
  const [inputVersion, setInputVersion] = useState(0)

  useEffect(() => {
    if (error || success) feedbackRef.current?.focus()
  }, [error, success])

  const updatePassword = (field: keyof PasswordChangeValues, value: string) => {
    if (submitting.current) return
    const setters = {
      currentPassword: setCurrentPassword,
      newPassword: setNewPassword,
      confirmPassword: setConfirmPassword,
    }
    setters[field](value)
    setError(null)
    setSuccess(false)
    setValidationErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(field === "newPassword" ? { confirmPassword: undefined } : {}),
    }))
  }

  const changePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting.current) return
    setError(null)
    setSuccess(false)
    const errors = validatePasswordChange({
      currentPassword,
      newPassword,
      confirmPassword,
    })
    setValidationErrors(errors)
    if (
      errors.currentPassword ||
      errors.newPassword ||
      errors.confirmPassword
    ) {
      const firstInvalid = errors.currentPassword
        ? currentRef
        : errors.newPassword
          ? newRef
          : confirmRef
      firstInvalid.current?.focus()
      return
    }
    submitting.current = true
    setIsPending(true)
    try {
      const { data, error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      })
      if (error) {
        setError(passwordChangeError(error))
      } else if (!data) {
        setError(m.password_change_error_generic())
      } else {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setValidationErrors({})
        setInputVersion((current) => current + 1)
        setSuccess(true)
      }
    } catch {
      setError(m.password_change_error_network())
    } finally {
      submitting.current = false
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle id={titleId} className="text-sm font-semibold">
          {m.password_change_field_legend()}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          {m.password_change_field_description()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={changePassword}
          noValidate
          aria-labelledby={titleId}
          aria-busy={isPending}
        >
          <FieldGroup>
            {!isPending && error && (
              <Alert variant="destructive" ref={feedbackRef} tabIndex={-1}>
                <AlertCircle aria-hidden="true" />
                <AlertTitle>{m.password_change_error_title()}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!isPending && success && (
              <Alert
                role="status"
                ref={feedbackRef}
                tabIndex={-1}
                className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              >
                <CheckCircle2 aria-hidden="true" />
                <AlertTitle>{m.password_change_success_title()}</AlertTitle>
                <AlertDescription className="text-inherit">
                  {m.password_change_success_description()}
                </AlertDescription>
              </Alert>
            )}
            <FieldSet aria-labelledby={titleId} disabled={isPending}>
              <Field data-invalid={!!validationErrors.currentPassword}>
                <FieldLabel htmlFor={currentId}>
                  {m.password_change_field_current()}
                </FieldLabel>
                <PasswordInput
                  key={`${currentId}-${inputVersion}`}
                  id={currentId}
                  ref={currentRef}
                  name="currentPassword"
                  label={m.password_change_field_current()}
                  value={currentPassword}
                  onChange={(e) =>
                    updatePassword("currentPassword", e.target.value)
                  }
                  disabled={isPending}
                  autoComplete="current-password"
                  required
                  aria-invalid={!!validationErrors.currentPassword}
                  aria-describedby={`${currentId}-description${validationErrors.currentPassword ? ` ${currentId}-error` : ""}`}
                  autoFocus={!success}
                />
                <FieldDescription id={`${currentId}-description`}>
                  {m.password_change_field_description_current()}
                </FieldDescription>
                {validationErrors.currentPassword && (
                  <FieldError id={`${currentId}-error`}>
                    {validationMessage(validationErrors.currentPassword)}
                  </FieldError>
                )}
              </Field>
              <FieldSeparator />
              <Field data-invalid={!!validationErrors.newPassword}>
                <FieldLabel htmlFor={newId}>
                  {m.password_change_field_new()}
                </FieldLabel>
                <PasswordInput
                  key={`${newId}-${inputVersion}`}
                  id={newId}
                  ref={newRef}
                  name="newPassword"
                  label={m.password_change_field_new()}
                  value={newPassword}
                  onChange={(e) =>
                    updatePassword("newPassword", e.target.value)
                  }
                  disabled={isPending}
                  autoComplete="new-password"
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={PASSWORD_MAX_LENGTH}
                  aria-invalid={!!validationErrors.newPassword}
                  aria-describedby={`${newId}-requirements${validationErrors.newPassword ? ` ${newId}-error` : ""}`}
                />
                <FieldDescription
                  id={`${newId}-requirements`}
                  className="text-xs"
                >
                  {m.password_change_requirements({
                    min: PASSWORD_MIN_LENGTH,
                    max: PASSWORD_MAX_LENGTH,
                  })}
                </FieldDescription>
                {validationErrors.newPassword && (
                  <FieldError id={`${newId}-error`}>
                    {validationMessage(validationErrors.newPassword)}
                  </FieldError>
                )}
              </Field>
              <Field data-invalid={!!validationErrors.confirmPassword}>
                <FieldLabel htmlFor={confirmId}>
                  {m.password_change_field_confirm()}
                </FieldLabel>
                <PasswordInput
                  key={`${confirmId}-${inputVersion}`}
                  id={confirmId}
                  ref={confirmRef}
                  name="confirmPassword"
                  label={m.password_change_field_confirm()}
                  value={confirmPassword}
                  onChange={(e) =>
                    updatePassword("confirmPassword", e.target.value)
                  }
                  disabled={isPending}
                  autoComplete="new-password"
                  required
                  maxLength={PASSWORD_MAX_LENGTH}
                  aria-invalid={!!validationErrors.confirmPassword}
                  aria-describedby={
                    validationErrors.confirmPassword
                      ? `${confirmId}-error`
                      : undefined
                  }
                />
                {validationErrors.confirmPassword && (
                  <FieldError id={`${confirmId}-error`}>
                    {validationMessage(validationErrors.confirmPassword)}
                  </FieldError>
                )}
              </Field>
              <Field>
                <Button
                  className="w-full"
                  type="submit"
                  aria-busy={isPending}
                  disabled={
                    isPending ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword
                  }
                >
                  {isPending && (
                    <Spinner
                      aria-hidden="true"
                      className="motion-reduce:animate-none"
                    />
                  )}
                  {isPending
                    ? m.password_change_pending()
                    : m.password_change_button()}
                </Button>
                <FieldDescription className="text-xs">
                  {m.password_change_sessions_notice()}
                </FieldDescription>
              </Field>
            </FieldSet>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
