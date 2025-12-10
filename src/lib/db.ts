import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI. Add it to your environment.");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const client = new MongoClient(uri);
const clientPromise =
  global._mongoClientPromise ?? (global._mongoClientPromise = client.connect());

let cachedDb: Db | null = null;

export async function getDb() {
  if (cachedDb) return cachedDb;
  const connectedClient = await clientPromise;
  cachedDb = connectedClient.db();
  return cachedDb;
}

export async function getMongoClient() {
  return clientPromise;
}

export default clientPromise;
