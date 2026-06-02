import { db } from "./db.server";

const COLLECTION = "aps";

export interface Aps {
  _id: ObjectId;
  city: string;
  company: string;
  country: string;
  flag: string;
  name: string;
  ns: string;
  parkingSpaces: number;
}

export async function createAps(aps: Aps) {
  const collection = db.collection(COLLECTION);
  const result = await collection.insertOne({ ...aps });
  return result;
}

export async function deleteApsByNs(ns: string) {
  const collection = db.collection(COLLECTION);
  const result = await collection.deleteOne({ ns });
  return result;
}

export async function findApsByNs(ns: string): Promise<Aps> | null {
  const aps = db.collection(COLLECTION);
  const result = await aps.findOne({ ns }, { projection: { _id: 0, ns: 0 } });
  return result;
}

export async function findCompaniesFromAps(
  aps: Aps[],
): Promise<string[]> | null {
  const collection = db.collection(COLLECTION);
  const fieldName = "company";
  const result = await collection.distinct(fieldName);
  return result;
}

export async function findSubscribedApsList(
  nsList: string[],
): Promise<Aps[]> | null {
  const aps = db.collection(COLLECTION);
  const result = await aps
    .find(nsList.length > 0 ? { ns: { $in: nsList } } : {})
    .toArray();
  return result;
}
