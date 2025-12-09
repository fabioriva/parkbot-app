import { useTranslation } from "react-i18next";
import { Form, redirect } from "react-router";
import { CardWrapper } from "~/components/card-wrapper-auth";
import SubmitFormButton from "~/components/submit-form-button";
import { Field } from "~/components/ui/field";
import {
  deleteSession,
  getSession,
  getSessionCookie,
  setSessionCookie,
} from "~/lib/session.server";
import { getInstance } from "~/middleware/i18next";

import type { Route } from "./+types/logout";

export async function loader({ request }: Route.LoaderArgs) {
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
  const sessionCookie = await getSessionCookie(request);
  const cookie = await setSessionCookie(sessionCookie, {
    maxAge: 0,
  });
  return redirect("/login", { headers: { "Set-Cookie": cookie } });
}

export default function Logout() {
  let { t } = useTranslation();
  return (
    <CardWrapper
      title={t("logout.cardTitle")}
      description={t("logout.cardDescription")}
    >
      <Form method="post">
        <Field>
          <SubmitFormButton action="/logout" title="Logout" />
        </Field>
      </Form>
    </CardWrapper>
  );
}
