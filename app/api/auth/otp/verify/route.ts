import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDatabase } from "@/lib/server/db";

const verifyOtpSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/),
  otp: z.string().trim().regex(/^\d{6}$/),
});

const OTP_MAX_VERIFY_ATTEMPTS = 5;
const OTP_VERIFY_BLOCK_MS = 15 * 60 * 1000;

type OtpRecord = {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  verifyAttempts: number;
  blockedUntil?: Date | null;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid phone number and 6-digit OTP." }, { status: 400 });
    }

    const { phone, otp } = parsed.data;
    const db = await getDatabase();
    const otpCollection = db.collection<OtpRecord>("otp_codes");
    const users = db.collection("users");
    const now = new Date();

    const record = await otpCollection.findOne({ phone });

    if (!record) {
      return NextResponse.json({ error: "OTP not found. Please request a new OTP." }, { status: 400 });
    }

    if (record.blockedUntil && record.blockedUntil > now) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again later." },
        { status: 429 }
      );
    }

    if (record.expiresAt < now) {
      await otpCollection.deleteOne({ phone });
      return NextResponse.json({ error: "OTP expired. Please request a new OTP." }, { status: 400 });
    }

    const isOtpValid = await compare(otp, record.otpHash);

    if (!isOtpValid) {
      const nextAttempts = (record.verifyAttempts ?? 0) + 1;
      const hasExceeded = nextAttempts >= OTP_MAX_VERIFY_ATTEMPTS;

      await otpCollection.updateOne(
        { phone },
        {
          $set: {
            verifyAttempts: nextAttempts,
            blockedUntil: hasExceeded ? new Date(now.getTime() + OTP_VERIFY_BLOCK_MS) : null,
            updatedAt: now,
          },
        }
      );

      if (hasExceeded) {
        return NextResponse.json(
          { error: "Too many invalid attempts. Please request OTP again after 15 minutes." },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: "Invalid OTP. Please try again." }, { status: 400 });
    }

    await otpCollection.deleteOne({ phone });

    await users.updateOne(
      { role: "passenger", mobile: phone },
      {
        $set: {
          mobile: phone,
          role: "passenger",
          lastLoginAt: now,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: "OTP verified. Login successful.",
    });
  } catch (error) {
    console.error("[auth/otp/verify] Failed to verify OTP:", error);
    return NextResponse.json({ error: "Unable to verify OTP right now." }, { status: 500 });
  }
}