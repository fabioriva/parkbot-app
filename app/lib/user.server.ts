import { db } from "./db.server";

const COLLECTION = "user";

export interface User {
  id: string; // ObjectId;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  aps: string;
}

export async function findUsers(): Promise<User[]> | null {
  const result = await db
    .collection(COLLECTION)
    .aggregate([
      {
        $addFields: {
          id: { $toString: "$_id" },
        },
      },
      {
        $project: {
          _id: 0, // hide original ObjectId
        },
      },
      { $sort: { email: 1 } },
    ])
    .toArray();
  return result;
}

export async function deleteUserByEmail(email: string) {
  const collection = db.collection(COLLECTION);
  const result = await collection.deleteOne({ email });
  return result;
}
