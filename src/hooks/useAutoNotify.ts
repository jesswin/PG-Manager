"use client";

import { useEffect, useRef, useState } from "react";
import { useApp } from "@/store/AppContext";
import { useSettings } from "@/store/SettingsContext";
import { useOnboarding } from "@/store/OnboardingContext";

const SENT_KEY = "pgm_notify_sent"; // localStorage: { [pgId+tenantId+month]: isoDate }

function buildRentHtml(
  tenantName: string,
  roomNumber: string,
  amount: number,
  month: string,
  dueDate: string,
  pgName: string,
  payLink?: string
) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px">
        <h1 style="color:#fff;font-size:20px;margin:0;font-weight:700">Rent Due Reminder</h1>
        <p style="color:#c7d2fe;margin:6px 0 0;font-size:13px">${pgName}</p>
      </div>
      <div style="padding:28px 32px">
        <p style="font-size:15px;color:#374151;margin:0 0 20px">Hi <strong>${tenantName}</strong>,</p>
        <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6">
          This is a friendly reminder that your rent is due soon.
        </p>
        <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:0 0 20px">
          <table style="width:100%;font-size:13px;color:#374151">
            <tr><td style="padding:4px 0;color:#9ca3af">Room</td><td style="text-align:right;font-weight:600">${roomNumber}</td></tr>
            <tr><td style="padding:4px 0;color:#9ca3af">Month</td><td style="text-align:right;font-weight:600">${month}</td></tr>
            <tr><td style="padding:4px 0;color:#9ca3af">Amount</td><td style="text-align:right;font-weight:700;color:#4f46e5;font-size:16px">₹${amount.toLocaleString("en-IN")}</td></tr>
            <tr><td style="padding:4px 0;color:#9ca3af">Due Date</td><td style="text-align:right;font-weight:600;color:#ef4444">${dueDate}</td></tr>
          </table>
        </div>
        ${payLink ? `<a href="${payLink}" style="display:block;text-align:center;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:0 0 20px">Pay Now →</a>` : ""}
        <p style="font-size:12px;color:#9ca3af;margin:0">Please ignore if payment has already been made. Thank you!</p>
      </div>
    </div>
  `;
}

function buildSmsText(tenantName: string, roomNumber: string, amount: number, month: string, dueDate: string, pgName: string) {
  return `Hi ${tenantName}, your rent of ₹${amount.toLocaleString("en-IN")} for Room ${roomNumber} (${month}) is due on ${dueDate}. Please pay on time. - ${pgName}`;
}

// Returns a dedup key for a given payment so we don't spam the same tenant
function dedupKey(pgId: string, tenantId: string, month: string) {
  return `${pgId}::${tenantId}::${month}`;
}

function getSentMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(SENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function markSent(key: string) {
  try {
    const map = getSentMap();
    map[key] = new Date().toISOString();
    localStorage.setItem(SENT_KEY, JSON.stringify(map));
  } catch {}
}

function wasSentWithin(key: string, hours: number) {
  const map = getSentMap();
  const ts = map[key];
  if (!ts) return false;
  return (Date.now() - new Date(ts).getTime()) < hours * 3_600_000;
}

export interface AutoNotifyResult {
  ran: boolean;
  sent: number;
  errors: string[];
}

export function useAutoNotify(enabled: boolean): AutoNotifyResult {
  const { payments, tenants } = useApp();
  const { notifications, isEmailConfigured, isSmsConfigured } = useSettings();
  const { activePgId, activePg } = useOnboarding();
  const [result, setResult] = useState<AutoNotifyResult>({ ran: false, sent: 0, errors: [] });
  const hasRun = useRef(false);

  useEffect(() => {
    if (!enabled || hasRun.current) return;
    if (!isEmailConfigured && !isSmsConfigured) return;
    if (!notifications.autoSendEnabled) return;

    hasRun.current = true;

    async function run() {
      const today = new Date();
      const cutoff = new Date(today);
      cutoff.setDate(today.getDate() + (notifications.daysBeforeDue ?? 3));

      const due = payments.filter((p) => {
        if (p.status === "Paid") return false;
        const d = new Date(p.dueDate);
        return d <= cutoff;
      });

      const pgName = activePg?.name || "PG Manager";
      let sent = 0;
      const errors: string[] = [];

      for (const payment of due) {
        const key = dedupKey(activePgId, payment.tenantId, payment.month);
        if (wasSentWithin(key, 20)) continue; // don't re-send within 20h

        const tenant = tenants.find((t) => t.id === payment.tenantId);
        if (!tenant) continue;

        const promises: Promise<unknown>[] = [];

        if (isEmailConfigured && tenant.email) {
          const html = buildRentHtml(tenant.name, tenant.roomNumber, payment.amount, payment.month, payment.dueDate, pgName);
          promises.push(
            fetch("/api/notify/email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                apiKey: notifications.resendApiKey,
                to: tenant.email,
                subject: `Rent Due Reminder – Room ${tenant.roomNumber} – ${payment.month}`,
                html,
                fromName: notifications.fromName || pgName,
              }),
            }).then(async (r) => {
              if (!r.ok) {
                const d = await r.json();
                errors.push(`Email to ${tenant.name}: ${d.error}`);
              }
            }).catch((e) => { errors.push(`Email to ${tenant.name}: ${e.message}`); })
          );
        }

        if (isSmsConfigured) {
          const message = buildSmsText(tenant.name, tenant.roomNumber, payment.amount, payment.month, payment.dueDate, pgName);
          promises.push(
            fetch("/api/notify/sms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                webhookUrl: notifications.smsWebhookUrl,
                apiKey: notifications.smsApiKey || undefined,
                payload: {
                  type: "rent_reminder",
                  tenant: { name: tenant.name, phone: tenant.phone, email: tenant.email, roomNumber: tenant.roomNumber },
                  message,
                  amount: payment.amount,
                  month: payment.month,
                  dueDate: payment.dueDate,
                  pgName,
                },
              }),
            }).then(async (r) => {
              if (!r.ok) errors.push(`SMS to ${tenant.name}: webhook returned ${r.status}`);
            }).catch((e) => errors.push(`SMS to ${tenant.name}: ${e.message}`))
          );
        }

        await Promise.all(promises);
        markSent(key);
        sent++;
      }

      setResult({ ran: true, sent, errors });
    }

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return result;
}

// ── Standalone helpers (used by notices page) ─────────────────────────────────

export async function sendNoticeEmail(opts: {
  apiKey: string;
  fromName: string;
  to: string;
  tenantName: string;
  title: string;
  message: string;
  pgName: string;
}) {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
      <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px">
        <h1 style="color:#fff;font-size:20px;margin:0;font-weight:700">${opts.title}</h1>
        <p style="color:#c7d2fe;margin:6px 0 0;font-size:13px">${opts.pgName} – Notice</p>
      </div>
      <div style="padding:28px 32px">
        <p style="font-size:15px;color:#374151;margin:0 0 16px">Hi <strong>${opts.tenantName}</strong>,</p>
        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 20px;white-space:pre-wrap">${opts.message}</p>
        <p style="font-size:12px;color:#9ca3af;margin:0">— ${opts.pgName}</p>
      </div>
    </div>
  `;

  return fetch("/api/notify/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey: opts.apiKey,
      to: opts.to,
      subject: `[Notice] ${opts.title}`,
      html,
      fromName: opts.fromName || opts.pgName,
    }),
  });
}

export async function sendNoticeSms(opts: {
  webhookUrl: string;
  apiKey?: string;
  tenantPhone: string;
  tenantName: string;
  title: string;
  message: string;
  pgName: string;
}) {
  const smsText = `[${opts.pgName}] ${opts.title}: ${opts.message.slice(0, 130)}`;
  return fetch("/api/notify/sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      webhookUrl: opts.webhookUrl,
      apiKey: opts.apiKey,
      payload: {
        type: "notice",
        tenant: { phone: opts.tenantPhone, name: opts.tenantName },
        message: smsText,
        title: opts.title,
        pgName: opts.pgName,
      },
    }),
  });
}
