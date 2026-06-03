import { NextRequest, NextResponse } from "next/server";

// Email is sent from the platform admin's Resend account.
// Set these in Vercel environment variables — owners don't need their own account.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_NAME      = process.env.RESEND_FROM_NAME ?? "PGNest";
const FROM_EMAIL     = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function POST(req: NextRequest) {
  if (!RESEND_API_KEY) {
    // Not configured — silently skip (admin hasn't set up email yet)
    return NextResponse.json({ success: false, reason: "email_not_configured" });
  }

  const { to, subject, html } = await req.json() as {
    to: string;
    subject: string;
    html: string;
  };

  if (!to || !subject || !html) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
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
