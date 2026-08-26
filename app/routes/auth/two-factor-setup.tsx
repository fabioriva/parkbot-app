import { useState } from "react"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Setup2FA } from "~/components/setup-2fa"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/two-factor-setup"

export default function TwoFactor({ actionData }) {
  const [success, setSuccess] = useState(false)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.two_factor_field_legend()}</CardTitle>
        <CardDescription>
          {m.two_factor_enable_field_description()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Setup2FA
          isTwoFactorEnabled={false}
          success={success}
          setSuccess={setSuccess}
        />
        {success && (
          <Button className="w-full" render={<Link to="/aps-select" />}>
            {m.aps_select_card_title()}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
