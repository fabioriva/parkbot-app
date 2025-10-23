import { db } from "./db.server";

const COLLECTION = "aps";

export async function getApsFromNs(nsList: string[]): Promise<string[] | null> {
  const aps = db.collection(COLLECTION);
  const apsList = await aps
    .find({ ns: { $in: nsList } }, { projection: { _id: 0 } })
    .toArray();
  if (apsList === null) {
    return null;
  }
  return apsList;
}

export interface Aps {
  id: string; // use mongodb unique ObjectId _id;
  city: string;
  country: string;
  name: string;
  ns: string;
}
