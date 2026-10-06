import { isAPIError } from "better-auth/api"
import { data, Form } from "react-router"
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
import { Success } from "~/components/success-alert"
import { auth } from "~/lib/auth.server"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/password-reset"

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData()
    const newPassword = formData.get("newPassword")
    const token = formData.get("token")
    if (typeof newPassword !== "string" || !newPassword.length) {
      return { message: "Enter a new password." }
    }
    if (typeof token !== "string" || !token.trim()) {
      return { message: "Invalid password reset token." }
    }
    const result = await auth.api.resetPassword({
      body: {
        newPassword, // required
        token, // required
      },
    })
    if (result.status) {
      return { success: true }
    }
    return { message: "Unable to reset password." }
  } catch (error) {
    return {
      message: isAPIError(error)
        ? (error.body?.message ?? error.message)
        : error instanceof Error
          ? error.message
          : "Unable to reset password.",
    }
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const token = searchParams.get("token")
  if (!token?.trim()) {
    throw data("Forbidden", { status: 403 })
  }
  return { token }
}

export default function PasswordReset({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.password_reset_card_title()}</CardTitle>
        <CardDescription>{m.password_reset_card_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        {actionData?.success && (
          <Success
            description={m.password_reset_success_description()}
            title={m.password_reset_success_title()}
          />
        )}
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                type="password"
                name="newPassword"
                // autoComplete="current-password"
              />
            </Field>
            <input type="hidden" name="token" value={loaderData?.token} />
            <Field>
              <Submit
                action="/password-reset"
                title={m.password_reset_confirm()}
              />
              {actionData ? (
                <FieldError>{actionData?.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  )
}
