import { redirect } from "react-router";
import type { Route } from "./+types/api.set-locale";
import { localeCookie } from "~/middleware/i18next";

const SUPPORTED_LOCALES = ["en", "it", "fr"] as const;

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();
  let locale = formData.get("locale");

  // Validate the locale
  if (!locale || !SUPPORTED_LOCALES.includes(locale as any)) {
    locale = "en"; // Fallback to default
  }

  let headers = new Headers();
  headers.append("Set-Cookie", await localeCookie.serialize(locale));
  // console.log(headers);
  // Safely redirect back to the referring page or home
  let redirectTo = request.headers.get("Referer") || "/";
  // console.log(redirectTo);
  return redirect(redirectTo, { headers });
}
