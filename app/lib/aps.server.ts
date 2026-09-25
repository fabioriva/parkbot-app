import type { ObjectId } from "mongodb"
import { db } from "./db.server"

const COLLECTION = "aps"

export interface Aps {
  _id: ObjectId
  city: string
  company: string
  country: string
  flag: string
  name: string
  ns: string
  parkingSpaces: number
}

export async function createAps(aps: Omit<Aps, "_id">) {
  const collection = db.collection<Omit<Aps, "_id">>(COLLECTION)
  const result = await collection.insertOne({ ...aps })
  return result
}

export async function deleteApsByNs(ns: string) {
  const collection = db.collection<Aps>(COLLECTION)
  const result = await collection.deleteOne({ ns })
  return result
}

export async function findApsByNs(
  ns: string
): Promise<Omit<Aps, "_id" | "ns"> | null> {
  const aps = db.collection<Aps>(COLLECTION)
  const result = await aps.findOne<Omit<Aps, "_id" | "ns">>(
    { ns },
    { projection: { _id: 0, ns: 0 } }
  )
  return result
}

export async function findCompaniesFromAps(
  aps: Aps[]
): Promise<string[]> {
  const collection = db.collection<Aps>(COLLECTION)
  const fieldName = "company"
  const result = await collection.distinct(fieldName)
  return result
}

export async function findSubscribedApsList(
  nsList: string[] | undefined
): Promise<Aps[]> {
  if (nsList === undefined) {
    return []
  }

  const aps = db.collection<Aps>(COLLECTION)
  const result = await aps
    .find(nsList.length > 0 ? { ns: { $in: nsList } } : {})
    .toArray()
  return result
}

export async function updateApsByNs(aps: Omit<Aps, "_id">, ns: string) {
  const collection = db.collection<Aps>(COLLECTION)
  const result = await collection.updateOne({ ns }, { $set: { ...aps } })
  return result
}
