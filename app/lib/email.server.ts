import { db } from "./db.server";

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const users = db.collection("users");
  const user = await users.findOne({ email });
  return user === null ? true : false;
}
