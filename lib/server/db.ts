import 'server-only'
import { MongoClient, type Db } from 'mongodb'

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

function getUri(): string {
  const rawUri = process.env.MONGODB_URI?.trim()
  const uri = rawUri?.replace(/^['"]|['"]$/g, '')
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable.')
  }
  return uri
}

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(getUri())
    global._mongoClientPromise = client.connect()
  }
  return global._mongoClientPromise
}

export async function getDatabase(): Promise<Db> {
  try {
    const mongoClient = await getClientPromise()
    return mongoClient.db('rail_madad')
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    throw error
  }
}
