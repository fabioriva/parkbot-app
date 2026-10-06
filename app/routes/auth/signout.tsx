import { Loader2Icon } from "lucide-react"
import { Form, redirect, useNavigate, useNavigation } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { auth } from "~/lib/auth.server"
import { m } from "@paraglide/messages.js"

import type { Route } from "./+types/signout"

export async function action({ request }: Route.ActionArgs) {
  const data = await auth.api.signOut({
    asResponse: true,
    headers: await request.headers,
  })
  const headers = new Headers(data.headers)
  return redirect("/", { headers })
}

export default function Signout() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{m.signout_card_title()}</CardTitle>
        <CardDescription>{m.signout_card_description()}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post" className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            {m.cancel()}
          </Button>
          {navigation.formAction === "/signout" ? (
            <Button className="flex-1" disabled>
              <Loader2Icon className="animate-spin" />
              {m.signout()}
            </Button>
          ) : (
            <Button className="flex-1" type="submit">
              {m.signout()}
            </Button>
          )}
        </Form>
      </CardContent>
    </Card>
  )
}
