import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession, haveIBeenPwned, twoFactor } from "better-auth/plugins";
import { aps } from "./aps";
// import { findAps } from "./aps.server";
import { db } from "./db.server";
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
  // ...
  plugins: [
    customSession(async ({ user, session }) => {
      // const aps = await findAps(user.aps);
      return {
        aps: aps.find((element) => element.ns === user.aps),
        user,
        session,
      };
    }),
    haveIBeenPwned(),
    twoFactor({
      skipVerificationOnEnable: false,
    }),
  ],
  user: {
    additionalFields: {
      aps: {
        type: "string",
        input: true,
        required: false, // set to false because selected after signin/up
      },
      role: {
        type: ["admin", "service", "valet"],
        defaultValue: "service",
        input: true,
        required: true,
      },
    },
  },
});
