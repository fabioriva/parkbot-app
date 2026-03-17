import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { customSession, haveIBeenPwned, twoFactor } from "better-auth/plugins";
import { db, findAps } from "./db.server";
import { sendEmail } from "./email.server";

export const auth = betterAuth({
  appName: "Parkbot", // Used as the default issuer for TOTP
  advanced: {
    cookiePrefix: "parkbot",
  },
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Automatically sign in the user after sign up
    sendResetPassword: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
        html: `Click the link to reset your password: <a href=${url}>${url}</a>`,
      });
    },
    onExistingUserSignUp: async ({ user }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Sign-up attempt with your email",
        text: "Someone tried to create an account using your email address. If this was you, try signing in instead. If not, you can safely ignore this email.",
        html: "Someone tried to create an account using your email address. If this was you, try signing in instead. If not, you can safely ignore this email.",
      });
    },
    onPasswordReset: async ({ user }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Sign-up attempt with your email",
        text: "Your password has been successfully reset.",
        html: "Your password has been successfully reset.",
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
        html: `Click the link to verify your email: <a href=${url}>${url}</a>`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
  },
  plugins: [
    customSession(async ({ user, session }) => {
      // const roles = findUserRoles(session.session.userId);
      const aps = await findAps(user.aps);
      return {
        aps,
        // roles,
        // user: {
        //   ...user,
        //   newField: "newField",
        // },
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
