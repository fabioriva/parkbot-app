import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { createCookie } from "react-router";
import { db } from "./db.server";

import type { SerializeOptions as CookieSerializeOptions } from "cookie";
import type { User } from "./user.server";

const COLLECTION = "sessions";

export const sessionCookieContainer = createCookie("__session", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: true,
  secrets: [import.meta.env.VITE_COOKIE_SIGNATURE],
});

export async function getSessionCookie(request: Request): Promise<any> {
  const cookieHeader = request.headers.get("Cookie");
  return (await sessionCookieContainer.parse(cookieHeader)) || {};
}

export async function setSessionCookie(
  value: any,
  options?: CookieSerializeOptions
): Promise<string> {
  return await sessionCookieContainer.serialize(value, options);
}

export async function createSession(
  token: string,
  userId: string,
  flags: SessionFlags
): Promise<Session | null> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 1 month
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt,
    twoFactorVerified: flags.twoFactorVerified,
  };
  const sessions = db.collection(COLLECTION);
  await sessions.insertOne(session);
  return session;
}

export async function deleteSession(id: string): Promise<void> {
  const requests = db.collection(COLLECTION);
  await requests.deleteOne({ id });
}

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
  return token;
}

export async function getSession(
  request: Request
): Promise<SessionValidationResult> {
  const sessionCookie = await getSessionCookie(request);
  const token = sessionCookie.token;
  console.log("sessionCookie:", sessionCookie, token);
  if (token === null) {
    return { session: null, user: null };
  }
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
  console.log("Session validation result:", sessionValidationResult);
  console.log("Session validation user:", sessionValidationUser);
  const session: Session = {
    id: sessionValidationResult?.id,
    userId: sessionValidationResult?.userId,
    expiresAt: sessionValidationResult?.expiresAt,
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
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await db
      .collection(COLLECTION)
      .updateOne(
        { id: session.id },
        { $set: { expiresAt: Math.floor(session.expiresAt.getTime() / 1000) } }
      );
  }
  return { session, user };
}

export async function invalidateUserSessions(userId: string): Promise<void> {
  const requests = db.collection(COLLECTION);
  await requests.deleteMany({ userId });
}

export async function setSessionAs2FAVerified(id: string): Promise<void> {
  const sessions = db.collection(COLLECTION);
  await sessions.updateOne({ id }, { $set: { twoFactorVerified: true } });
}

export interface SessionFlags {
  // apsVerified: flags.apsVerified;
  twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
  // apsId: number,
  id: string;
  userId: string;
  expiresAt: Date;
}

type SessionValidationResult =
  | { session: Session; user: User }
  | { session: null; user: null };
