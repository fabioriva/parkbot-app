import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export const db = client.db();

export interface Aps {
  _id: ObjectId;
  city: string;
  company: string;
  country: string;
  name: string;
  ns: string;
}

export async function findAps(ns: string): Promise<Aps | null> {
  const aps = db.collection("aps");
  const result = await aps.findOne({ ns }, { projection: { _id: 0, ns: 0 } });
  if (result === null) {
    return null;
  }
  return result;
}

export async function findSubscribedApsList(
  nsList: string[],
): Promise<Aps[] | null> {
  const aps = db.collection("aps");
  const result = await aps
    .find({ ns: { $in: nsList } }) //, { projection: { _id: 0 } })
    .toArray();
  return result;
}

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
  const subscription = db.collection("subscription");
  const result = await subscription.findOne({ email });
  // console.log(result);
  // return result === null ? false : true;
  return result;
}
