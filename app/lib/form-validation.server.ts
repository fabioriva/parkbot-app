import { z, ZodError } from "zod";

const email = z.string().min(1, "auth.emptyField").email("auth.emailInvalid");

const password = z
  .string()
  .min(1, "auth.emptyField")
  .min(8, "auth.passwordMin")
  .max(255, "auth.passwordMax");

export const ForgotPasswordSchema = z.object({
  email,
});

export const LoginSchema = z.object({
  email,
  password,
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
