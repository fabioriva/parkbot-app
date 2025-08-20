import { MongoClient } from "mongodb";

const client = new MongoClient(import.meta.env.VITE_MONGODB_URI);

export const db = client.db(import.meta.env.VITE_MONGODB_DB);
