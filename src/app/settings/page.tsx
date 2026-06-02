"use client";

import { useState } from "react";
import { useSettings } from "@/store/SettingsContext";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ToastContainer, useToast } from "@/components/Toast";
import {
  Settings, CreditCard, Eye, EyeOff, CheckCircle2, AlertCircle,
  ExternalLink, Copy, Building2, Zap, Bell, Mail, MessageSquare,
  ToggleLeft, ToggleRight, Link2,
} from "lucide-react";
import Link from "next/link";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";

export default function SettingsPage() {
  const {
    razorpay, updateRazorpay, isRazorpayConfigured,
    notifications, updateNotifications, isEmailConfigured, isSmsConfigured,
  } = useSettings();
  const { toasts, addToast, dismiss } = useToast();

  const [rzpForm, setRzpForm] = useState({ ...razorpay });
  const [notifForm, setNotifForm] = useState({ ...notifications });
  const [showSecret, setShowSecret] = useState(false);
  const [showResendKey, setShowResendKey] = useState(false);
  const [showSmsKey, setShowSmsKey] = useState(false);
  const [rzpSaved, setRzpSaved] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);

  function handleRzpSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (rzpForm.keyId && !rzpForm.keyId.startsWith("rzp_")) {
      addToast("Key ID must start with rzp_test_ or rzp_live_", "error");
      return;
    }
    updateRazorpay(rzpForm);
    setRzpSaved(true);
    addToast("Razorpay settings saved.", "success");
    setTimeout(() => setRzpSaved(false), 3000);
  }

  function handleNotifSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    updateNotifications(notifForm);
    setNotifSaved(true);
    addToast("Notification settings saved.", "success");
    setTimeout(() => setNotifSaved(false), 3000);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard.`, "info");
  }

  const isLive = rzpForm.keyId.startsWith("rzp_live_");
  const isTest = rzpForm.keyId.startsWith("rzp_test_");

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Settings" }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Settings size={20} className="text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Payment gateway, notifications, and business details</p>
        </div>
      </div>

      {/* ── Razorpay form ────────────────────────────────────── */}
      <form onSubmit={handleRzpSave} className="space-y-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <CreditCard size={16} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Razorpay Configuration</h2>
                <p className="text-xs text-gray-500">Connect your Razorpay account to collect payments online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isRazorpayConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 size={11} /> Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                  <AlertCircle size={11} /> Not configured
                </span>
              )}
              {isLive && <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">LIVE</span>}
              {isTest && <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">TEST</span>}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-lg border border-blue-100">
              <AlertCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 space-y-1">
                <p>Get your API keys from the <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="font-semibold underline inline-flex items-center gap-0.5">Razorpay Dashboard <ExternalLink size={10} /></a></p>
                <p>Use <strong>Test keys</strong> (rzp_test_...) for development. Switch to <strong>Live keys</strong> when going live.</p>
                <p className="text-blue-600">Your Key Secret is stored only in your browser and never leaves your device.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Key ID *</label>
                <div className="relative">
                  <input type="text" value={rzpForm.keyId}
                    onChange={(e) => setRzpForm({ ...rzpForm, keyId: e.target.value.trim() })}
                    placeholder="rzp_test_XXXXXXXXXXXX"
                    className={`${inp} ${rzpForm.keyId && !rzpForm.keyId.startsWith("rzp_") ? "border-red-300 focus:ring-red-400" : ""}`} />
                  {rzpForm.keyId && (
                    <button type="button" onClick={() => copyToClipboard(rzpForm.keyId, "Key ID")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <Copy size={13} />
                    </button>
                  )}
                </div>
                {rzpForm.keyId && !rzpForm.keyId.startsWith("rzp_") && (
                  <p className="text-xs text-red-500 mt-1">Must start with rzp_test_ or rzp_live_</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Key Secret</label>
                <div className="relative">
                  <input type={showSecret ? "text" : "password"} value={rzpForm.keySecret}
                    onChange={(e) => setRzpForm({ ...rzpForm, keySecret: e.target.value.trim() })}
                    placeholder="••••••••••••••••••••" className={`${inp} pr-9`} />
                  <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Building2 size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Business Details</h2>
              <p className="text-xs text-gray-500">Shown to tenants on the Razorpay payment screen</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "PG / Business Name", key: "pgName", placeholder: "Sharma PG Accommodations" },
              { label: "Business Legal Name", key: "businessName", placeholder: "Ramesh Agarwal" },
              { label: "Contact Email", key: "businessEmail", placeholder: "payments@yourpg.com", type: "email" },
              { label: "Contact Phone", key: "businessPhone", placeholder: "+91 98765 43210", type: "tel" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
                <input type={type || "text"} value={(rzpForm as any)[key]}
                  onChange={(e) => setRzpForm({ ...rzpForm, [key]: e.target.value })}
                  placeholder={placeholder} className={inp} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Currency</label>
              <select value={rzpForm.currency} onChange={(e) => setRzpForm({ ...rzpForm, currency: e.target.value })} className={inp}>
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit"
            className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${rzpSaved ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            {rzpSaved ? <><CheckCircle2 size={15} /> Saved!</> : "Save Payment Settings"}
          </button>
        </div>
      </form>

      {/* ── Notifications form ───────────────────────────────── */}
      <form onSubmit={handleNotifSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Bell size={16} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Notifications</h2>
                <p className="text-xs text-gray-500">Auto-send rent reminders and notices via email and SMS/WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isEmailConfigured && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  <Mail size={10} /> Email
                </span>
              )}
              {isSmsConfigured && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  <MessageSquare size={10} /> SMS/WA
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Auto-send settings */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-800">Auto-send on app open</p>
                <p className="text-xs text-gray-500 mt-0.5">Automatically notify tenants when rent is due soon (once per 20 hours per tenant)</p>
              </div>
              <button type="button" onClick={() => setNotifForm((f) => ({ ...f, autoSendEnabled: !f.autoSendEnabled }))}>
                {notifForm.autoSendEnabled
                  ? <ToggleRight size={32} className="text-indigo-600" />
                  : <ToggleLeft size={32} className="text-gray-300" />}
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Send reminder this many days before due date</label>
              <div className="flex items-center gap-3">
                <input type="number" min={1} max={14} value={notifForm.daysBeforeDue}
                  onChange={(e) => setNotifForm({ ...notifForm, daysBeforeDue: Number(e.target.value) })}
                  className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800" />
                <span className="text-sm text-gray-500">days before due date</span>
              </div>
            </div>

            {/* Email section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-indigo-500" />
                  <span className="text-sm font-semibold text-gray-800">Email Notifications</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">via Resend</span>
                </div>
                <button type="button" onClick={() => setNotifForm((f) => ({ ...f, emailEnabled: !f.emailEnabled }))}>
                  {notifForm.emailEnabled
                    ? <ToggleRight size={28} className="text-indigo-600" />
                    : <ToggleLeft size={28} className="text-gray-300" />}
                </button>
              </div>

              {notifForm.emailEnabled && (
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-700">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-indigo-500" />
                    <span>
                      Sign up free at{" "}
                      <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline inline-flex items-center gap-0.5">
                        resend.com <ExternalLink size={10} />
                      </a>{" "}
                      → API Keys → Create key. Free tier: 3,000 emails/month.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">Resend API Key *</label>
                      <div className="relative">
                        <input type={showResendKey ? "text" : "password"} value={notifForm.resendApiKey}
                          onChange={(e) => setNotifForm({ ...notifForm, resendApiKey: e.target.value.trim() })}
                          placeholder="re_xxxxxxxxxxxxxxxxxxxx" className={`${inp} pr-9`} />
                        <button type="button" onClick={() => setShowResendKey(!showResendKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showResendKey ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">Stored locally in your browser. Never sent to our servers.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">From Name</label>
                      <input type="text" value={notifForm.fromName}
                        onChange={(e) => setNotifForm({ ...notifForm, fromName: e.target.value })}
                        placeholder="Sunshine PG" className={inp} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SMS / WhatsApp section */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <MessageSquare size={15} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-800">SMS / WhatsApp</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">via Webhook</span>
                </div>
                <button type="button" onClick={() => setNotifForm((f) => ({ ...f, smsEnabled: !f.smsEnabled }))}>
                  {notifForm.smsEnabled
                    ? <ToggleRight size={28} className="text-emerald-600" />
                    : <ToggleLeft size={28} className="text-gray-300" />}
                </button>
              </div>

              {notifForm.smsEnabled && (
                <div className="p-4 space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-xs text-emerald-800">
                    <Link2 size={14} className="shrink-0 mt-0.5 text-emerald-600" />
                    <span>
                      Works with any SMS/WhatsApp provider — <strong>MSG91</strong>, <strong>Twilio</strong>, <strong>WATI</strong>, or a custom endpoint.
                      PG Manager will POST a JSON payload to your webhook URL with tenant info and the message text.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Webhook URL *</label>
                    <input type="url" value={notifForm.smsWebhookUrl}
                      onChange={(e) => setNotifForm({ ...notifForm, smsWebhookUrl: e.target.value.trim() })}
                      placeholder="https://api.msg91.com/api/v5/flow/" className={inp} />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">API Key / Bearer Token</label>
                    <div className="relative">
                      <input type={showSmsKey ? "text" : "password"} value={notifForm.smsApiKey}
                        onChange={(e) => setNotifForm({ ...notifForm, smsApiKey: e.target.value.trim() })}
                        placeholder="Your provider's auth key" className={`${inp} pr-9`} />
                      <button type="button" onClick={() => setShowSmsKey(!showSmsKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showSmsKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-3">
                    <p className="text-[10px] text-gray-400 mb-2 font-semibold uppercase tracking-wide">Payload sent to your webhook</p>
                    <pre className="text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">{`{
  "type": "rent_reminder",      // or "notice"
  "tenant": {
    "name": "Arjun Sharma",
    "phone": "9876543210",
    "roomNumber": "101"
  },
  "message": "Hi Arjun, your rent ...",
  "amount": 8500,
  "month": "Jun 2025",
  "dueDate": "2025-06-01"
}`}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Zap size={14} className="text-indigo-500" /> How Auto-Notifications Work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Bell, title: "Rent Reminders", desc: "When you open PG Manager and rent is due within your configured days, tenants are emailed/SMSd automatically." },
              { icon: Mail, title: "Notice Delivery", desc: "When you send a notice, it's emailed and/or SMSd to the recipient tenant(s) instantly." },
              { icon: CheckCircle2, title: "No Duplicates", desc: "Each tenant is notified at most once every 20 hours per payment, so no spam even if you open the app multiple times." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon size={13} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link href="/payments" className="text-sm text-gray-500 hover:text-gray-700 underline">
            ← Back to Payments
          </Link>
          <button type="submit"
            className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${notifSaved ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            {notifSaved ? <><CheckCircle2 size={15} /> Saved!</> : "Save Notification Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
