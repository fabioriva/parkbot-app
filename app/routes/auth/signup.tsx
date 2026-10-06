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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Submit } from "~/components/submit-button"
import { auth } from "~/lib/auth.server"
import {
  findSubscriptionByEmail,
  subscribeByEmail,
} from "~/lib/subscription.server"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/signup"

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData()
    const firstName = formData.get("first-name")
    const lastName = formData.get("last-name")
    const email = formData.get("email")
    const password = formData.get("password")
    const confirm = formData.get("confirm")
    if (
      typeof firstName !== "string" ||
      !firstName.trim() ||
      typeof lastName !== "string" ||
      !lastName.trim()
    ) {
      return { error: "Enter your first and last name." }
    }
    if (typeof email !== "string" || !email.trim()) {
      return { error: m.password_forgot_email_not_valid() }
    }
    if (typeof password !== "string" || !password.length) {
      return { error: "Enter your password." }
    }
    if (typeof confirm !== "string" || password !== confirm) {
      return { error: m.signup_password_match() }
    }
    const subscription = await findSubscriptionByEmail(email)
    if (subscription === null) {
      return { error: m.signup_not_subscribed() }
    }
    const name = `${firstName} ${lastName}`
    const { headers } = await auth.api.signUpEmail({
      returnHeaders: true,
      body: {
        name,
        email,
        password,
        role: subscription.role,
        // callbackURL: "/aps-select", // optional
        image: `https://api.dicebear.com/10.x/bottts/svg?seed=${name}`, // optional
      },
    })
    await subscribeByEmail(email)
    return redirect(`/email-verification?email=${encodeURIComponent(email)}`, {
      headers,
    })
  } catch (error) {
    return {
      error: isAPIError(error)
        ? (error.body?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : "Unable to sign up.",
    }
  }
}

export default function Signup({ actionData }: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.signup_card_title()}</CardTitle>
        <CardDescription>{m.signup_card_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <FieldGroup className="grid max-w-sm grid-cols-2">
              <Field>
                <FieldLabel htmlFor="first-name">
                  {m.signup_first_name()}
                </FieldLabel>
                <Input name="first-name" placeholder="John" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="last-name">
                  {m.signup_last_name()}
                </FieldLabel>
                <Input name="last-name" placeholder="Doe" required />
              </Field>
            </FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="john.doe@example.com"
                required
              />
              <FieldDescription>
                {m.signup_email_field_description()}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
              <FieldDescription>
                {m.signup_password_field_description()}
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm">Conferma Password</FieldLabel>
              <Input
                type="password"
                name="confirm"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field>
              <Submit action="/signup" title={m.signup()} />
              {actionData ? <FieldError>{actionData.error}</FieldError> : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          {m.signup_registered()}{" "}
          <a href="/signin" className="underline underline-offset-4">
            {m.signup_signin_link()}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
