import { betterAuth } from "better-auth/minimal"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { customSession, haveIBeenPwned, twoFactor } from "better-auth/plugins"
// import { aps } from "./aps";
import { findApsByNs } from "./aps.server"
import { db } from "./db.server"
import { roles } from "./roles"
import { sendEmail } from "./email.server"
import { m } from "@paraglide/messages.js"
import type { BetterAuthOptions } from "better-auth"

const options = {
  appName: "Parkbot", // Used as the default issuer for TOTP
  advanced: {
    cookiePrefix: "parkbot",
    trustedProxyHeaders: true,
  },
  baseURL: {
    allowedHosts: [
      "localhost", // allow all localhost ports
      "localhost:*", // allow all localhost ports
      "sotefinservice.com:*", // production domain
    ],
    protocol: "auto", // "https"
    fallback: "https://sotefinservice.com",
  },
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: m.auth_reset_password_subject(),
        text: m.auth_reset_password_text({ url }),
        html: m.auth_reset_password_html({ url }),
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: m.auth_email_verification_subject(),
        text: m.auth_email_verification_text({ url }),
        html: m.auth_email_verification_html({ url }),
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  plugins: [
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
} satisfies BetterAuthOptions

export const auth = betterAuth({
  ...options,
  plugins: [
    customSession(async ({ user, session }) => {
      const aps = user.aps ? await findApsByNs(user.aps) : null
      return { aps, user, session }
    }, options),
    ...options.plugins,
  ],
})
