"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Building2, ChevronLeft, ChevronRight, CheckCircle2,
  MessageCircle, CreditCard, Users, DoorOpen, Bell, Zap,
  ArrowRight, TrendingUp, AlertCircle, Star, Maximize2,
} from "lucide-react";

// ─── Slide data ───────────────────────────────────────────────────────────────

const SLIDES = [
  { id: "title" },
  { id: "problem" },
  { id: "solution" },
  { id: "dashboard" },
  { id: "reminders" },
  { id: "payments" },
  { id: "tenants" },
  { id: "multiPg" },
  { id: "pricing" },
  { id: "cta" },
] as const;

type SlideId = typeof SLIDES[number]["id"];

// ─── Main component ───────────────────────────────────────────────────────────

export default function SlidesPage() {
  const [current, setCurrent] = useState(0);
  const total = SLIDES.length;

  const prev = useCallback(() => setCurrent((c) => Math.max(0, c - 1)), []);
  const next = useCallback(() => setCurrent((c) => Math.min(total - 1, c + 1)), [total]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")                    { e.preventDefault(); prev(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  const slide = SLIDES[current].id as SlideId;

  return (
    <div className="h-screen bg-gray-900 flex flex-col select-none overflow-hidden">
      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-gray-950 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <Building2 size={13} className="text-white" />
          </div>
          <span className="text-xs font-bold text-white">PG Manager</span>
          <span className="text-gray-600 text-xs ml-2">Presentation</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{current + 1} / {total}</span>
          <Link href="/demo" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">← Back to site</Link>
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <SlideContent id={slide} />
      </div>

      {/* Bottom nav */}
      <div className="shrink-0 flex items-center justify-between px-6 py-3 bg-gray-950 border-t border-gray-800">
        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? "w-6 h-2 bg-indigo-500" : "w-2 h-2 bg-gray-700 hover:bg-gray-500"}`}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-2">
          <button onClick={prev} disabled={current === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft size={14} /> Prev
          </button>
          {current < total - 1 ? (
            <button onClick={next}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <Link href="/demo"
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
              Try Demo <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Individual slides ────────────────────────────────────────────────────────

function SlideContent({ id }: { id: SlideId }) {
  switch (id) {
    case "title":    return <TitleSlide />;
    case "problem":  return <ProblemSlide />;
    case "solution": return <SolutionSlide />;
    case "dashboard": return <DashboardSlide />;
    case "reminders": return <RemindersSlide />;
    case "payments":  return <PaymentsSlide />;
    case "tenants":   return <TenantsSlide />;
    case "multiPg":   return <MultiPgSlide />;
    case "pricing":   return <PricingSlide />;
    case "cta":       return <CtaSlide />;
  }
}

// ─── Slide 1: Title ───────────────────────────────────────────────────────────
function TitleSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 px-8 text-center">
      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 ring-2 ring-white/20">
        <Building2 size={34} className="text-white" />
      </div>
      <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 tracking-tight">
        PG Manager
      </h1>
      <p className="text-xl sm:text-2xl text-indigo-200 font-medium mb-10 max-w-xl">
        Smart PG Management for Modern Owners
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {["Tenants", "Rooms", "Payments", "Reminders", "Notices"].map((tag) => (
          <span key={tag} className="px-4 py-1.5 bg-white/10 text-white text-sm font-semibold rounded-full border border-white/20">
            {tag}
          </span>
        ))}
      </div>
      <p className="text-indigo-400 text-sm mt-12">Use ← → arrow keys to navigate</p>
    </div>
  );
}

// ─── Slide 2: Problem ─────────────────────────────────────────────────────────
function ProblemSlide() {
  const pains = [
    { icon: "📱", text: "Calling tenants one by one every month for rent" },
    { icon: "📊", text: "Maintaining error-prone Excel sheets" },
    { icon: "🏠", text: "No real-time view of room occupancy" },
    { icon: "💸", text: "Cash-only collection — no digital payment option" },
    { icon: "📄", text: "Manually writing and distributing notices" },
    { icon: "🔍", text: "Losing track of ID proofs and tenant documents" },
  ];
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 px-8">
      <div className="max-w-3xl w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">The Daily PG Owner Struggle</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pains.map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 p-4 rounded-xl bg-gray-800/60 border border-gray-700">
              <span className="text-2xl shrink-0">{icon}</span>
              <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Slide 3: Solution ────────────────────────────────────────────────────────
function SolutionSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-950 px-8">
      <div className="max-w-3xl w-full text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 text-indigo-300 text-sm font-semibold rounded-full mb-8 border border-indigo-500/30">
          <Zap size={13} fill="currentColor" /> Introducing PG Manager
        </div>
        <h2 className="text-4xl font-extrabold text-white mb-4">
          One Dashboard.<br />
          <span className="text-indigo-400">Every Problem Solved.</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          From tenant onboarding to automated rent collection — everything your PG needs in one place.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Tenant Mgmt", color: "text-indigo-400 bg-indigo-500/10" },
            { icon: MessageCircle, label: "Auto Reminders", color: "text-emerald-400 bg-emerald-500/10" },
            { icon: CreditCard, label: "Online Payments", color: "text-blue-400 bg-blue-500/10" },
            { icon: Bell, label: "Notices", color: "text-purple-400 bg-purple-500/10" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`p-4 rounded-xl border border-gray-700 flex flex-col items-center gap-3`}>
              <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={20} />
              </div>
              <span className="text-white text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Slide 4: Dashboard ───────────────────────────────────────────────────────
function DashboardSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 px-8 gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-white mb-2">Real-Time Dashboard</h2>
        <p className="text-gray-400">Everything at a glance — occupancy, rent, activity, and alerts</p>
      </div>
      {/* Mock dashboard */}
      <div className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs text-gray-400">pgmanager.app/dashboard</span>
        </div>
        <div className="p-4 bg-gray-50">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { v: "12", l: "Tenants", c: "text-indigo-600 bg-indigo-50" },
              { v: "16", l: "Rooms",   c: "text-purple-600 bg-purple-50" },
              { v: "75%", l: "Occupied", c: "text-emerald-600 bg-emerald-50" },
              { v: "₹24K", l: "Pending", c: "text-red-500 bg-red-50" },
            ].map(({ v, l, c }) => (
              <div key={l} className="bg-white rounded-lg border border-gray-100 p-3 text-center shadow-sm">
                <p className={`text-lg font-extrabold ${c.split(" ")[0]}`}>{v}</p>
                <p className="text-xs text-gray-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-700">Rent Reminders</p>
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">3 due soon</span>
            </div>
            {[
              { n: "Priya Nair", r: "102", amt: "₹8,500", d: "2d overdue", color: "text-red-500" },
              { n: "Divya Reddy", r: "204", amt: "₹9,500", d: "Due today", color: "text-amber-500" },
              { n: "Ananya Singh", r: "304", amt: "₹9,000", d: "Due in 2d", color: "text-amber-400" },
            ].map(({ n, r, amt, d, color }) => (
              <div key={n} className="flex items-center gap-3 px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-bold text-indigo-700">{n.split(" ").map(w => w[0]).join("")}</span>
                </div>
                <span className="flex-1 text-xs text-gray-800">{n} · Rm {r}</span>
                <span className="text-xs font-semibold text-gray-700">{amt}</span>
                <span className={`text-[10px] font-semibold ${color}`}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 5: Reminders ───────────────────────────────────────────────────────
function RemindersSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-950 to-gray-900 px-8">
      <div className="max-w-3xl w-full flex flex-col sm:flex-row items-center gap-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full mb-5 border border-emerald-500/30">
            <MessageCircle size={11} /> Auto Reminders
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Zero Effort.<br />
            <span className="text-emerald-400">100% On-Time Rent.</span>
          </h2>
          <ul className="space-y-3">
            {[
              "Automatically detects rent due in 1–14 days",
              "Sends WhatsApp messages with payment links",
              "Emails tenants directly from your account",
              "Deduplication: no spam — once per 20 hours per tenant",
              "Bulk-send all reminders in one click (Quarterly plan)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" /> {item}
              </li>
            ))}
          </ul>
        </div>
        {/* WhatsApp mockup */}
        <div className="w-64 bg-[#1a1a2e] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden shrink-0">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#075e54]">
            <div className="w-7 h-7 rounded-full bg-indigo-300 flex items-center justify-center text-xs font-bold text-indigo-900">PN</div>
            <div>
              <p className="text-white text-xs font-semibold">Priya Nair</p>
              <p className="text-green-200 text-[10px]">online</p>
            </div>
          </div>
          <div className="p-3 space-y-2">
            <div className="bg-[#005c4b] rounded-xl rounded-tl-sm px-3 py-2 max-w-[90%]">
              <p className="text-white text-[11px] leading-relaxed">
                Hi Priya! 🏠 Your rent of <span className="font-bold">₹8,500</span> for Room 102 is due on <span className="font-bold">1 Jun</span>.<br /><br />
                Pay now 👇<br />
                <span className="text-blue-300 underline">pgmanager.app/pay?...</span>
              </p>
              <p className="text-green-300 text-[9px] text-right mt-1">✓✓ 10:30 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 6: Payments ────────────────────────────────────────────────────────
function PaymentsSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 to-gray-900 px-8">
      <div className="max-w-3xl w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-semibold rounded-full mb-6 border border-blue-500/30">
          <CreditCard size={11} /> Online Payments
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Collect Rent Online<br />
          <span className="text-blue-400">via UPI, Card & Net Banking</span>
        </h2>
        <p className="text-gray-400 mb-8 text-base">
          Integrate Razorpay in under 2 minutes. Send payment links via WhatsApp — tenants pay in one tap.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "UPI", icon: "📱", sub: "GPay, PhonePe, Paytm" },
            { label: "Card", icon: "💳", sub: "Debit & Credit Cards" },
            { label: "Net Banking", icon: "🏦", sub: "All major banks" },
            { label: "Wallet", icon: "👛", sub: "Paytm & more" },
          ].map(({ label, icon, sub }) => (
            <div key={label} className="p-4 rounded-xl bg-gray-800/60 border border-gray-700 text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <p className="text-white text-sm font-semibold">{label}</p>
              <p className="text-gray-500 text-[10px] mt-1">{sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 bg-blue-900/40 rounded-xl border border-blue-700/50">
          <Zap size={14} className="text-blue-400" />
          <span className="text-blue-200 text-sm">Tenants get a payment link directly in their WhatsApp — no app download needed</span>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 7: Tenant Management ───────────────────────────────────────────────
function TenantsSlide() {
  const fields = [
    "Full name, phone, email", "Room & rent amount", "Move-in date",
    "Rent due day (custom)", "Amenities included", "Security deposit & advance",
    "ID proof (Aadhar/Passport)", "Emergency contact", "Food preference & notes",
  ];
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 px-8">
      <div className="max-w-3xl w-full flex flex-col sm:flex-row items-start gap-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-full mb-5 border border-indigo-500/30">
            <Users size={11} /> Tenant Profiles
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Complete Digital<br />
            <span className="text-indigo-400">Tenant Profiles</span>
          </h2>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed">
            Every tenant gets a full profile with 9 sections — everything you need for a PG, in one form.
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {fields.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                <CheckCircle2 size={13} className="text-indigo-400 shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-indigo-600 px-4 py-3">
              <p className="text-white text-xs font-bold">Add New Tenant</p>
            </div>
            {["👤 Personal Info", "🏠 Accommodation", "✨ Amenities", "💰 Financial", "🪪 ID Proof", "🆘 Emergency", "🥗 Preferences"].map((s) => (
              <div key={s} className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                <span className="text-xs text-gray-600">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 8: Multi-PG ────────────────────────────────────────────────────────
function MultiPgSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-950 to-gray-900 px-8">
      <div className="max-w-3xl w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-full mb-6 border border-purple-500/30">
          <Building2 size={11} /> Multi-PG Support
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Own Multiple PGs?<br />
          <span className="text-purple-400">One Account Handles All.</span>
        </h2>
        <p className="text-gray-400 mb-8 text-base max-w-lg mx-auto">
          Add unlimited PG properties. Each has its own rooms, tenants, and payment history. Switch in one click from the sidebar.
        </p>
        {/* PG switcher mockup */}
        <div className="inline-flex flex-col w-64 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mx-auto text-left">
          <div className="px-3 py-2 border-b border-gray-700 bg-gray-750">
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide">Your Properties</p>
          </div>
          {[
            { name: "Sunshine PG", city: "Bangalore", active: true },
            { name: "Green Hostel", city: "Pune", active: false },
            { name: "Kumar Residency", city: "Hyderabad", active: false },
          ].map(({ name, city, active }) => (
            <div key={name} className={`flex items-center justify-between px-3 py-2.5 ${active ? "bg-indigo-600/30 border-l-2 border-indigo-500" : "hover:bg-gray-700"}`}>
              <div>
                <p className={`text-xs font-semibold ${active ? "text-white" : "text-gray-300"}`}>{name}</p>
                <p className="text-[10px] text-gray-500">{city}</p>
              </div>
              {active && <div className="w-2 h-2 rounded-full bg-indigo-400" />}
            </div>
          ))}
          <div className="px-3 py-2 border-t border-gray-700 text-indigo-400 text-xs font-medium">
            + Add new PG
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 9: Pricing ─────────────────────────────────────────────────────────
function PricingSlide() {
  const plans = [
    { name: "Free", price: "₹0", period: "forever", highlight: false, features: ["5 tenants · 10 rooms", "Dashboard & reports", "Manual tracking"] },
    { name: "Monthly", price: "₹499", period: "/month", highlight: false, features: ["20 tenants · 30 rooms", "WhatsApp reminders", "Razorpay payment links", "Email notifications", "Notices & CSV export"] },
    { name: "Quarterly", price: "₹1,199", period: "/quarter", highlight: true, badge: "Best Value", save: "≈ ₹400/mo · save 20%", features: ["Unlimited tenants & rooms", "Bulk WhatsApp", "Priority support", "Multi-PG management"] },
  ];
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-900 px-8">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2">Simple Pricing</h2>
          <p className="text-gray-400">Start free. Upgrade when you need more.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div key={p.name}
              className={`rounded-xl border p-5 relative ${p.highlight ? "border-purple-500 bg-purple-950/50 shadow-lg shadow-purple-900/30" : "border-gray-700 bg-gray-800/50"}`}>
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold rounded-full">
                    <Star size={9} fill="currentColor" /> {p.badge}
                  </span>
                </div>
              )}
              <p className={`text-sm font-bold mb-1 ${p.highlight ? "text-purple-300" : "text-gray-300"}`}>{p.name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-2xl font-extrabold text-white">{p.price}</span>
                <span className="text-xs text-gray-500">{p.period}</span>
              </div>
              {p.save && <p className="text-[10px] text-purple-400 font-semibold mb-3">{p.save}</p>}
              <ul className="space-y-1.5 mt-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle2 size={11} className={p.highlight ? "text-purple-400" : "text-indigo-400"} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Slide 10: CTA ────────────────────────────────────────────────────────────
function CtaSlide() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 px-8 text-center">
      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 ring-2 ring-white/20">
        <TrendingUp size={28} className="text-white" />
      </div>
      <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
        Ready to manage your<br />PG smarter?
      </h2>
      <p className="text-indigo-200 text-lg mb-10 max-w-md">
        Join 500+ PG owners who replaced chaos with clarity. Start free today.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
        <Link href="/onboarding"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
          Get Started Free <ArrowRight size={16} />
        </Link>
        <Link href="/demo"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
          <Maximize2 size={15} /> Try Live Demo
        </Link>
      </div>
      <div className="flex flex-wrap justify-center gap-6 text-sm text-indigo-300">
        <span>✓ Free forever plan</span>
        <span>✓ No credit card required</span>
        <span>✓ Setup in 10 minutes</span>
        <span>✓ Data stays on your device</span>
      </div>
    </div>
  );
}
