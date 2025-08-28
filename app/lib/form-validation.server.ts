import * as z from "zod";

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

export function validateForm(formData: object, formSchema: object) {
  const result = formSchema.safeParse(Object.fromEntries(formData));
  return result;
}
