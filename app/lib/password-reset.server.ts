import { sha256 } from "@oslojs/crypto/sha2";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { createCookie } from "react-router";
import { db } from "./db.server";
import { sgMail } from "./email.server";
import { generateRandomOTP } from "./random.server";

import type { SerializeOptions as CookieSerializeOptions } from "cookie";
import type { User } from "./user.server";

const COLLECTION = "password_reset_sessions";

export const passwordResetSessionCookieContainer = createCookie(
  "__password_reset_session",
  {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: true,
    secrets: [import.meta.env.VITE_COOKIE_SIGNATURE],
  }
);

export async function getPasswordResetSessionCookie(
  request: Request
): Promise<any> {
  const cookieHeader = request.headers.get("Cookie");
  return (await passwordResetSessionCookieContainer.parse(cookieHeader)) || {};
}

export async function setPasswordResetSessionCookie(
  value: any,
  options?: CookieSerializeOptions
): Promise<string> {
  return await passwordResetSessionCookieContainer.serialize(value, options);
}

export async function createPasswordResetSession(
  token: string,
  userId: number,
  email: string
): PasswordResetSession {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: PasswordResetSession = {
    id: sessionId,
    userId,
    email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    code: generateRandomOTP(),
    emailVerified: false,
    twoFactorVerified: false,
  };
  const sessions = db.collection(COLLECTION);
  await sessions.insertOne(session);
  return session;
}

export async function invalidateUserPasswordResetSessions(
  userId: string
): Promise<void> {
  const requests = db.collection(COLLECTION);
  await requests.deleteOne({ userId });
}

export async function sendPasswordResetEmail(
  email: string,
  code: string
): Promise<void> {
  console.log(`To ${email}: Your reset code is ${code}`);
  const msg = {
    to: email,
    from: import.meta.env.VITE_SENDGRID_SENDER,
    subject: "Parkbot web service password reset code",
    text: `To ${email}: Your password reset code is ${code}`,
    html: `To ${email}: Your password reset code is <strong>${code}</strong>`,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
    // if (error.response) {
    //   console.error(error.response.body);
    // }
  }
}

export interface PasswordResetSession {
  id: string;
  userId: string;
  email: string;
  expiresAt: Date;
  code: string;
  emailVerified: boolean;
  twoFactorVerified: boolean;
}

export type PasswordResetSessionValidationResult =
  | { session: PasswordResetSession; user: User }
  | { session: null; user: null };
