import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/server/db";

const categoryMap: Record<string, string> = {
  dirty_toilet: "dirty_toilet",
  floor_cleanliness: "floor_cleanliness",
  light_not_working: "light_not_working",
  switch_issue: "switch_issue",
  socket_issue: "socket_issue",
  fan_not_working: "fan_not_working",
  tap_issue: "tap_issue",
  seat_issue: "seat_issue",
  medical: "medical",
  fire: "fire",
  security: "security",
  crowd: "overcrowding",
  "medical emergency": "medical",
  "security emergency": "security",
  "overcrowding issue": "overcrowding",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode")?.trim().toLowerCase();
    const id = searchParams.get("id")?.trim().toUpperCase();
    const pnr = searchParams.get("pnr")?.trim();
    const phone = searchParams.get("phone")?.trim();

    const query: Record<string, string> = {};

    if (mode === "pnr" && pnr) {
      query.pnr = pnr;
    } else if (mode === "phone" && phone) {
      query.phone = phone;
    } else if (id) {
      query.complaintId = id;
    } else {
      return NextResponse.json({ error: "Complaint ID, PNR, or phone number is required." }, { status: 400 });
    }

    const db = await getDatabase();
    const complaint = await db
      .collection("complaints")
      .find<{ [key: string]: unknown }>(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(1)
      .next();

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found." }, { status: 404 });
    }

    const rawCategory = String(complaint.category || "other").toLowerCase();
    const mappedCategory = categoryMap[rawCategory] || "other";
    const rawPriority = String(complaint.priority || "normal").toLowerCase();
    const mappedPriority = rawPriority === "high" ? "high" : "medium";

    return NextResponse.json({
      complaint: {
        id: String(complaint.complaintId || id || pnr || phone || ""),
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
        pnr: String(complaint.pnr || ""),
        phone: String(complaint.phone || complaint.mobile || ""),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch complaint." }, { status: 500 });
  }
}
