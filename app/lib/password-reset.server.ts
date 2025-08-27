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

export async function deleteSession(id: string): Promise<void> {
  const requests = db.collection(COLLECTION);
  await requests.deleteOne({ id });
}

export async function getPasswordResetSession(
  request: Request
): Promise<PasswordResetSessionValidationResult> {
  const passwordResetSessionCookie =
    await getPasswordResetSessionCookie(request);
  const token = passwordResetSessionCookie.token;
  console.log("passwordResetSessionCookie:", passwordResetSessionCookie, token);
  if (token === null) {
    return { session: null, user: null };
  }
  // Validate
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const sessions = db.collection(COLLECTION);
  const result = await sessions
    .aggregate([
      { $match: { id: sessionId } }, // Filter documents
      { $limit: 1 },
      {
        $lookup: {
          from: "users", // The collection to join
          localField: "userId", // Field in the 'sessions' collection
          foreignField: "id", // Field in the 'users' collection
          as: "user", // Alias for the joined data
        },
      },
    ])
    .toArray();
  if (result.length === 0) {
    return { session: null, user: null };
  }
  const sessionValidationResult = result.shift();
  const sessionValidationUser = sessionValidationResult?.user.shift();
  console.log(
    "Password reset session validation result:",
    sessionValidationResult
  );
  console.log("Password reset session validation user:", sessionValidationUser);
  const session: PasswordResetSession = {
    id: sessionValidationResult?.id,
    userId: sessionValidationResult?.userId,
    email: sessionValidationResult?.email,
    code: sessionValidationResult?.code,
    expiresAt: sessionValidationResult?.expiresAt,
    emailVerified: sessionValidationResult?.emailVerified,
    twoFactorVerified: sessionValidationResult?.twoFactorVerified,
  };
  console.log("session:", session);
  const user: User = {
    id: sessionValidationUser?.id,
    email: sessionValidationUser?.email,
    username: sessionValidationUser?.username,
    emailVerified: sessionValidationUser?.emailVerified,
    registered2FA: sessionValidationUser?.totpKey ? true : false,
  };
  console.log("user:", user);
  if (Date.now() >= session.expiresAt.getTime()) {
    await deleteSession(session.id);
    return { session: null, user: null };
  }
  return { session, user };
}

export async function invalidateUserPasswordResetSessions(
  userId: string
): Promise<void> {
  const requests = db.collection(COLLECTION);
  await requests.deleteOne({ userId });
}

export async function setPasswordResetSessionAsEmailVerified(id: string): void {
  // db.execute("UPDATE password_reset_session SET email_verified = 1 WHERE id = ?", [sessionId]);
  const sessions = db.collection(COLLECTION);
  await sessions.updateOne({ id }, { $set: { emailVerified: true } });
}

export async function setPasswordResetSessionAs2FAVerified(id: string): void {
  // db.execute("UPDATE password_reset_session SET two_factor_verified = 1 WHERE id = ?", [sessionId]);
  const sessions = db.collection(COLLECTION);
  await sessions.updateOne({ id }, { $set: { twoFactorVerified: true } });
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
