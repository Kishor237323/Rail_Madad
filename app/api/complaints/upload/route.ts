import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const complaintId = formData.get("complaintId") as string;
    const file = formData.get("image") as File;

    if (!complaintId || !file) {
      console.error("[Upload] Missing complaint ID or image file");
      return NextResponse.json(
        { error: "Missing complaint ID or image file" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      console.error(`[Upload] Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    console.log(`[Upload] Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log(`[Upload] Buffer size after conversion: ${buffer.length} bytes (original: ${file.size})`);

    // Get file extension - prefer file extension over mime type
    let ext = file.name.split(".").pop()?.toLowerCase() || file.type.split("/")[1] || "jpg";
    const filename = `${complaintId}_image.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    // Ensure uploads directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    console.log(`[Upload] Saved image to: ${filepath}`);

    // Return the relative path to be stored in DB
    const imagePath = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      imagePath,
      filename,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
