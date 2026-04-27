import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getDatabase } from "@/lib/server/db";
import { sendOtpSms } from "@/lib/server/sms";

const sendOtpSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/),
});

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const SEND_COOLDOWN_MS = 30 * 1000;
const SEND_WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;
const EXPOSE_DEBUG_OTP =
  process.env.NODE_ENV !== "production" && process.env.OTP_EXPOSE_DEBUG_OTP === "true";

type OtpRecord = {
  phone: string;
  otpHash: string;
  expiresAt: Date;
  lastSentAt: Date;
  sendWindowStart: Date;
  sendCount: number;
  verifyAttempts: number;
  blockedUntil?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid 10-digit phone number." }, { status: 400 });
    }

    const { phone } = parsed.data;
    const db = await getDatabase();
    const otpCollection = db.collection<OtpRecord>("otp_codes");
    const now = new Date();

    const existing = await otpCollection.findOne({ phone });

    if (existing?.blockedUntil && existing.blockedUntil > now) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please try again later." },
        { status: 429 }
      );
    }

    if (existing?.lastSentAt) {
      const elapsed = now.getTime() - existing.lastSentAt.getTime();
      if (elapsed < SEND_COOLDOWN_MS) {
        const retryAfter = Math.ceil((SEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${retryAfter} seconds before requesting a new OTP.` },
          { status: 429 }
        );
      }
    }

    const hasActiveWindow =
      existing?.sendWindowStart && now.getTime() - existing.sendWindowStart.getTime() < SEND_WINDOW_MS;

    const nextSendCount = hasActiveWindow ? (existing?.sendCount ?? 0) + 1 : 1;
    if (nextSendCount > MAX_SENDS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please try again in 1 hour." },
        { status: 429 }
      );
    }

    const otp = generateOtp();
    const otpHash = await hash(otp, 10);
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MS);

    await otpCollection.updateOne(
      { phone },
      {
        $set: {
          otpHash,
          expiresAt,
          lastSentAt: now,
          sendWindowStart: hasActiveWindow ? existing?.sendWindowStart ?? now : now,
          sendCount: nextSendCount,
          verifyAttempts: 0,
          blockedUntil: null,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const payload: { success: true; message: string; debugOtp?: string } = {
      success: true,
      message: "OTP sent successfully.",
    };

    try {
      const smsResult = await sendOtpSms({ phone, otp });

      if (smsResult.provider === "console") {
        if (!EXPOSE_DEBUG_OTP) {
          await otpCollection.deleteOne({ phone });
          return NextResponse.json(
            {
              error:
                "SMS provider is not configured. Set FAST2SMS_API_KEY or Twilio credentials (SMS_PROVIDER=twilio), or enable OTP_EXPOSE_DEBUG_OTP=true for local testing.",
            },
            { status: 500 }
          );
        }

        payload.message = "OTP generated in development mode.";
        payload.debugOtp = otp;
      }
    } catch (error) {
      console.error("[auth/otp/send] SMS dispatch failed:", error);
      const smsError = error instanceof Error ? error.message : "SMS delivery failed.";

      if (!EXPOSE_DEBUG_OTP) {
        await otpCollection.deleteOne({ phone });

        if (process.env.NODE_ENV !== "production") {
          return NextResponse.json({ error: smsError }, { status: 500 });
        }

        return NextResponse.json({ error: "Unable to send OTP right now." }, { status: 500 });
      }

      payload.message = "OTP generated. SMS delivery failed in development mode.";
      payload.debugOtp = otp;
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[auth/otp/send] Failed to send OTP:", error);
    return NextResponse.json({ error: "Unable to send OTP right now." }, { status: 500 });
  }
}