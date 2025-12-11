import { encodeBase32 } from "@oslojs/encoding";
import { createCookie } from "react-router";
import { db } from "./db.server";
import { sgMail } from "./email.server";
import { generateRandomOTP } from "./random.server";
import { getSession } from "./session.server";

import type { SerializeOptions as CookieSerializeOptions } from "cookie";

const COLLECTION = "email_verification_requests";

export const emailVerificationCookieContainer = createCookie(
  "__pb_email_verification",
  {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [import.meta.env.VITE_COOKIE_SIGNATURE],
    // ...(import.meta.env.PROD
    //   ? { domain: "sotefinservice.com", secure: true }
    //   : {}),
  }
);

export async function getEmailVerificationCookie(
  request: Request
): Promise<any> {
  const cookieHeader = request.headers.get("Cookie");
  return (await emailVerificationCookieContainer.parse(cookieHeader)) || {};
}

export async function setEmailVerificationCookie(
  value: any,
  options?: CookieSerializeOptions
): Promise<string> {
  return await emailVerificationCookieContainer.serialize(value, options);
}

export async function createEmailVerificationRequest(
  userId: string,
  email: string
): Promise<EmailVerificationRequest> {
  deleteUserEmailVerificationRequest(userId);
  const idBytes = new Uint8Array(20);
  crypto.getRandomValues(idBytes);
  const id = encodeBase32(idBytes).toLowerCase();
  const code = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 1 min = 1000 * 60
  const requests = db.collection(COLLECTION);
  const request: EmailVerificationRequest = {
    id,
    userId,
    code,
    email,
    expiresAt,
  };
  await requests.insertOne(request);
  return request;
}

export async function deleteUserEmailVerificationRequest(
  userId: string
): Promise<void> {
  const requests = db.collection(COLLECTION);
  await requests.deleteOne({ userId });
}

export async function getEmailVerification(
  userId: string,
  id: string
): Promise<EmailVerificationRequest | null> {
  const requests = db.collection(COLLECTION);
  const request = await requests.findOne<EmailVerificationRequest>(
    { id, userId },
    { projection: { _id: 0 } }
  );
  if (request === null) {
    return null;
  }
  return request;
}

export async function getEmailVerificationRequest(
  request: Request
): Promise<EmailVerificationRequest | null> {
  const { user } = await getSession(request);
  if (user === null) {
    return null;
  }
  const emailVerificationCookie = await getEmailVerificationCookie(request);
  const id = emailVerificationCookie.id;
  if (id === null) {
    return null;
  }
  const emailVerificationRequest = await getEmailVerification(user.id, id);
  if (emailVerificationRequest === null) {
    await setEmailVerificationCookie(emailVerificationCookie, {
      maxAge: 0,
    });
  }
  return emailVerificationRequest;
}

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  console.log(`To ${email}: Your verification code is ${code}`);
  // const msg = {
  //   to: email,
  //   from: import.meta.env.VITE_SENDGRID_SENDER,
  //   subject: "Parkbot web service email verification code",
  //   text: `To ${email}: Your verification code is ${code}`,
  //   html: `To ${email}: Your verification code is <strong>${code}</strong>`,
  // };
  // try {
  //   await sgMail.send(msg);
  // } catch (error) {
  //   console.error(error);
  //   // if (error.response) {
  //   //   console.error(error.response.body);
  //   // }
  // }
}

export interface EmailVerificationRequest {
  id: string; // use mongodb unique ObjectId _id;
  userId: string;
  code: string;
  email: string;
  expiresAt: Date;
}
