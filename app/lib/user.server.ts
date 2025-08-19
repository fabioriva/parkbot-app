import { db } from "./db.server";
import { ObjectId } from "mongodb";
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
    username,
    passwordHash,
    recoveryCode: encryptedRecoveryCode,
    emailVerified: false,
    registered2FA: false,
  };
  const result = await users.insertOne(doc);
  const user: User = {
    id: result.insertedId.toString(),
    email,
    username,
    emailVerified: false,
    registered2FA: false,
  };
  console.log(user);

  return user;
}

export async function getUserFromEmail(email: string): Promise<User> | null {
  const users = db.collection(COLLECTION);
  const result = await users.findOne({ email });
  const user: User = {
    id: result._id.toString(),
    email, // : result.email,
    username: result.username,
    emailVerified: result.emailVerified,
    registered2FA: result.registered2FA,
  };
  // console.log(user);
  return user;
}

export async function getUserPasswordHash(id: string): Promise<string> | null {
  const users = db.collection(COLLECTION);
  const result = await users.findOne(
    { _id: new ObjectId(id) },
    { projection: { _id: 0, passwordHash: 1 } }
  );
  // console.log(id, result);
  return result.passwordHash;
}

export interface User {
  id: string; // use mongodb unique ObjectId _id;
  email: string;
  username: string;
  emailVerified: boolean;
  registered2FA: boolean;
}
