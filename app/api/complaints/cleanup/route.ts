import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getDatabase } from "@/lib/server/db";

export async function POST(request: Request) {
  try {
    // Verify authorization (you can add auth check here)
    const db = await getDatabase();
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const archiveDir = path.join(process.cwd(), "public", "archive");

    // Calculate 7 days ago
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Find all resolved complaints older than 7 days
    const complaints = await db
      .collection("complaints")
      .find({
        status: "resolved",
        resolvedAt: { $lt: sevenDaysAgo },
        imagePath: { $exists: true, $ne: null },
      })
      .toArray();

    let archivedCount = 0;

    for (const complaint of complaints) {
      if (!complaint.imagePath) continue;

      try {
        // Extract filename from imagePath (e.g., "/uploads/RM123456_image.jpg" -> "RM123456_image.jpg")
        const filename = complaint.imagePath.split("/").pop();
        if (!filename) continue;

        const uploadFilePath = path.join(uploadsDir, filename);
        const archiveFilePath = path.join(archiveDir, filename);

        // Move file from uploads to archive
        try {
          await fs.copyFile(uploadFilePath, archiveFilePath);
          await fs.unlink(uploadFilePath);
        } catch (fileError) {
          console.error(`Failed to move file ${filename}:`, fileError);
          continue;
        }

        // Update database: set imagePath to null and mark as archived
        await db.collection("complaints").updateOne(
          { complaintId: complaint.complaintId },
          {
            $set: {
              imagePath: null,
              imageArchived: true,
              imageArchivedAt: new Date(),
            },
          }
        );

        archivedCount++;
      } catch (error) {
        console.error(`Error processing complaint ${complaint.complaintId}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Archived ${archivedCount} images from resolved complaints older than 7 days.`,
      archivedCount,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to cleanup images" },
      { status: 500 }
    );
  }
}
