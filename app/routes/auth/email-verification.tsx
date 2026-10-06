import { useState } from "react"
import { redirect } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Field, FieldGroup } from "~/components/ui/field"
import { authClient } from "~/lib/auth"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/email-verification"

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const email = searchParams.get("email")
  if (!email?.trim()) {
    return redirect("/signin")
  }
  return { email }
}

export default function EmailVerification({
  loaderData,
}: Route.ComponentProps) {
  const [emailSent, setEmailSent] = useState(false)
  const resendEmail = async () => {
    const { data } = await authClient.sendVerificationEmail({
      email: loaderData.email,
      callbackURL: "/aps-select", // The redirect URL after verification
    })
    setEmailSent(data?.status ?? false)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.email_verification_card_title()}</CardTitle>
        <CardDescription>
          {m.email_verification_card_description()}{" "}
          <span className="text-blue-500">{loaderData?.email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <p>{m.email_verification_card_content()}</p>
          </Field>
          <Field>
            <Button onClick={resendEmail}>{m.auth_email_resend()}</Button>
            {emailSent ? (
              <p className="text-center">{m.auth_email_sent()}!</p>
            ) : null}
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
