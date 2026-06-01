"use client";

import { useState } from "react";
import { useSettings } from "@/store/SettingsContext";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ToastContainer, useToast } from "@/components/Toast";
import { Settings, CreditCard, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink, Copy, Building2, Zap } from "lucide-react";
import Link from "next/link";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";

export default function SettingsPage() {
  const { razorpay, updateRazorpay, isRazorpayConfigured } = useSettings();
  const { toasts, addToast, dismiss } = useToast();

  const [form, setForm] = useState({ ...razorpay });
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.keyId && !form.keyId.startsWith("rzp_")) {
      addToast("Key ID must start with rzp_test_ or rzp_live_", "error");
      return;
    }
    updateRazorpay(form);
    setSaved(true);
    addToast("Settings saved successfully.", "success" as never);
    setTimeout(() => setSaved(false), 3000);
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    addToast(`${label} copied to clipboard.`, "info");
  }

  const isLive = form.keyId.startsWith("rzp_live_");
  const isTest = form.keyId.startsWith("rzp_test_");

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
          <p className="text-gray-500 text-sm mt-0.5">Configure your payment gateway and business details</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Razorpay Config */}
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
              {isLive && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">LIVE</span>
              )}
              {isTest && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">TEST</span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Info banner */}
            <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-lg border border-blue-100">
              <AlertCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 space-y-1">
                <p>Get your API keys from the <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="font-semibold underline inline-flex items-center gap-0.5">Razorpay Dashboard <ExternalLink size={10} /></a></p>
                <p>Use <strong>Test keys</strong> (rzp_test_...) for development. Switch to <strong>Live keys</strong> (rzp_live_...) when going live.</p>
                <p className="text-blue-600">Your Key Secret is stored only in your browser — it never leaves your device.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Key ID *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.keyId}
                    onChange={(e) => setForm({ ...form, keyId: e.target.value.trim() })}
                    placeholder="rzp_test_XXXXXXXXXXXX"
                    className={`${inp} ${form.keyId && !form.keyId.startsWith("rzp_") ? "border-red-300 focus:ring-red-400" : ""}`}
                  />
                  {form.keyId && (
                    <button type="button" onClick={() => copyToClipboard(form.keyId, "Key ID")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <Copy size={13} />
                    </button>
                  )}
                </div>
                {form.keyId && !form.keyId.startsWith("rzp_") && (
                  <p className="text-xs text-red-500 mt-1">Must start with rzp_test_ or rzp_live_</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Key Secret</label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={form.keySecret}
                    onChange={(e) => setForm({ ...form, keySecret: e.target.value.trim() })}
                    placeholder="••••••••••••••••••••"
                    className={`${inp} pr-9`}
                  />
                  <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Used for server-side signature verification only</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Details */}
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
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">PG / Business Name</label>
              <input type="text" value={form.pgName} onChange={(e) => setForm({ ...form, pgName: e.target.value })} placeholder="e.g. Sharma PG Accommodations" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Business Legal Name</label>
              <input type="text" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder="e.g. Ramesh Agarwal" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Contact Email</label>
              <input type="email" value={form.businessEmail} onChange={(e) => setForm({ ...form, businessEmail: e.target.value })} placeholder="payments@yourpg.com" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Contact Phone</label>
              <input type="tel" value={form.businessPhone} onChange={(e) => setForm({ ...form, businessPhone: e.target.value })} placeholder="+91 98765 43210" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Currency</label>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={inp}>
                <option value="INR">INR — Indian Rupee (₹)</option>
                <option value="USD">USD — US Dollar ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Zap size={14} className="text-indigo-500" /> How Razorpay Collection Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { step: "1", title: "Click Collect", desc: "Hit the \"Collect\" button on any unpaid payment row in the Payments page." },
              { step: "2", title: "Razorpay Checkout", desc: "Tenant's name and amount are pre-filled. They pay via UPI, card, net banking, or wallet." },
              { step: "3", title: "Mark as Paid", desc: "After successful payment, mark the record as Paid. Payment ID is saved for your records." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-indigo-700">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center justify-between">
          <Link href="/payments" className="text-sm text-gray-500 hover:text-gray-700 underline">
            ← Back to Payments
          </Link>
          <button type="submit"
            className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${saved ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            {saved ? <><CheckCircle2 size={15} /> Saved!</> : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
