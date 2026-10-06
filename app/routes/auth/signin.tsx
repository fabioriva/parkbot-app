import { isAPIError } from "better-auth/api"
import { Form, redirect } from "react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Submit } from "~/components/submit-button"
import { auth } from "~/lib/auth.server"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/signin"

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData()
    const email = formData.get("email")
    const password = formData.get("password")
    if (typeof email !== "string" || !email.trim()) {
      return { message: m.password_forgot_email_not_valid() }
    }
    if (typeof password !== "string" || !password.length) {
      return { message: "Enter your password." }
    }
    const { headers, response } = await auth.api.signInEmail({
      returnHeaders: true,
      body: {
        email,
        password,
        rememberMe: false,
        callbackURL: "/aps-select",
      },
      headers: request.headers,
    })
    if ("twoFactorRedirect" in response) {
      return redirect("/2fa-verify", { headers })
    }
    if (!response.user.emailVerified) {
      return redirect(
        `/email-verification?email=${encodeURIComponent(response.user.email)}`,
        { headers }
      )
    }
    return redirect(response.url ?? "/aps-select", { headers })
  } catch (error) {
    return {
      message: isAPIError(error)
        ? (error.body?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : "Unable to sign in.",
    }
  }
}

export default function Signin({ actionData }: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.signin_card_title()}</CardTitle>
        <CardDescription>{m.signin_card_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="mail@example.com"
                required
              />
            </Field>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <a
                  href="/password-forgot"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  {m.signin_forgot()}
                </a>
              </div>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <Submit action="/signin" title={m.signin()} />
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          {m.signin_signup()}{" "}
          <a href="/signup" className="underline underline-offset-4">
            {m.signin_signup_link()}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
