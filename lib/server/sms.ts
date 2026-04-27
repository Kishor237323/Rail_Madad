import "server-only";

type SendOtpSmsInput = {
  phone: string;
  otp: string;
};

type SendOtpSmsResult = {
  provider: "fast2sms" | "console";
}

async function sendViaFast2Sms(input: SendOtpSmsInput) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    throw new Error("Fast2SMS is not configured. Set FAST2SMS_API_KEY.");
  }

  const requestBody = {
    route: "otp",
    variables_values: input.otp,
    numbers: input.phone,
    flash: 0,
  };

  const attempts: Array<{ method: "POST" | "GET"; url: string; body?: BodyInit }> = [
    {
      method: "POST",
      url: "https://www.fast2sms.com/dev/bulkV2",
      body: JSON.stringify(requestBody),
    },
    {
      method: "GET",
      url: (() => {
        const smsUrl = new URL("https://www.fast2sms.com/dev/bulkV2");
        smsUrl.searchParams.set("authorization", apiKey);
        smsUrl.searchParams.set("route", "otp");
        smsUrl.searchParams.set("variables_values", input.otp);
        smsUrl.searchParams.set("numbers", input.phone);
        smsUrl.searchParams.set("flash", "0");
        return smsUrl.toString();
      })(),
    },
  ];

  let lastError: string | null = null;

  for (const attempt of attempts) {
    const response = await fetch(attempt.url, {
      method: attempt.method,
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: attempt.body,
    });

    const responseText = await response.text();

    if (response.ok) {
      return;
    }

    lastError = `Fast2SMS ${attempt.method} failed (${response.status}): ${responseText}`;
  }

  throw new Error(lastError || "Fast2SMS OTP failed.");
}

export async function sendOtpSms(input: SendOtpSmsInput): Promise<SendOtpSmsResult> {
  const hasFast2SmsConfig = !!process.env.FAST2SMS_API_KEY;

  if (hasFast2SmsConfig) {
    await sendViaFast2Sms(input);
    return { provider: "fast2sms" };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Fast2SMS is not configured. Set FAST2SMS_API_KEY.");
  }

  console.log(`[OTP DEV] Sending OTP ${input.otp} to ${input.phone}`);
  return { provider: "console" };
}