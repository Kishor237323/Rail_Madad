import { config } from "dotenv";

import { hash } from "bcryptjs";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });
config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

const rpfUsers = [
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
    username: "rpf2",
    password: "rpf@123",
    role: "rpf",
    name: "Karthik Rao",
    district: "Bangalore Urban",
    station: "KR Puram",
    mobile: "9012345678",
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db("rail_madad");
  const users = db.collection("users");

  await users.createIndex({ username: 1 }, { unique: true });

  for (const user of rpfUsers) {
    const existing = await users.findOne({ username: user.username });

    if (existing) {
      console.log(`Skipped existing RPF user: ${user.username}`);
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

    console.log(`Inserted RPF user: ${user.username}`);
  }

  console.log("RPF credentials added ✅");
} finally {
  await client.close();
}
