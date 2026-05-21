import { MongoClient, ObjectId, type UpdateResult } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export const db = client.db();
