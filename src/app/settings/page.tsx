"use client";

import { useState } from "react";
import { useSettings } from "@/store/SettingsContext";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ToastContainer, useToast } from "@/components/Toast";
import {
  Settings, CheckCircle2, Bell, DoorOpen, Plus, X as XIcon,
  Smartphone, ToggleLeft, ToggleRight, Info, Zap,
} from "lucide-react";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";

export default function SettingsPage() {
  const {
    upi, updateUpi, isUpiConfigured,
    notifPrefs, updateNotifPrefs,
    floors, roomTypes, addFloor, removeFloor, addRoomType, removeRoomType,
  } = useSettings();
  const { toasts, addToast, dismiss } = useToast();

  const [upiForm, setUpiForm] = useState({ ...upi });
  const [upiSaved, setUpiSaved] = useState(false);
  const [newFloor, setNewFloor] = useState("");
  const [newRoomType, setNewRoomType] = useState("");

  function handleUpiSave(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    updateUpi({ ...upiForm, enabled: upiForm.upiId.includes("@") });
    setUpiSaved(true);
    addToast("UPI settings saved.", "success");
    setTimeout(() => setUpiSaved(false), 3000);
  }

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
          <p className="text-gray-500 text-sm mt-0.5">UPI payments, notifications, and room configuration</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── UPI Payment Settings ─────────────────────────────── */}
        <form onSubmit={handleUpiSave}>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Smartphone size={16} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-800">UPI Payment</h2>
                  <p className="text-xs text-gray-500">Tenants pay directly to your UPI ID via GPay, PhonePe, Paytm, etc.</p>
                </div>
              </div>
              {isUpiConfigured && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 size={11} /> Configured
                </span>
              )}
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3 p-3.5 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-700">
                <Info size={14} className="shrink-0 mt-0.5 text-blue-500" />
                <span>
                  No account setup needed. Just enter your UPI ID (e.g. <strong>9876543210@paytm</strong> or <strong>yourbusiness@icici</strong>).
                  Tenants will be sent a payment link that opens any UPI app directly.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">UPI ID *</label>
                  <input
                    required
                    type="text"
                    value={upiForm.upiId}
                    onChange={(e) => setUpiForm({ ...upiForm, upiId: e.target.value.trim() })}
                    placeholder="9876543210@paytm"
                    className={inp}
                  />
                  {upiForm.upiId && !upiForm.upiId.includes("@") && (
                    <p className="text-xs text-red-500 mt-1">UPI ID must contain @  (e.g. number@paytm)</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Display Name (shown to tenants)</label>
                  <input
                    type="text"
                    value={upiForm.upiName}
                    onChange={(e) => setUpiForm({ ...upiForm, upiName: e.target.value })}
                    placeholder="Sunshine PG"
                    className={inp}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">How it works</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-500">
                  {[
                    { n: "1", t: "Reminder sent", d: "WhatsApp message includes a payment link" },
                    { n: "2", t: "Tenant taps link", d: "Opens a payment page in their browser" },
                    { n: "3", t: "UPI app opens", d: "Amount pre-filled; tenant confirms and pays" },
                  ].map(({ n, t, d }) => (
                    <div key={n} className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</div>
                      <div><p className="font-semibold text-gray-700">{t}</p><p>{d}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 flex justify-end">
              <button type="submit"
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm ${upiSaved ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                {upiSaved ? <><CheckCircle2 size={15} /> Saved!</> : "Save UPI Settings"}
              </button>
            </div>
          </div>
        </form>

        {/* ── Notification Preferences ──────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Bell size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Notifications</h2>
              <p className="text-xs text-gray-500">Emails and SMS are sent from the platform — managed by the admin</p>
            </div>
          </div>
          <div className="p-5 space-y-5">
            {/* Admin managed note */}
            <div className="flex items-start gap-3 p-3.5 bg-purple-50 rounded-lg border border-purple-100 text-xs text-purple-700">
              <Zap size={14} className="shrink-0 mt-0.5 text-purple-500" fill="currentColor" />
              <span>
                Email and SMS/WhatsApp notifications are set up centrally by the PG Manager team. You don&apos;t need any API keys. Just control <strong>when</strong> reminders go out below.
              </span>
            </div>

            {/* Auto-send toggle */}
            <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <p className="text-sm font-semibold text-gray-800">Auto-send reminders on app open</p>
                <p className="text-xs text-gray-500 mt-0.5">Automatically notify tenants when rent is due soon (once per 20h per tenant)</p>
              </div>
              <button type="button" onClick={() => updateNotifPrefs({ autoSendEnabled: !notifPrefs.autoSendEnabled })}>
                {notifPrefs.autoSendEnabled
                  ? <ToggleRight size={32} className="text-indigo-600" />
                  : <ToggleLeft size={32} className="text-gray-300" />}
              </button>
            </div>

            {/* Days before due */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Send reminder this many days before due date</label>
              <div className="flex items-center gap-3">
                <input
                  type="number" min={1} max={14}
                  value={notifPrefs.daysBeforeDue}
                  onChange={(e) => updateNotifPrefs({ daysBeforeDue: Number(e.target.value) })}
                  className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
                />
                <span className="text-sm text-gray-500">days before due date</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Room Configuration ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <DoorOpen size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Room Configuration</h2>
              <p className="text-xs text-gray-500">Define your floors and room types — used in the Add/Edit Room form</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Floors */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-3">Floors</p>
              <div className="space-y-2 mb-3">
                {floors.map((f) => (
                  <div key={f} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-800">{f}</span>
                    <button onClick={() => removeFloor(f)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={`${inp} flex-1`} placeholder="e.g. Basement, Terrace…"
                  value={newFloor} onChange={(e) => setNewFloor(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newFloor.trim()) { addFloor(newFloor.trim()); setNewFloor(""); } } }} />
                <button type="button" onClick={() => { if (newFloor.trim()) { addFloor(newFloor.trim()); setNewFloor(""); } }}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>

            {/* Room Types */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-3">Room Types</p>
              <div className="space-y-2 mb-3">
                {roomTypes.map((t) => (
                  <div key={t} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-sm text-gray-800">{t}</span>
                    <button onClick={() => removeRoomType(t)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                      <XIcon size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={`${inp} flex-1`} placeholder="e.g. Deluxe AC, Suite…"
                  value={newRoomType} onChange={(e) => setNewRoomType(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newRoomType.trim()) { addRoomType(newRoomType.trim()); setNewRoomType(""); } } }} />
                <button type="button" onClick={() => { if (newRoomType.trim()) { addRoomType(newRoomType.trim()); setNewRoomType(""); } }}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus size={13} /> Add
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
