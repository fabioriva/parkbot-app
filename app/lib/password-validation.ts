export const PASSWORD_MIN_LENGTH = 8
export const PASSWORD_MAX_LENGTH = 128

export interface PasswordChangeValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export type PasswordValidationError = "required" | "length" | "mismatch"
export type PasswordValidationErrors = Partial<
  Record<keyof PasswordChangeValues, PasswordValidationError>
>

export function validatePasswordChange({
  currentPassword,
  newPassword,
  confirmPassword,
}: PasswordChangeValues): PasswordValidationErrors {
  const errors: PasswordValidationErrors = {}
  if (!currentPassword) errors.currentPassword = "required"
  if (!newPassword) errors.newPassword = "required"
  else if (
    newPassword.length < PASSWORD_MIN_LENGTH ||
    newPassword.length > PASSWORD_MAX_LENGTH
  )
    errors.newPassword = "length"
  if (!confirmPassword) errors.confirmPassword = "required"
  else if (newPassword !== confirmPassword) errors.confirmPassword = "mismatch"
  return errors
}
