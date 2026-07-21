#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "rail_madad";

async function cleanupImages() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(DB_NAME);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const archiveDir = path.join(process.cwd(), "public", "archive");

    // Calculate 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find all resolved complaints older than 7 days with images
    const complaints = await db
      .collection("complaints")
      .find({
        status: "resolved",
        resolvedAt: { $lt: sevenDaysAgo },
        imagePath: { $exists: true, $ne: null },
      })
      .toArray();

    console.log(`📦 Found ${complaints.length} complaints to archive`);

    let archivedCount = 0;
    let errorCount = 0;

    for (const complaint of complaints) {
      if (!complaint.imagePath) continue;

      try {
        // Extract filename from imagePath (e.g., "/uploads/RM123456_image.jpg" -> "RM123456_image.jpg")
        const filename = complaint.imagePath.split("/").pop();
        if (!filename) {
          console.warn(`⚠️  Could not extract filename from: ${complaint.imagePath}`);
          continue;
        }

        const uploadFilePath = path.join(uploadsDir, filename);
        const archiveFilePath = path.join(archiveDir, filename);

        try {
          // Copy file to archive
          await fs.copyFile(uploadFilePath, archiveFilePath);
          console.log(`📦 Archived: ${filename}`);

          // Delete from uploads
          await fs.unlink(uploadFilePath);
          console.log(`🗑️  Deleted: ${filename}`);
        } catch (fileError) {
          console.error(`❌ Failed to move file ${filename}:`, fileError);
          errorCount++;
          continue;
        }

        // Update database
        const result = await db.collection("complaints").updateOne(
          { complaintId: complaint.complaintId },
          {
            $set: {
              imagePath: null,
              imageArchived: true,
              imageArchivedAt: new Date(),
            },
          }
        );

        if (result.modifiedCount > 0) {
          console.log(`📝 Updated DB for complaint: ${complaint.complaintId}`);
          archivedCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing complaint ${complaint.complaintId}:`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ Cleanup Complete!`);
    console.log(`   📦 Archived: ${archivedCount} complaints`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Errors: ${errorCount}`);
    }
  } catch (error) {
    console.error("❌ Cleanup script error:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

// Run cleanup
cleanupImages().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
