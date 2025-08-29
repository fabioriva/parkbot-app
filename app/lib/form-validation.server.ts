import { z, ZodError } from "zod";

const email = z.string().min(1, "auth.emptyField").email("auth.emailInvalid");

// password string must contain at least:
// one uppercase letter,
// one lowercase letter,
// one number,
// one special character,
// and is at least 8 characters long
const password = z
  .string()
  .min(1, "auth.emptyField")
  .min(8, "auth.passwordMin")
  .max(255, "auth.passwordMax")
  .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
  .regex(new RegExp(".*[a-z].*"), "One lowercase character")
  .regex(new RegExp(".*\\d.*"), "One number")
  .regex(
    new RegExp(".*[`~<>?,./!@#$%^&*()\\-_+=\\\"'|{}\\[\\];:\\\\].*"),
    "One special character"
  );

export const ForgotPasswordSchema = z.object({
  email,
});

export const LoginSchema = z.object({
  email,
  password,
});

export const TotpCodeSchema = z.object({
  code: z
    .string()
    .min(1, "auth.emptyField")
    .length(6)
    .regex(new RegExp("\\d+")), // Matches one or more digits
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
  code: z.string().min(1, "auth.emptyField").length(8).uppercase(),
});

export function validateForm(formData: any, formSchema: any): ZodError {
  const result = formSchema.safeParse(Object.fromEntries(formData));
  return result;
}
