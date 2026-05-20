import { db } from "./db.server";

const COLLECTION = "subscription";

export interface Subscription {
  _id: ObjectId;
  aps: string[];
  email: string;
  role: string;
  subscribed: boolean;
}

export async function findSubscription(
  email: string,
): Promise<Subscription> | null {
  const subscription = db.collection(COLLECTION);
  const result = await subscription.findOne({ email });
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
