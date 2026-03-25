import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDatabase } from "@/lib/server/db";

const loginSchema = z.object({
  username: z.string().trim().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(1).max(128),
});

type StationMasterDocument = {
  username: string;
  password: string;
  role: string;
  name?: string;
  district?: string;
  station?: string;
  mobile?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter valid username and password." }, { status: 400 });
    }

    const { username, password } = parsed.data;

    const db = await getDatabase();
    const user = await db
      .collection<StationMasterDocument>("users")
      .findOne({ username, role: "station_master" });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      name: user.name || user.username,
      district: user.district || "",
      station: user.station || "",
      mobile: user.mobile || "",
    });
  } catch {
    return NextResponse.json({ error: "Unable to process login request." }, { status: 500 });
  }
}
