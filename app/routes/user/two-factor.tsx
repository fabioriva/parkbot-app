import { useId, useState } from "react"
import { useOutletContext } from "react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { FieldSet } from "~/components/ui/field"
import { Setup2FA } from "~/components/setup-2fa"
import { m } from "@paraglide/messages.js"

import type { Route as ApsLayoutRoute } from "../aps/+types/layout"

export default function TwoFactor() {
  const titleId = useId()
  const { user } =
    useOutletContext<
      Pick<ApsLayoutRoute.ComponentProps["loaderData"], "user">
    >()
  const [success, setSuccess] = useState(false)
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle id={titleId} className="text-sm font-semibold">
          {m.two_factor_field_legend()}
        </CardTitle>
        <CardDescription className="text-xs leading-relaxed">
          {m.two_factor_field_description()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FieldSet aria-labelledby={titleId}>
          <Setup2FA
            isTwoFactorEnabled={user.twoFactorEnabled}
            success={success}
            setSuccess={setSuccess}
            showStatus
          />
        </FieldSet>
      </CardContent>
    </Card>
  )
}
