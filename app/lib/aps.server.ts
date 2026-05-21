import { db } from "./db.server";
import type { Aps } from "./aps";

const COLLECTION = "aps";

export async function findAps(ns: string): Promise<Aps> | null {
  const aps = db.collection(COLLECTION);
  const result = await aps.findOne({ ns }, { projection: { _id: 0, ns: 0 } });
  if (result === null) {
    return null;
  }
  return result;
}

export async function findSubscribedApsList(
  nsList: string[],
): Promise<Aps[]> | null {
  const aps = db.collection(COLLECTION);
  const result = await aps
    .find({ ns: { $in: nsList } }) //, { projection: { _id: 0 } })
    .toArray();
  return result;
}
