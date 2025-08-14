import { encodeBase32 } from "@oslojs/encoding";
import { createCookie } from "react-router";
import { db } from "./db.server";
import { generateRandomOTP } from "./random.server";

const COLLECTION = "email_verification_requests";

export async function createEmailVerificationRequest(
  userId: number,
  email: string
): EmailVerificationRequest {
  console.log(userId, email);
  deleteUserEmailVerificationRequest(email); // userId);
  const idBytes = new Uint8Array(20);
  crypto.getRandomValues(idBytes);
  const id = encodeBase32(idBytes).toLowerCase();
  const code = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
  const requests = db.collection(COLLECTION);
  const request: EmailVerificationRequest = {
    // id,
    // userId,
    code,
    email,
    expires_at: expiresAt,
  };
  const result = await requests.insertOne(request);
  console.log(result);
  return request;
  // db.prepare(
  //   "INSERT INTO email_verification_request (id, user_id, code, email, expires_at) VALUES (?, ?, ?, ?, ?) RETURNING id"
  // ).run(id, userId, code, email, Math.floor(expiresAt.getTime() / 1000));
}

export async function deleteUserEmailVerificationRequest(email: string): void {
  const requests = db.collection(COLLECTION);
  await requests.deleteOne({ email });
}

export interface EmailVerificationRequest {
  // id: string;
  // userId: number;
  code: string;
  email: string;
  expiresAt: Date;
}
