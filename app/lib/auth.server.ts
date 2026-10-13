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
import {
  APIError,
  createAuthMiddleware,
  getSessionFromCtx,
} from "better-auth/api"
import { findSubscriptionByEmail } from "./subscription.server"
import { isRole } from "./permissions"

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
    requireEmailVerification: true,
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
        defaultValue: "valet",
        input: false,
        required: true,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const subscription = await findSubscriptionByEmail(user.email)
          if (!subscription || !isRole(subscription.role))
            throw new APIError("FORBIDDEN", {
              message: "No valid subscription",
            })
          const selected = "aps" in user ? user.aps : undefined
          if (
            selected !== undefined &&
            selected !== null &&
            (typeof selected !== "string" ||
              !Array.isArray(subscription.aps) ||
              !subscription.aps.includes(selected) ||
              !(await findApsByNs(selected)))
          )
            throw new APIError("FORBIDDEN", { message: "APS not assigned" })
          return { data: { ...user, role: subscription.role } }
        },
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        if (typeof ctx.body?.email !== "string") return
        const subscription = await findSubscriptionByEmail(ctx.body.email)
        if (!subscription || !isRole(subscription.role))
          throw new APIError("FORBIDDEN", { message: "No valid subscription" })
      }
      if (ctx.path !== "/update-user" || !("aps" in (ctx.body ?? {}))) return
      const session = await getSessionFromCtx(ctx)
      if (!session)
        throw new APIError("UNAUTHORIZED", { message: "Unauthorized" })
      const subscription = await findSubscriptionByEmail(session.user.email)
      if (
        !session.user.emailVerified ||
        (process.env.TWO_FACTOR === "enabled" &&
          !session.user.twoFactorEnabled) ||
        !subscription ||
        !isRole(subscription.role) ||
        typeof ctx.body.aps !== "string" ||
        !Array.isArray(subscription.aps) ||
        !subscription.aps.includes(ctx.body.aps) ||
        !(await findApsByNs(ctx.body.aps))
      )
        throw new APIError("FORBIDDEN", { message: "APS not assigned" })
    }),
  },
} satisfies BetterAuthOptions

export const auth = betterAuth({
  ...options,
  plugins: [
    customSession(async ({ user, session }) => {
      const subscription = await findSubscriptionByEmail(user.email)
      const role =
        subscription && isRole(subscription.role) ? subscription.role : null
      const assignedAps =
        role && Array.isArray(subscription?.aps) ? subscription.aps : []
      const aps =
        user.aps && assignedAps.includes(user.aps)
          ? await findApsByNs(user.aps)
          : null
      return { aps, assignedAps, user: { ...user, role }, session }
    }, options),
    ...options.plugins,
  ],
})
