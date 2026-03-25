import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/server/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim();

    const db = await getDatabase();
    const complaintsCollection = db.collection("complaints");

    let complaints = [] as Awaited<ReturnType<typeof complaintsCollection.findOne>>[];

    if (username) {
      complaints = await complaintsCollection
        .find({
          $or: [
            { assignedUsernames: { $in: [username] } },
            { assignedStaffUsername: username },
            { assignedTo: username },
          ],
        })
        .sort({ createdAt: -1 })
        .toArray();
    }

    return NextResponse.json({ complaints });
  } catch {
    return NextResponse.json({ error: "Unable to fetch assigned complaints." }, { status: 500 });
  }
}
