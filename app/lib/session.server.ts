import { sha256 } from "@oslojs/crypto/sha2";
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";
import { db } from "./db.server";

const COLLECTION = "sessions";

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20);
  crypto.getRandomValues(tokenBytes);
  const token = encodeBase32LowerCaseNoPadding(tokenBytes).toLowerCase();
  return token;
}

export async function createSession(
  token: string,
  userId: string,
  flags: SessionFlags
): Promise<Session> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 1 month
  const doc = {
    id: sessionId,
    userId,
    expires_at: expiresAt,
    twoFactorVerified: flags.twoFactorVerified,
  };
  const sessions = db.collection(COLLECTION);
  const result = await sessions.insertOne(doc);
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt,
    twoFactorVerified: flags.twoFactorVerified,
  };
  return session;
}

export interface SessionFlags {
  // apsVerified: flags.apsVerified;
  twoFactorVerified: boolean;
}

export interface Session extends SessionFlags {
  id: string;
  // apsId,
  userId: string;
  expiresAt: Date;
}

// type SessionValidationResult =
//   | { session: Session; user: User }
//   | { session: null; user: null };
