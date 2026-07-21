#!/usr/bin/env node

import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });
config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "rail_madad";

function getPassengerUsername(mobile) {
  return `passenger_${mobile}`;
}

async function backfillPassengerUsernames() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const users = db.collection("users");
    const missingUsernameUsers = await users
      .find({
        role: "passenger",
        $or: [{ username: null }, { username: { $exists: false } }],
      })
      .toArray();

    if (missingUsernameUsers.length === 0) {
      console.log("ℹ️  No passenger usernames needed backfill.");
      return;
    }

    for (const user of missingUsernameUsers) {
      if (!user.mobile) {
        console.warn(`⚠️  Skipping passenger ${user._id} because mobile is missing.`);
        continue;
      }

      const username = getPassengerUsername(user.mobile);
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            username,
            updatedAt: new Date(),
          },
        }
      );

      console.log(`📝 Updated passenger ${user._id} -> ${username}`);
    }

    console.log(`✅ Backfilled ${missingUsernameUsers.length} passenger record(s)`);
  } catch (error) {
    console.error("❌ Backfill script error:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

backfillPassengerUsernames().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});