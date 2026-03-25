import { NextResponse } from "next/server";

import { getDatabase } from "@/lib/server/db";

type UserProfileDocument = {
  username: string;
  role: "rpf" | "station_master" | "railway_staff";
  name?: string;
  district?: string;
  station?: string;
  train_number?: string;
  mobile?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username")?.trim();

    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    const db = await getDatabase();
    const user = await db.collection<UserProfileDocument>("users").findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      profile: {
        username: user.username,
        role: user.role,
        name: user.name || user.username,
        district: user.district || "",
        station: user.station || "",
        train_number: user.train_number || "",
        mobile: user.mobile || "",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch user profile." }, { status: 500 });
  }
}
