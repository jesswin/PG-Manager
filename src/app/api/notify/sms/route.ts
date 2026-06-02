import { NextRequest, NextResponse } from "next/server";

// Generic HTTP webhook proxy — works with Twilio, MSG91, WATI, or any custom endpoint.
// The client sends the full payload; this route forwards it to the configured webhook URL.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { webhookUrl, apiKey, payload } = body as {
    webhookUrl: string;
    apiKey?: string;
    payload: Record<string, unknown>;
  };

  if (!webhookUrl) {
    return NextResponse.json({ error: "No webhook URL configured" }, { status: 400 });
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  return NextResponse.json({ success: res.ok, status: res.status });
}
