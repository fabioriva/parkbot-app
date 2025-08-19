import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import * as cookie from "cookie";
import { db } from "./db.server";

const COLLECTION = "sessions";

export async function createSession(
  token: string,
  userId: string,
  flags: SessionFlags
): Promise<Session> {
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

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
  return token;
}

export async function getSession(request: Request): SessionValidationResult {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookie.parse(cookieHeader);
  console.log(cookies, cookies.__session);
  const token = cookies?.__session ?? null;
  console.log(token);
  if (token === null) {
    return { session: null, user: null };
  }
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  console.log(sessionId);

  // const token = (await sessionCookie.parse(cookieHeader))?.token ?? null;
  // console.log(token);
  // const token = (await sessionCookie.parse(cookieHeader))?.token ?? null;
  // const result = validateSessionToken(token);
  // console.log("From getSession()", result);
  // return result;
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

// type SessionValidationResult =
//   | { session: Session; user: User }
//   | { session: null; user: null };
