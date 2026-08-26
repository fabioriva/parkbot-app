import { useState } from "react"
import { useOutletContext } from "react-router"
import { FieldDescription, FieldLegend, FieldSet } from "~/components/ui/field"
import { Setup2FA } from "~/components/setup-2fa"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/two-factor"

export default function TwoFactor() {
  const user = useOutletContext()
  const [success, setSuccess] = useState(false)
  return (
    <div className="w-full max-w-md">
      <FieldSet>
        <FieldLegend>{m.two_factor_field_legend()}</FieldLegend>
        <FieldDescription>{m.two_factor_field_description()}</FieldDescription>
        <Setup2FA
          isTwoFactorEnabled={user.twoFactorEnabled}
          success={success}
          setSuccess={setSuccess}
        />
      </FieldSet>
    </div>
  )
}
