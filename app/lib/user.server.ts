import { db } from "./db.server";
import {
  /*decrypt, decryptToString,*/ encrypt,
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
    emailVerified: false,
    username,
    password_hash: passwordHash,
    recovery_code: encryptedRecoveryCode,
    registered2FA: false,
  };
  const result = await users.insertOne(doc);
  const user: User = {
    id: result.insertedId.toString(),
    username,
    email,
    emailVerified: false,
    registered2FA: false,
  };
  return user;
}

export async function getUserFromEmail(email: string): Promise<User> | null {
  const users = db.collection(COLLECTION);
  const user = await users.findOne({ email });
  return user;
}

export interface User {
  id: string; // use mongodb unique ObjectId _id;
  email: string;
  username: string;
  emailVerified: boolean;
  registered2FA: boolean;
}
