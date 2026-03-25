import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/server/db";

type ComplaintStatus = "pending" | "in-progress" | "resolved";

const normalizeStatus = (status: unknown): ComplaintStatus => {
  const value = String(status || "pending").toLowerCase();
  if (value === "resolved") return "resolved";
  if (value === "in progress" || value === "in-progress") return "in-progress";
  return "pending";
};

const isEmergencyCategory = (category: unknown) => {
  const value = String(category || "").toLowerCase();
  return value === "medical" || value === "fire";
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim();

    const db = await getDatabase();
    const query = username
      ? {
          $or: [
            { assignedUsernames: { $in: [username] } },
            { assignedTo: { $in: [username] } },
            { assignedTo: username },
          ],
        }
      : {
          $or: [{ assignedTo: { $in: ["Station Master"] } }, { assignedTo: "Station Master" }],
        };

    const complaints = await db.collection("complaints").find(query).sort({ createdAt: -1 }).toArray();

    const normalized = complaints
      .filter((complaint) => isEmergencyCategory(complaint.category))
      .map((complaint) => ({
        complaintId: String(complaint.complaintId || ""),
        category: String(complaint.category || "others"),
        description: String(complaint.description || "No description provided."),
        status: normalizeStatus(complaint.status),
        priority: String(complaint.priority || "normal"),
        train:
          complaint.train && typeof complaint.train === "object"
            ? {
                name: String((complaint.train as Record<string, unknown>).name || ""),
                number: String((complaint.train as Record<string, unknown>).number || ""),
                coach: String((complaint.train as Record<string, unknown>).coach || ""),
              }
            : undefined,
        location:
          complaint.location && typeof complaint.location === "object"
            ? {
                latitude: Number((complaint.location as Record<string, unknown>).latitude),
                longitude: Number((complaint.location as Record<string, unknown>).longitude),
              }
            : undefined,
        createdAt: complaint.createdAt ? new Date(complaint.createdAt as string).toISOString() : new Date().toISOString(),
      }));

    const stats = {
      total: normalized.length,
      pending: normalized.filter((item) => item.status === "pending").length,
      inProgress: normalized.filter((item) => item.status === "in-progress").length,
      resolved: normalized.filter((item) => item.status === "resolved").length,
    };

    return NextResponse.json({
      ...stats,
      in_progress: stats.inProgress,
      complaints: normalized,
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch Station Master complaints." }, { status: 500 });
  }
}
