import sgMail from "@sendgrid/mail";
import { db } from "./db.server";

const COLLECTION = "users";

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const users = db.collection(COLLECTION);
  const user = await users.findOne({ email });
  return user === null ? true : false;
}

sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);

export { sgMail };
