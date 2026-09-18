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

import type { Route } from "./+types/two-factor-reset"

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData()
    const code = formData.get("code")
    const response = await auth.api.verifyBackupCode({
      asResponse: true,
      body: {
        code, // required
        disableSession: false,
        // trustDevice: true,
      },
      headers: await request.headers,
    })
    if (response.ok) {
      const headers = new Headers(response.headers)
      return redirect("/2fa-setup", { headers })
    } else {
      return { message: response.statusText }
    }
  } catch (error) {
    // console.log(error)
    return { message: error?.body?.message }
  }
}

export default function TwoFactorReset({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.two_factor_reset_title()}</CardTitle>
        <CardDescription>{m.two_factor_reset_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="code">
                {m.two_factor_reset_label()}
              </FieldLabel>
              <Input type="text" name="code" required autoFocus />
            </Field>
            <Field>
              <Submit action="/2fa-reset" title={m.two_factor_reset_button()} />
              {actionData ? (
                <FieldError>{actionData.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
        </Form>
        <div className="mt-6 text-sm">
          <a className="underline underline-offset-4" href="/2fa-verify">
            {m.two_factor_reset_link()}
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
