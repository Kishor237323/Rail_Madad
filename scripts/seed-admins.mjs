import { config } from 'dotenv'

import { hash } from 'bcryptjs'
import { MongoClient } from 'mongodb'

config({ path: '.env.local' })
config()

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable.')
}

const predefinedAdmins = [
  { username: 'admin1', password: 'password123', role: 'admin' },
  { username: 'admin2', password: 'password123', role: 'admin' },
  { username: 'supervisor', password: 'admin@123', role: 'admin' },
  { username: 'railway_admin', password: 'secure@123', role: 'admin' },
]

const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db('rail_madad')
  const admins = db.collection('admins')

  await admins.createIndex({ username: 1 }, { unique: true })

  for (const admin of predefinedAdmins) {
    const existing = await admins.findOne({ username: admin.username })

    if (existing) {
      console.log(`Skipped existing admin: ${admin.username}`)
      continue
    }

    const hashedPassword = await hash(admin.password, 12)

    await admins.insertOne({
      username: admin.username,
      password: hashedPassword,
      role: admin.role,
      createdAt: new Date(),
    })

    console.log(`Inserted admin: ${admin.username}`)
  }

  console.log('Admin seeding completed.')
} finally {
  await client.close()
}
