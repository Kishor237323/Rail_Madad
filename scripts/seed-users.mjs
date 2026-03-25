import { config } from "dotenv";

import { hash } from "bcryptjs";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });
config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const sampleUsers = [
  {
    username: "rpf1",
    password: "rpf@123",
    role: "rpf",
    name: "Ravi Kumar",
    district: "Bangalore Rural",
    station: "Yelahanka Junction",
    mobile: "9876543210",
  },
  {
    username: "station1",
    password: "station@123",
    role: "station_master",
    name: "Suresh Reddy",
    district: "Bangalore Urban",
    station: "KR Puram",
    mobile: "9123456780",
  },
  {
    username: "staff1",
    password: "staff@123",
    role: "railway_staff",
    name: "Anil Kumar",
    district: "Bangalore Urban",
    train_number: "12951",
    mobile: "9988776655",
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("rail_madad");
  const users = db.collection("users");

  await users.createIndex({ username: 1 }, { unique: true });

  for (const user of sampleUsers) {
    const existing = await users.findOne({ username: user.username });

    if (existing) {
      await users.updateOne(
        { username: user.username },
        {
          $set: {
            role: user.role,
            name: user.name,
            district: user.district,
            station: user.station,
            train_number: user.train_number,
            mobile: user.mobile,
            updatedAt: new Date(),
          },
        }
      );

      console.log(`Updated existing user: ${user.username}`);
      continue;
    }

    const hashedPassword = await hash(user.password, 12);

    await users.insertOne({
      username: user.username,
      password: hashedPassword,
      role: user.role,
      name: user.name,
      district: user.district,
      station: user.station,
      train_number: user.train_number,
      mobile: user.mobile,
      createdAt: new Date(),
    });

    console.log(`Inserted user: ${user.username}`);
  }

  console.log("Users inserted ✅");
} finally {
  await client.close();
}
