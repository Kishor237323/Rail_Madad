#!/usr/bin/env node

import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });
config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "rail_madad";

async function resetComplaints() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const complaintsCollection = db.collection("complaints");
    const countBefore = await complaintsCollection.countDocuments();

    if (countBefore === 0) {
      console.log("ℹ️  No complaints found. Nothing to reset.");
      return;
    }

    const result = await complaintsCollection.deleteMany({});

    console.log(`🧹 Deleted ${result.deletedCount} complaint records`);
    console.log("✅ Complaints reset to zero");
  } catch (error) {
    console.error("❌ Reset script error:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

resetComplaints().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});