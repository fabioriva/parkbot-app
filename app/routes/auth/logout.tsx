import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import * as cookie from "cookie";
import SubmitFormButton from "~/components/submitFormButton";
import {
  Card,
  CardContent,
  CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  deleteSession,
  getSession,
  // sessionCookie,
} from "~/lib/session.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/logout";

export async function loader({ context, request }: Route.LoaderArgs) {
  let i18n = getInstance(context);
  const { session, user } = await getSession(request);
  if (session === null) {
    return redirect("/login");
  }
  if (!user.emailVerified) {
    return redirect("/verify-email");
  }
  if (!user.registered2FA) {
    return redirect("/2fa/setup");
  }
  if (!session.twoFactorVerified) {
    return redirect("/2fa/authentication");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const { session } = await getSession(request);
  await deleteSession(session?.id);
  const sessionCookie = cookie.serialize("__session", "", {
    maxAge: 0,
  });
  return redirect("/login", {
    headers: {
      "Set-Cookie": sessionCookie,
    },
  });
  // return redirect("/login", {
  //   headers: {
  //     "Set-Cookie": await sessionCookie.serialize(cookie, { maxAge: 0 }),
  //   },
  // });
  // const cookie =
  //   (await sessionCookie.parse(request.headers.get("Cookie"))) || {};
  // return redirect("/login", {
  //   headers: {
  //     "Set-Cookie": await sessionCookie.serialize(cookie, { maxAge: 0 }),
  //   },
  // });
}

export default function Logout({ loaderData }: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{t("logout.cardTitle")}</CardTitle>
        <CardDescription>{t("logout.cardDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post">
          <div className="flex flex-col gap-6">
            <SubmitFormButton action="/logout" title="Logout" />
          </div>
        </Form>
      </CardContent>
      {/* <CardFooter>
        {loaderData ? (
          <p className="text-sm text-red-500">{loaderData.message}</p>
        ) : null}
      </CardFooter> */}
    </Card>
  );
}
