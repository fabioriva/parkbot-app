import { MongoClient } from "mongodb";

console.log(import.meta.env.VITE_MONGODB_URI);
console.log(import.meta.env.VITE_MONGODB_DB);

const client = new MongoClient(import.meta.env.VITE_MONGODB_URI);

export const db = client.db(import.meta.env.VITE_MONGODB_DB);
