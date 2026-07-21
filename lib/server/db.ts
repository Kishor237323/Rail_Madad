import 'server-only'

import { MongoClient, type Db } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable.')
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const client = new MongoClient(uri)
const clientPromise = global._mongoClientPromise ?? client.connect()

if (process.env.NODE_ENV !== 'production') {
  global._mongoClientPromise = clientPromise
}

<<<<<<< HEAD

=======
>>>>>>> fc56a02792718b2e094d5f39d67d549a7a53459e
export async function getDatabase(): Promise<Db> {
  const mongoClient = await clientPromise
  return mongoClient.db('rail_madad')
}
