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
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status payload." }, { status: 400 });
    }

    const db = await getDatabase();
    const updateData: Record<string, unknown> = {
      status: parsed.data.status,
      updatedAt: new Date(),
      resolvedAt: parsed.data.status === "resolved" ? new Date() : null,
    };

    await db.collection("complaints").updateOne(
      { complaintId },
      {
        $set: updateData,
      }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to update complaint status." }, { status: 500 });
  }
}
