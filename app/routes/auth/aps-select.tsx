import { useId } from "react"
import { data, Form, redirect, useNavigation } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "~/components/ui/field"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Spinner } from "~/components/ui/spinner"
import { auth } from "~/lib/auth.server"
import { findSubscribedApsList } from "~/lib/aps.server"
import { requireSession } from "~/lib/authorization.server"
import { m } from "@paraglide/messages.js"
import "./aps-select.css"

import type { Route } from "./+types/aps-select"

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const intent = formData.get("intent")
  if (intent === "signout") {
    const data = await auth.api.signOut({
      asResponse: true,
      headers: await request.headers,
    })
    const headers = new Headers(data.headers)
    return redirect("/", { headers })
  }

  const aps = formData.get("aps")
  if (typeof aps !== "string" || !aps.trim()) {
    throw data("Invalid APS selection", { status: 400 })
  }
  const session = await requireSession(request)
  if (!session.assignedAps.includes(aps))
    throw data("APS not assigned", { status: 403 })
  const result = await auth.api.updateUser({
    body: {
      aps,
    },
    headers: await request.headers,
  })
  if (result.status) {
    return redirect(`/aps/${aps}/dashboard`)
  }
  return null
}

export async function loader({ request }: Route.LoaderArgs) {
  const data = await auth.api.getSession({
    headers: await request.headers,
  })
  if (!data) {
    return redirect("/")
  }
  const { session, user } = data
  if (process.env.TWO_FACTOR === "enabled" && !user.twoFactorEnabled) {
    return redirect("/2fa-setup")
  }
  const aps = await findSubscribedApsList(data.assignedAps)
  return aps
}

export default function ApsSelect({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation()
  const isPending =
    navigation.state !== "idle" && navigation.formAction === "/aps-select"
  const titleId = useId()
  const descriptionId = useId()

  if (loaderData.length <= 0)
    return (
      <Card>
        <CardHeader>
          <CardTitle>{m.aps_select_empty_title()}</CardTitle>
          <CardDescription>{m.aps_select_empty_description()}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post">
            <Button
              className="w-full"
              type="submit"
              name="intent"
              value="signout"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending && (
                <Spinner
                  aria-hidden="true"
                  className="motion-reduce:animate-none"
                />
              )}
              {isPending ? m.aps_select_signout_pending() : m.signout()}
            </Button>
          </Form>
        </CardContent>
      </Card>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle id={titleId}>{m.aps_select_card_title()}</CardTitle>
        <CardDescription id={descriptionId}>
          {m.aps_select_card_description()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <FieldGroup>
            <FieldSet aria-labelledby={titleId}>
              <RadioGroup
                disabled={isPending}
                defaultValue={loaderData[0].ns}
                name="aps"
                aria-labelledby={titleId}
                aria-describedby={descriptionId}
              >
                {loaderData.map(
                  ({ city, country, flag, name, ns, parkingSpaces }) => (
                    <FieldLabel
                      htmlFor={ns}
                      key={ns}
                      className="aps-select-option"
                    >
                      <Field orientation="horizontal">
                        <FieldContent className="min-w-0">
                          <FieldTitle className="block w-full font-semibold break-words">
                            {name}
                          </FieldTitle>
                          <FieldDescription className="break-words">
                            {m.aps_select_location({ city, country, flag })}
                          </FieldDescription>
                          <p className="mt-1 text-xs font-normal text-muted-foreground">
                            <strong className="font-mono font-semibold tabular-nums">
                              {parkingSpaces}
                            </strong>{" "}
                            {m.aps_select_parking_spaces()}
                          </p>
                        </FieldContent>
                        <RadioGroupItem
                          value={ns}
                          id={ns}
                          className="self-center"
                        />
                      </Field>
                    </FieldLabel>
                  )
                )}
              </RadioGroup>
              <Field>
                <Button
                  type="submit"
                  disabled={isPending}
                  aria-busy={isPending}
                >
                  {isPending && (
                    <Spinner
                      aria-hidden="true"
                      className="motion-reduce:animate-none"
                    />
                  )}
                  {isPending ? m.aps_select_confirm_pending() : m.confirm()}
                </Button>
              </Field>
            </FieldSet>
          </FieldGroup>
        </Form>
      </CardContent>
    </Card>
  )
}
