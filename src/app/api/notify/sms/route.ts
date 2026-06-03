import { NextRequest, NextResponse } from "next/server";

// SMS/WhatsApp webhook is configured by the platform admin — not by individual PG owners.
// Set these in Vercel environment variables.
const SMS_WEBHOOK_URL = process.env.SMS_WEBHOOK_URL;
const SMS_API_KEY     = process.env.SMS_API_KEY;

export async function POST(req: NextRequest) {
  if (!SMS_WEBHOOK_URL) {
    // Not configured — silently skip
    return NextResponse.json({ success: false, reason: "sms_not_configured" });
  }

  const { payload } = await req.json() as { payload: Record<string, unknown> };

  if (!payload) {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }

  const res = await fetch(SMS_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(SMS_API_KEY ? { Authorization: `Bearer ${SMS_API_KEY}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  return NextResponse.json({ success: res.ok, status: res.status });
}
