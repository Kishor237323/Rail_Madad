import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  context: { params: Promise<{ complaintId: string }> }
) {
  try {
    const { complaintId } = await context.params;

    if (!complaintId || !complaintId.startsWith("RM")) {
      return NextResponse.json({ error: "Invalid complaint ID" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const archiveDir = path.join(process.cwd(), "public", "archive");

    // Try to find image in uploads first, then archive
    const imagePatterns = [
      path.join(uploadsDir, `${complaintId}_image.jpg`),
      path.join(uploadsDir, `${complaintId}_image.jpeg`),
      path.join(uploadsDir, `${complaintId}_image.png`),
      path.join(uploadsDir, `${complaintId}_image.webp`),
      path.join(archiveDir, `${complaintId}_image.jpg`),
      path.join(archiveDir, `${complaintId}_image.jpeg`),
      path.join(archiveDir, `${complaintId}_image.png`),
      path.join(archiveDir, `${complaintId}_image.webp`),
    ];

    let fileBuffer: Buffer | null = null;
    let mimeType = "image/jpeg";

    for (const imagePath of imagePatterns) {
      try {
        await stat(imagePath);
        fileBuffer = await readFile(imagePath);
        
        // Determine MIME type
        if (imagePath.includes(".png")) mimeType = "image/png";
        else if (imagePath.includes(".webp")) mimeType = "image/webp";
        else if (imagePath.includes(".jpeg")) mimeType = "image/jpeg";
        
        break;
      } catch {
        continue;
      }
    }

    if (!fileBuffer) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Return image with appropriate headers
    const response = new NextResponse(Buffer.from(fileBuffer));
    response.headers.set("Content-Type", mimeType);
    response.headers.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
    response.headers.set("Content-Disposition", `inline; filename="${complaintId}_image"`);

    return response;
  } catch (error) {
    console.error("Image serving error:", error);
    return NextResponse.json({ error: "Failed to retrieve image" }, { status: 500 });
  }
}
