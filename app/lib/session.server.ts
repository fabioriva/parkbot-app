import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import * as cookie from "cookie";
import { db } from "./db.server";

import type { User } from "./user.server";

const COLLECTION = "sessions";

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
  console.log(session);
  return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
  const requests = db.collection(COLLECTION);
  await requests.deleteOne({ sessionId });
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
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookie.parse(cookieHeader);
  console.log(cookies);
  const token = cookies?.__session ?? null;
  console.log(token);
  // const token = (await sessionCookie.parse(cookieHeader))?.token ?? null;
  // console.log(token);
  if (token === null) {
    return { session: null, user: null };
  }
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  console.log(sessionId);
  //
  const sessions = db.collection(COLLECTION);
  const result = await sessions
    .aggregate([
      {
        $lookup: {
          from: "users", // The collection to join
          localField: "userId", // Field in the 'orders' collection
          foreignField: "id", // Field in the 'customers' collection
          as: "user", // Alias for the joined data
        },
      },
    ])
    .toArray();
  console.log(result);
  if (result === null) {
    return { session: null, user: null };
  }
  const sessionValidationResult = result.shift();
  const session: Session = {
    id: sessionValidationResult?.id,
    userId: sessionValidationResult?.userId,
    expiresAt: sessionValidationResult?.expiresAt,
    twoFactorVerified: sessionValidationResult?.twoFactorVerified,
  };
  console.log(session);
  const user: User = {
    id: sessionValidationResult.user[0].id,
    email: sessionValidationResult.user[0].email,
    username: sessionValidationResult.user[0].username,
    emailVerified: sessionValidationResult.user[0].emailVerified,
    registered2FA: sessionValidationResult.user[0].registered2FA,
  };
  console.log(user);
  return { session, user };
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
