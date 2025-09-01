import * as z from "zod";
import type { ZodError } from "zod";

const email = z.string().min(1, "auth.emptyField").email("auth.emailInvalid");

const password = z
  .string()
  .min(1, "auth.emptyField")
  .min(8, "auth.passwordMin") // password string must be at least 8 characters long
  .max(255, "auth.passwordMax") // password string must be less than 255 characters long
  .regex(new RegExp(".*[A-Z].*"), "auth.passwordInvalid") // one uppercase letter
  .regex(new RegExp(".*[a-z].*"), "auth.passwordInvalid") // one lowercase letter
  .regex(new RegExp(".*\\d.*"), "auth.passwordInvalid") // one number
  .regex(
    new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\\\"'|{}\\[\\];:\\\\].*"),
    "auth.passwordInvalid" // one special character
  );

export const ForgotPasswordSchema = z.object({
  email,
});

export const LoginSchema = z.object({
  email,
  password,
});

export const RecoveryCodeSchema = z.object({
  code: z
    .string()
    .min(1, "auth.emptyField")
    .length(16, "auth.codeInvalid")
    .uppercase("auth.codeInvalid")
    .regex(new RegExp("^[A-Z0-9]+$"), "auth.codeInvalid"), // Matches any uppercase letter (A-Z) or digit (0-9)
});

export const ResetPasswordSchema = z.object({
  password,
  confirm: password,
});

export const TotpCodeSchema = z.object({
  code: z
    .string()
    .min(1, "auth.emptyField")
    .length(6, "auth.codeInvalid")
    .regex(new RegExp("^\\d+$"), "auth.codeInvalid"), // Matches one or more digits
});

export const SignupSchema = z.object({
  username: z
    .string()
    .min(1, "auth.emptyField")
    .min(4, "auth.usernameMin")
    .max(32, "auth.usernameMax"),
  email,
  password,
  confirm: password,
});

export const VerifyMailSchema = z.object({
  code: z
    .string()
    .min(1, "auth.emptyField")
    .length(8, "auth.codeInvalid")
    .uppercase("auth.codeInvalid"),
});

export function validateForm(formData, formSchema) {
  const result = formSchema.safeParse(Object.fromEntries(formData));
  return result;
}
