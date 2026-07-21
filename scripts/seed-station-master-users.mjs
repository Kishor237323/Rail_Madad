import { config } from "dotenv";

import { hash } from "bcryptjs";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });
config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const stationUsers = [
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
    username: "station2",
    password: "station@123",
    role: "station_master",
    name: "Manjunath Gowda",
    district: "Bangalore Rural",
    station: "Yelahanka Junction",
    mobile: "9345678901",
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("rail_madad");
  const users = db.collection("users");

  await users.createIndex({ username: 1 }, { unique: true });

  for (const user of stationUsers) {
    const existing = await users.findOne({ username: user.username });

    if (existing) {
      console.log(`Skipped existing Station Master user: ${user.username}`);
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
      mobile: user.mobile,
      createdAt: new Date(),
    });

    console.log(`Inserted Station Master user: ${user.username}`);
  }

  console.log("Station Master credentials added ✅");
} finally {
  await client.close();
}
