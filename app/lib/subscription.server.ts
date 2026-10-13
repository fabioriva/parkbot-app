import { ObjectId, type UpdateResult } from "mongodb"
import { db } from "./db.server"
import { isRole } from "./permissions"

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
  if (!isRole(subscription.role)) throw new Error("Invalid role")
  subscription = {
    ...subscription,
    email: subscription.email.trim().toLowerCase(),
  }
  if (await findSubscriptionByEmail(subscription.email))
    throw new Error("Subscription already exists")
  const collection = db.collection<Omit<Subscription, "_id">>(COLLECTION)
  const result = await collection.insertOne({ ...subscription })
  return result
}

export async function deleteSubscriptionByEmail(email: string) {
  const collection = db.collection<Subscription>(COLLECTION)
  const existing = await findSubscriptionByEmail(email)
  const result = await collection.deleteOne({
    _id: existing?._id ?? new ObjectId(),
  })
  return result
}

export async function findSubscriptionByEmail(
  email: string
): Promise<Subscription | null> {
  const subscription = db.collection<Subscription>(COLLECTION)
  const normalized = email
    .trim()
    .toLowerCase()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const matches = await subscription
    .find({ email: { $regex: `^${normalized}$`, $options: "i" } })
    .limit(2)
    .toArray()
  if (matches.length > 1) throw new Error("Duplicate subscriptions for email")
  return matches[0] ?? null
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
  const existing = await findSubscriptionByEmail(email)
  const result = await subscription.updateOne(
    { _id: existing?._id ?? new ObjectId() },
    { $set: { subscribed } }
  )
  return result
}

export async function updateSubscriptionByEmail(
  email: string,
  subscription: Omit<Subscription, "_id">
) {
  if (!isRole(subscription.role)) throw new Error("Invalid role")
  subscription = {
    ...subscription,
    email: subscription.email.trim().toLowerCase(),
  }
  const collection = db.collection<Subscription>(COLLECTION)
  const existing = await findSubscriptionByEmail(email)
  const result = await collection.updateOne(
    { _id: existing?._id ?? new ObjectId() },
    { $set: { ...subscription } }
  )
  return result
}
