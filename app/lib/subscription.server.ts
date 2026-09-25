import type { ObjectId, UpdateResult } from "mongodb"
import { db } from "./db.server"

const COLLECTION = "subscription"

export interface Subscription {
  _id: ObjectId
  aps: string[]
  company: string
  email: string
  role: string
  subscribed: boolean
}

export async function createSubscription(
  subscription: Omit<Subscription, "_id">
) {
  const collection = db.collection<Omit<Subscription, "_id">>(COLLECTION)
  const result = await collection.insertOne({ ...subscription })
  return result
}

export async function deleteSubscriptionByEmail(email: string) {
  const collection = db.collection<Subscription>(COLLECTION)
  const result = await collection.deleteOne({ email })
  return result
}

export async function findSubscriptionByEmail(
  email: string
): Promise<Subscription | null> {
  const subscription = db.collection<Subscription>(COLLECTION)
  const result = await subscription.findOne({ email })
  return result
}

export async function findSubscriptions(): Promise<
  Omit<Subscription, "_id">[]
> {
  const subscription = db.collection<Subscription>(COLLECTION)
  const result = await subscription
    .find<Omit<Subscription, "_id">>({}, { projection: { _id: 0 } })
    .toArray()
  return result
}

export async function subscribeByEmail(
  email: string,
  subscribed: boolean = true
): Promise<UpdateResult<Subscription>> {
  const subscription = db.collection<Subscription>(COLLECTION)
  const result = await subscription.updateOne(
    { email },
    { $set: { subscribed } }
  )
  return result
}

export async function updateSubscriptionByEmail(
  email: string,
  subscription: Omit<Subscription, "_id">
) {
  const collection = db.collection<Subscription>(COLLECTION)
  const result = await collection.updateOne(
    { email },
    { $set: { ...subscription } }
  )
  return result
}
