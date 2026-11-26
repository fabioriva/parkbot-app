import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Setup2FA } from "~/components/setup-2fa"
import { m } from "@paraglide/messages.js"

export default function TwoFactor() {
  const navigate = useNavigate()
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
          onComplete={() => {
            void navigate("/aps-select")
          }}
        />
      </CardContent>
    </Card>
  )
}
