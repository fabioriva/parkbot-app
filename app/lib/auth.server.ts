import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession, haveIBeenPwned, twoFactor } from "better-auth/plugins";
// import { aps } from "./aps";
import { findAps } from "./aps.server";
import { db } from "./db.server";
import { roles } from "./roles";
import { sendEmail } from "./email.server";
import { m } from "@paraglide/messages.js";

export const auth = betterAuth({
  appName: "Parkbot", // Used as the default issuer for TOTP
  advanced: {
    cookiePrefix: "parkbot",
  },
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: m.auth_reset_password_subject(),
        text: m.auth_reset_password_text({ url }),
        html: m.auth_reset_password_html({ url }),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: m.auth_email_verification_subject(),
        text: m.auth_email_verification_text({ url }),
        html: m.auth_email_verification_html({ url }),
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  plugins: [
    customSession(async ({ user, session }) => {
      const aps = await findAps(user.aps);
      return {
        aps, // : aps.find((element) => element.ns === user.aps),
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
        type: Object.keys(roles),
        defaultValue: "service",
        input: true,
        required: true,
      },
    },
  },
});
