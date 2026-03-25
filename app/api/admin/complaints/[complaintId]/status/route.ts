import { NextResponse } from "next/server";
import { z } from "zod";

import { getDatabase } from "@/lib/server/db";

const statusSchema = z.object({
  status: z.enum(["pending", "in-progress", "resolved"]),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ complaintId: string }> }
) {
  try {
    const { complaintId } = await context.params;
    const payload = await request.json();
    const parsed = statusSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status payload." }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection("complaints").updateOne(
      { complaintId },
      {
        $set: {
          status: parsed.data.status,
          updatedAt: new Date(),
          resolvedAt: parsed.data.status === "resolved" ? new Date() : null,
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to update status." }, { status: 500 });
  }
}
