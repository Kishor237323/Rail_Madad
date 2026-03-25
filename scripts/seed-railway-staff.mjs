import { config } from 'dotenv'

import { hash } from 'bcryptjs'
import { MongoClient } from 'mongodb'

config({ path: '.env.local' })
config()

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Missing MONGODB_URI environment variable.')
}

const predefinedRailwayStaff = [
  {
    username: 'staff_s5',
    password: 'staff@123',
    role: 'railway_staff',
    coach: 'S5',
    train_number: '22435',
    name: 'Anil Kumar',
    district: 'Bangalore Urban',
    mobile: '9988776655',
  },
  {
    username: 'staff_b2',
    password: 'staff@123',
    role: 'railway_staff',
    coach: 'B2',
    train_number: '12951',
    name: 'Mahesh Bhat',
    district: 'Bangalore Rural',
    mobile: '9876501234',
  },
  {
    username: 'attendant_c3',
    password: 'coach@123',
    role: 'railway_staff',
    coach: 'C3',
    train_number: '22435',
    name: 'Raghu N',
    district: 'Bangalore Urban',
    mobile: '9787654321',
  },
  {
    username: 'guard_d1',
    password: 'secure@123',
    role: 'railway_staff',
    coach: 'D1',
    train_number: '12951',
    name: 'Prakash Rao',
    district: 'Bangalore Rural',
    mobile: '9898989898',
  },
]

const client = new MongoClient(uri)

try {
  await client.connect()
  const db = client.db('rail_madad')
  const staffCollection = db.collection('users')

  await staffCollection.createIndex({ username: 1 }, { unique: true })

  for (const staff of predefinedRailwayStaff) {
    const existing = await staffCollection.findOne({ username: staff.username })

    if (existing) {
      await staffCollection.updateOne(
        { username: staff.username },
        {
          $set: {
            role: staff.role,
            coach: staff.coach,
            train_number: staff.train_number,
            name: staff.name,
            district: staff.district,
            mobile: staff.mobile,
            updatedAt: new Date(),
          },
        }
      )

      console.log(`Updated existing staff: ${staff.username}`)
      continue
    }

    const hashedPassword = await hash(staff.password, 12)

    await staffCollection.insertOne({
      username: staff.username,
      password: hashedPassword,
      role: staff.role,
      coach: staff.coach,
      train_number: staff.train_number,
      name: staff.name,
      district: staff.district,
      mobile: staff.mobile,
      createdAt: new Date(),
    })

    console.log(`Inserted staff: ${staff.username}`)
  }

  console.log('Railway staff seeding completed.')
} finally {
  await client.close()
}
