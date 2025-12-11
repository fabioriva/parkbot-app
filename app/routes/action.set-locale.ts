import { redirect } from "react-router";
import { localeCookie, supportedLanguages } from "~/middleware/i18next";
import type { Route } from "./+types/action.set-locale";

export async function action({ request }: Route.ActionArgs) {
  let formData = await request.formData();
  let locale = formData.get("locale");

  // Validate the locale
  if (!locale || !supportedLanguages.includes(locale as any)) {
    locale = "en"; // Fallback to default
  }

  let headers = new Headers();
  headers.append("Set-Cookie", await localeCookie.serialize(locale));
  // Safely redirect back to the referring page or home
  let redirectTo = request.headers.get("Referer") || "/";
  return redirect(redirectTo, { headers });
}
