import { hash } from "bcryptjs";
import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDatabase } from "@/lib/server/db";

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    username: z.string().trim().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().min(6).max(128),
    mobile: z.string().trim().regex(/^\d{10}$/),
    role: z.enum(["railway_staff", "rpf", "station_master"]),
    district: z.string().trim().min(2).max(100),
    station: z.string().trim().optional(),
    train_number: z.string().trim().optional(),
  })
  .superRefine((val, ctx) => {
    if ((val.role === "rpf" || val.role === "station_master") && !val.station?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["station"],
        message: "Station is required for selected role.",
      });
    }

    if (val.role === "railway_staff" && !val.train_number?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["train_number"],
        message: "Train Number is required for Railway Staff.",
      });
    }
  });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter valid registration details." }, { status: 400 });
    }

    const data = parsed.data;
    const db = await getDatabase();
    const users = db.collection("users");

    const existing = await users.findOne({ username: data.username });
    if (existing) {
      return NextResponse.json({ error: "Username already exists. Please choose another." }, { status: 409 });
    }

    const hashedPassword = await hash(data.password, 12);

    await users.insertOne({
      username: data.username,
      password: hashedPassword,
      role: data.role,
      name: data.name,
      district: data.district,
      station: data.role === "railway_staff" ? undefined : data.station?.trim() || undefined,
      train_number: data.role === "railway_staff" ? data.train_number?.trim() || undefined : undefined,
      mobile: data.mobile,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please login using your credentials.",
    });
  } catch (error) {
    console.error("[users/register] Registration failed:", error);

    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json({ error: "Username already exists. Please choose another." }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to register user." }, { status: 500 });
  }
}
