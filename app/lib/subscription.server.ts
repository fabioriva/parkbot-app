import { db } from "./db.server";

const COLLECTION = "subscription";

export interface Subscription {
  _id: ObjectId;
  aps: string[];
  email: string;
  role: string;
  subscribed: boolean;
}

export async function createSubscription(subscription: Subscription) {
  try {
    const collection = db.collection(COLLECTION);
    // await collection.createIndex({ email: 1 }, { unique: true }); // A unique index ensures that the indexed fields do not store duplicate values
    const result = await collection.insertOne({ ...subscription });
    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function findSubscription(
  email: string,
): Promise<Subscription> | null {
  const subscription = db.collection(COLLECTION);
  const result = await subscription.findOne({ email });
  return result;
}

export async function findSubscriptions(
  email: string,
): Promise<Subscription[]> | null {
  const subscription = db.collection(COLLECTION);
  const result = await subscription.find().toArray();
  return result;
}

export async function updateSubscription(
  email: string,
  subscribed: boolean = true,
): Promise<UpdateResult> | null {
  const subscription = db.collection(COLLECTION);
  const result = await subscription.updateOne(
    { email },
    { $set: { subscribed } },
  );
  return result;
}
