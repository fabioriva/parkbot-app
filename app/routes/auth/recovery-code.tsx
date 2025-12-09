import { CopyIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect } from "react-router";
import { CardWrapper } from "~/components/card-wrapper-auth";
import { Button } from "~/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "~/components/ui/card";
// import { Input } from "~/components/ui/input";
// import { Label } from "~/components/ui/label";
import { getSession } from "~/lib/session.server";
import { getUserRecoveryCode } from "~/lib/user.server";

import type { Route } from "./+types/recovery-code";

export async function loader({ context, request }: Route.LoaderArgs) {
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
    return redirect("/2fa(authentication");
  }
  const recoveryCode = await getUserRecoveryCode(user.id);
  return { recoveryCode };
}

export default function RecoveryCode({
  actionData,
  loaderData,
}: Route.ComponentProps) {
  let { t } = useTranslation();
  return (
    <CardWrapper
      title={t("recoveryCode.cardTitle")}
      description={t("recoveryCode.cardDescription")}
    >
      <div className="relative bg-gray-800 text-white rounded-lg p-8">
        <pre className="overflow-x-auto">
          <code>{loaderData.recoveryCode}</code>
        </pre>
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 size-8 bg-gray-700 hover:bg-gray-600"
          onClick={() => navigator.clipboard.writeText(loaderData.recoveryCode)}
        >
          <CopyIcon />
        </Button>
      </div>
      <p className="mt-3 text-sm">{t("recoveryCode.cardContent")}.</p>
      <p className="mt-6 text-sm">
        <a className="underline underline-offset-4" href="/select-aps">
          {t("recoveryCode.nextLink")}
        </a>
      </p>
    </CardWrapper>
  );
  // return (
  //   <Card>
  //     <CardHeader>
  //       <CardTitle>{t("recoveryCode.cardTitle")}</CardTitle>
  //       <CardDescription>{t("recoveryCode.cardDescription")} </CardDescription>
  //     </CardHeader>
  //     <CardContent>
  //       <div className="relative bg-gray-800 text-white rounded-lg p-8">
  //         <pre className="overflow-x-auto">
  //           <code>{loaderData.recoveryCode}</code>
  //         </pre>
  //         <Button
  //           variant="secondary"
  //           size="icon"
  //           className="absolute top-2 right-2 size-8 bg-gray-700 hover:bg-gray-600"
  //           onClick={() =>
  //             navigator.clipboard.writeText(loaderData.recoveryCode)
  //           }
  //         >
  //           <CopyIcon />
  //         </Button>
  //       </div>
  //       <p className="mt-3 text-sm">{t("recoveryCode.cardContent")}.</p>
  //     </CardContent>
  //     <CardFooter>
  //       {loaderData ? (
  //         <p className="text-sm text-red-500">{loaderData.message}</p>
  //       ) : null}
  //       <div className="text-sm">
  //         <a
  //           className="underline underline-offset-4"
  //           href="/aps/test/dashboard"
  //         >
  //           {t("recoveryCode.nextLink")}
  //         </a>
  //       </div>
  //     </CardFooter>
  //   </Card>
  // );
}
