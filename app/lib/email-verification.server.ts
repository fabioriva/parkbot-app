import { encodeBase32 } from "@oslojs/encoding";
import sgMail from "@sendgrid/mail";
import * as cookie from "cookie";
import { db } from "./db.server";
import { generateRandomOTP } from "./random.server";
import { getSession } from "./session.server";

const COLLECTION = "email_verification_requests";

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
  console.log(request);
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
  const request = await requests.findOne(
    { id, userId },
    { projection: { _id: 0 } }
  );
  console.log(userId, id, request);
  return request;
}

export async function getEmailVerificationRequest(
  request: Request
): Promise<EmailVerificationRequest | null> {
  const { user } = await getSession(request);
  if (user === null) {
    return null;
  }
  const cookieHeader = request.headers.get("Cookie");
  const cookies = cookie.parse(cookieHeader);
  console.log(cookies);
  const id = cookies?.__email_verification ?? null;
  console.log(id);
  if (id === null) {
    return null;
  }
  const emailVerificationRequest = await getEmailVerification(user.id, id);
  console.log(emailVerificationRequest);
  // if (emailVerificationRequest === null) {
  // 	deleteEmailVerificationRequestCookie();
  // }
  return emailVerificationRequest;
}

sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);

export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<void> {
  console.log(`To ${email}: Your verification code is ${code}`);
  const msg = {
    to: email,
    from: import.meta.env.VITE_SENDGRID_SENDER,
    subject: "Parkbot web service email verification code",
    text: `To ${email}: Your verification code is ${code}`,
    html: `To ${email}: Your verification code is <strong>${code}</strong>`,
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

export interface EmailVerificationRequest {
  id: string; // use mongodb unique ObjectId _id;
  userId: string;
  code: string;
  email: string;
  expiresAt: Date;
}
