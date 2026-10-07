import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI
if (!uri?.trim()) {
  throw new Error("MONGODB_URI is required")
}

const client = new MongoClient(uri)

export const db = client.db()
