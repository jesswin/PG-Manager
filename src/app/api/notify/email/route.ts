import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { apiKey, to, subject, html, fromName } = body as {
    apiKey: string;
    to: string;
    subject: string;
    html: string;
    fromName?: string;
  };

  if (!apiKey || !to || !subject || !html) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${fromName || "PG Manager"} <onboarding@resend.dev>`,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.message ?? "Failed to send email" }, { status: res.status });
  }
  return NextResponse.json({ success: true, id: data.id });
}
