import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/server/db";

const categoryMap: Record<string, string> = {
  dirty_toilet: "cleanliness",
  floor_cleanliness: "cleanliness",
  light_not_working: "electrical",
  switch_issue: "electrical",
  socket_issue: "electrical",
  fan_not_working: "electrical",
  tap_issue: "water",
  seat_issue: "infrastructure",
  medical: "medical",
  fire: "security",
  security: "security",
  crowd: "overcrowding",
  "medical emergency": "medical",
  "security emergency": "security",
  "fire emergency": "security",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim().toUpperCase();

    if (!id) {
      return NextResponse.json({ error: "Complaint ID is required." }, { status: 400 });
    }

    const db = await getDatabase();
    const complaint = await db.collection("complaints").findOne<{ [key: string]: unknown }>({ complaintId: id });

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
    }

    const rawCategory = String(complaint.category || "other").toLowerCase();
    const mappedCategory = categoryMap[rawCategory] || "other";
    const rawPriority = String(complaint.priority || "normal").toLowerCase();
    const mappedPriority = rawPriority === "high" ? "high" : "medium";

    return NextResponse.json({
      complaint: {
        id: String(complaint.complaintId || id),
        category: mappedCategory,
        description: String(complaint.description || "No description provided."),
        location: {
          coordinates:
            complaint.location &&
            typeof complaint.location === "object" &&
            "latitude" in (complaint.location as Record<string, unknown>) &&
            "longitude" in (complaint.location as Record<string, unknown>)
              ? {
                  latitude: Number((complaint.location as Record<string, unknown>).latitude),
                  longitude: Number((complaint.location as Record<string, unknown>).longitude),
                }
              : undefined,
          trainNumber:
            complaint.train && typeof complaint.train === "object"
              ? String((complaint.train as Record<string, unknown>).number || "")
              : "",
          coachNumber:
            complaint.train && typeof complaint.train === "object"
              ? String((complaint.train as Record<string, unknown>).coach || "")
              : "",
        },
        timestamp: String(complaint.createdAt || new Date().toISOString()),
        priority: mappedPriority,
        status: String(complaint.status || "pending"),
        assignedTo: Array.isArray(complaint.assignedTo)
          ? complaint.assignedTo.join(", ")
          : complaint.assignedTo
            ? String(complaint.assignedTo)
            : undefined,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch complaint." }, { status: 500 });
  }
}
