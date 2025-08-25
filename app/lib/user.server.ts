import { Binary, ObjectId } from "mongodb";
import { db } from "./db.server";
import {
  decrypt,
  decryptToString,
  encrypt,
  encryptString,
} from "./encryption.server";
import { hashPassword } from "./password.server";
import { generateRandomRecoveryCode } from "./random.server";

const COLLECTION = "users";

export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const recoveryCode = generateRandomRecoveryCode();
  const encryptedRecoveryCode = encryptString(recoveryCode);
  const users = db.collection(COLLECTION);
  await users.createIndex({ email: 1 }, { unique: true });
  const doc = {
    email,
    username,
    passwordHash,
    recoveryCode: new Binary(encryptedRecoveryCode), // Save the Uint8Array as Binary
    emailVerified: false,
    // registered2FA: false,
  };
  const result = await users.insertOne(doc);
  await users.updateOne(
    { _id: result.insertedId },
    { $set: { id: result.insertedId.toString() } }
  );
  console.log("updated one user:", result);

  const user: User = {
    id: result.insertedId.toString(),
    email,
    username,
    emailVerified: false,
    registered2FA: false,
  };
  console.log("created user:", user);

  return user;
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const users = db.collection(COLLECTION);
  const result = await users.findOne({ email });
  if (result === null) {
    return null;
  }
  const user: User = {
    id: result._id.toString(),
    email, // : result.email,
    username: result.username,
    emailVerified: result.emailVerified,
    registered2FA: result.totpKey ? true : false, // result.registered2FA,
  };
  console.log("getUserFromEmail", user);
  return user;
}

export async function getUserPasswordHash(id: string): Promise<string | null> {
  const users = db.collection(COLLECTION);
  const user = await users.findOne(
    { _id: new ObjectId(id) },
    { projection: { _id: 0, passwordHash: 1 } }
  );
  return user.passwordHash;
}

export async function getUserRecoveryCode(id: string): string {
  const users = db.collection(COLLECTION);
  const user = await users.findOne(
    { id },
    { projection: { recoveryCode: 1, _id: 0 } }
  );
  if (user === null) {
    throw new Error("Invalid user ID");
  }
  return decryptToString(new Uint8Array(user.recoveryCode.buffer)); // Convert the Binary object to a Uint8Array
}

export async function updateUserEmailAndSetEmailAsVerified(
  id: string,
  email: string
): void {
  const users = db.collection(COLLECTION);
  await users.updateOne({ id }, { $set: { email, emailVerified: true } });
}

export async function updateUserTOTPKey(id: string, key: Uint8Array): void {
  const encrypted = encrypt(key);
  const users = db.collection(COLLECTION);
  await users.updateOne({ id }, { $set: { totpKey: new Binary(encrypted) } });
}

export interface User {
  id: string; // use mongodb unique ObjectId _id;
  email: string;
  username: string;
  emailVerified: boolean;
  registered2FA: boolean;
}
