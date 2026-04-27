import "server-only";

type SendOtpSmsInput = {
  phone: string;
  otp: string;
};

type SendOtpSmsResult = {
  provider: "fast2sms" | "twilio" | "console";
}

function normalizePhoneNumber(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (phone.startsWith("+")) {
    return phone;
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length > 10) {
    return `+${digits}`;
  }

  return phone;
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

async function sendViaTwilio(input: SendOtpSmsInput) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER.");
  }

  const to = normalizePhoneNumber(input.phone);
  const body = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: `Your Rail Madad OTP is ${input.otp}. It is valid for 5 minutes.`,
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (response.ok) {
    return;
  }

  const responseText = await response.text();
  throw new Error(`Twilio failed (${response.status}): ${responseText}`);
}

export async function sendOtpSms(input: SendOtpSmsInput): Promise<SendOtpSmsResult> {
  const provider = (process.env.SMS_PROVIDER || "auto").trim().toLowerCase();
  const hasFast2SmsConfig = !!process.env.FAST2SMS_API_KEY;
  const hasTwilioConfig =
    !!process.env.TWILIO_ACCOUNT_SID && !!process.env.TWILIO_AUTH_TOKEN && !!process.env.TWILIO_FROM_NUMBER;

  if (provider === "twilio") {
    await sendViaTwilio(input);
    return { provider: "twilio" };
  }

  if (provider === "fast2sms") {
    await sendViaFast2Sms(input);
    return { provider: "fast2sms" };
  }

  if (hasFast2SmsConfig) {
    try {
      await sendViaFast2Sms(input);
      return { provider: "fast2sms" };
    } catch (fast2smsError) {
      if (!hasTwilioConfig) {
        throw fast2smsError;
      }
    }
  }

  if (hasTwilioConfig) {
    await sendViaTwilio(input);
    return { provider: "twilio" };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SMS provider is not configured. Set FAST2SMS_API_KEY or Twilio credentials with SMS_PROVIDER=twilio."
    );
  }

  console.log(`[OTP DEV] Sending OTP ${input.otp} to ${input.phone}`);
  return { provider: "console" };
}