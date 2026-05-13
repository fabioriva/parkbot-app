import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { customSession, haveIBeenPwned, twoFactor } from "better-auth/plugins";
import { db, findAps } from "./db.server";
// import { sendEmail } from "./email.server";

export const auth = betterAuth({
  appName: "Parkbot", // Used as the default issuer for TOTP
  advanced: {
    cookiePrefix: "parkbot",
  },
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
});
