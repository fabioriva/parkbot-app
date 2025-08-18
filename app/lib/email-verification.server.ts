import { encodeBase32 } from "@oslojs/encoding";
// import { createCookie } from "react-router";
import { db } from "./db.server";
import { generateRandomOTP } from "./random.server";
import sgMail from "@sendgrid/mail";

const COLLECTION = "email_verification_requests";

// export const emailVerificationRequestCookie = createCookie(
//   "__email_verification",
//   {
//     httpOnly: true,
//     // maxAge: 0,
//     path: "/",
//     sameSite: "lax",
//     secrets: [process.env.COOKIE_SIGNATURE],
//     secure: true,
//   }
// );

export async function createEmailVerificationRequest(
  userId: number,
  email: string
): EmailVerificationRequest {
  console.log(userId, email);
  deleteUserEmailVerificationRequest(userId);
  const idBytes = new Uint8Array(20);
  crypto.getRandomValues(idBytes);
  const id = encodeBase32(idBytes).toLowerCase();
  const code = generateRandomOTP();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 1 min = 1000 * 60
  const requests = db.collection(COLLECTION);
  const doc = {
    userId,
    code,
    email,
    expires_at: expiresAt,
  };
  const result = await requests.insertOne(doc);
  const request: EmailVerificationRequest = {
    id: result.insertedId.toString(),
    userId,
    code,
    email,
    expiresAt,
  };
  return request;
}

export async function deleteUserEmailVerificationRequest(userId: string): void {
  const requests = db.collection(COLLECTION);
  await requests.deleteOne({ userId });
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendVerificationEmail(email: string, code: string): void {
  console.log(`To ${email}: Your verification code is ${code}`);
  const msg = {
    to: email,
    from: process.env.SENDGRID_SENDER,
    subject: "Parkbot web service email verification code",
    text: `To ${email}: Your verification code is ${code}`,
    html: `To ${email}: Your verification code is <strong>${code}</strong>`,
  };
  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error(error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
}

export interface EmailVerificationRequest {
  id: string; // use mongodb unique ObjectId _id;
  userId: string;
  code: string;
  email: string;
  expiresAt: Date;
}
