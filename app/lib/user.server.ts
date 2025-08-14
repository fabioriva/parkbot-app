import { db } from "./db.server";
import {
  /*decrypt, decryptToString,*/ encrypt,
  encryptString,
} from "./encryption.server";
import { hashPassword } from "./password.server";
import { generateRandomRecoveryCode } from "./random.server";

export async function createUser(
  email: string,
  username: string,
  password: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const recoveryCode = generateRandomRecoveryCode();
  const encryptedRecoveryCode = encryptString(recoveryCode);
  const users = db.collection("users");
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
  console.log(passwordHash, recoveryCode, encryptedRecoveryCode, result);
  const user: User = {
    id: result.insertedId,
    username,
    email,
    emailVerified: false,
    registered2FA: false,
  };
  return user;
}

export interface User {
  id: number;
  email: string;
  username: string;
  emailVerified: boolean;
  registered2FA: boolean;
}
