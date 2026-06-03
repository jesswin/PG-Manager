"use client";

import Link from "next/link";
import { useState } from "react";
import { enterDemoMode } from "@/lib/demo";
import {
  Building2, Users, DoorOpen, MessageCircle, CreditCard,
  Bell, Zap, CheckCircle2, Star, ChevronDown,
  ArrowRight, TrendingUp, Shield, Smartphone, Globe, BarChart3,
  Clock, AlertCircle, Check, IndianRupee, Play,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Users,
    color: "indigo",
    title: "Smart Tenant Management",
    desc: "Complete tenant profiles with ID proofs, amenities, food preferences, emergency contacts and more. Everything you need in one place.",
  },
  {
    icon: DoorOpen,
    color: "purple",
    title: "Room & Occupancy Tracking",
    desc: "Track every room across all floors. Know what's vacant, what's occupied, and what amenities each room offers — at a glance.",
  },
  {
    icon: MessageCircle,
    color: "emerald",
    title: "Auto WhatsApp & Email Reminders",
    desc: "PG Manager automatically sends rent reminders via WhatsApp and email when due dates are near. Zero manual effort needed.",
  },
  {
    icon: CreditCard,
    color: "blue",
    title: "Online Rent Collection",
    desc: "Integrate Razorpay to send payment links via WhatsApp. Tenants pay via UPI, card, or net banking — you get notified instantly.",
  },
  {
    icon: Building2,
    color: "orange",
    title: "Multi-PG Management",
    desc: "Own multiple PGs? Manage all of them from one account. Switch between properties with a single click in the sidebar.",
  },
  {
    icon: Bell,
    color: "rose",
    title: "Notices & Announcements",
    desc: "Send maintenance notices, water supply updates, or any announcement to all tenants or specific ones — with email and SMS delivery.",
  },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    color: "gray",
    highlight: false,
    features: [
      "Up to 5 tenants & 10 rooms",
      "Basic dashboard & reports",
      "Manual payment tracking",
      "Room & tenant management",
    ],
    missing: ["WhatsApp reminders", "Online payment links", "CSV export", "Notices"],
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 499,
    period: "per month",
    color: "indigo",
    highlight: false,
    features: [
      "Up to 20 tenants & 30 rooms",
      "WhatsApp individual reminders",
      "Razorpay payment links",
      "Send & manage notices",
      "Export payments as CSV",
      "Email auto-notifications",
    ],
    missing: ["Bulk WhatsApp (all at once)", "Unlimited tenants"],
  },
  {
    id: "quarterly",
    name: "Quarterly",
    price: 1199,
    period: "per 3 months",
    color: "purple",
    highlight: true,
    badge: "Best Value",
    save: "Save 20%",
    features: [
      "Unlimited tenants & rooms",
      "Bulk WhatsApp reminders",
      "Everything in Monthly",
      "Priority support",
      "Multi-PG management",
      "≈ ₹400/mo · save ~20%",
    ],
    missing: [],
  },
];

const TESTIMONIALS = [
  {
    name: "Ramesh Agarwal",
    pg: "Sunshine PG, Bangalore",
    initials: "RA",
    color: "indigo",
    text: "I used to spend every weekend calling tenants for rent. Now PG Manager does it automatically. Best ₹499 I've ever spent — saved me hours every month.",
    stars: 5,
  },
  {
    name: "Priya Desai",
    pg: "Green Hostel (3 PGs), Pune",
    initials: "PD",
    color: "purple",
    text: "Managing 3 PGs was a nightmare in Excel. With PG Manager I can switch between properties in seconds, and the payment links via WhatsApp have cut my pending rent by 70%.",
    stars: 5,
  },
  {
    name: "Suresh Kumar",
    pg: "Kumar Residency, Hyderabad",
    initials: "SK",
    color: "emerald",
    text: "The WhatsApp reminders are a game changer. Tenants pay on time because they get a reminder 3 days before due date with a direct payment link. No more awkward calls.",
    stars: 5,
  },
];

const FAQS = [
  {
    q: "Do I need any technical knowledge to use PG Manager?",
    a: "Not at all. PG Manager is designed for PG owners, not developers. You can set up your entire PG in under 10 minutes with our step-by-step onboarding.",
  },
  {
    q: "How does the WhatsApp reminder work?",
    a: "When rent is due within your configured days, PG Manager automatically opens a pre-filled WhatsApp message to your tenant (including a payment link if Razorpay is configured). You just approve and send — or enable bulk send to do all at once.",
  },
  {
    q: "Is my tenant data safe?",
    a: "Yes. All data is stored securely in your browser (local storage). Nothing is stored on external servers. Your tenant details never leave your device.",
  },
  {
    q: "Can I manage multiple PGs?",
    a: "Yes! You can add multiple PG properties during onboarding or any time after. Each PG has its own isolated set of rooms, tenants, and payment history.",
  },
  {
    q: "What happens when I switch from Free to Monthly?",
    a: "Your data stays intact. You immediately unlock WhatsApp reminders, payment links, notices, and CSV export. No migration needed.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleTryDemo() {
    try { enterDemoMode(); } catch { /* localStorage blocked */ }
    // Hard navigation ensures all auth/onboarding contexts reinitialize
    // with the new demo-mode localStorage value.
    window.location.href = "/";
  }

  function handleStartFree() {
    window.location.href = "/onboarding";
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Building2 size={15} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">PG Manager</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Sign In
            </Link>
            <Link onClick={() => window.location.href="/onboarding"} href="/onboarding"
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-indigo-50/60 via-white to-white overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-6">
              <Zap size={11} fill="currentColor" /> New: Auto Email + WhatsApp Reminders
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight max-w-3xl mb-6">
              Manage Your PG
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mb-8 leading-relaxed">
              Tenants, rooms, payments, and reminders — all in one beautiful dashboard.
              Stop chasing rent on WhatsApp. Let PG Manager do it for you.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleTryDemo}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-200"
              >
                <Play size={15} fill="currentColor" /> Try Live Demo
              </button>
              <button
                onClick={handleStartFree}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                Start for Free <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Demo uses sample data · No sign-up needed · Or start free with your own data
            </p>
          </div>

          {/* Dashboard mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-3xl blur-2xl" />
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="flex-1 mx-3 px-3 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-400">
                  pgmanager.app/dashboard
                </div>
              </div>
              {/* Mock dashboard */}
              <div className="flex h-52 sm:h-72">
                {/* Sidebar */}
                <div className="w-44 bg-gray-50 border-r border-gray-100 p-3 hidden sm:block shrink-0">
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center">
                      <Building2 size={10} className="text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-800">PG Manager</span>
                  </div>
                  {["Dashboard", "Tenants", "Rooms", "Payments", "Notices"].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-xs font-medium ${i === 0 ? "bg-indigo-600 text-white" : "text-gray-500"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-300" : "bg-gray-300"}`} />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Content */}
                <div className="flex-1 p-4 bg-gray-50/50 overflow-hidden">
                  <p className="text-xs font-bold text-gray-800 mb-3">Dashboard</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    {[
                      { label: "Tenants", value: "12", icon: Users, color: "bg-indigo-100 text-indigo-600" },
                      { label: "Rooms", value: "16", icon: DoorOpen, color: "bg-purple-100 text-purple-600" },
                      { label: "Occupancy", value: "75%", icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
                      { label: "Pending", value: "₹24K", icon: AlertCircle, color: "bg-red-100 text-red-500" },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="bg-white rounded-lg border border-gray-100 p-2.5 shadow-sm">
                        <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center mb-1.5`}>
                          <Icon size={12} />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{value}</p>
                        <p className="text-[10px] text-gray-500">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-50">
                      <p className="text-[10px] font-semibold text-gray-600">Recent Tenants</p>
                    </div>
                    {[
                      { name: "Arjun Sharma", room: "101", status: "Paid", color: "text-emerald-600 bg-emerald-50" },
                      { name: "Priya Nair", room: "102", status: "Unpaid", color: "text-red-500 bg-red-50" },
                      { name: "Karthik Menon", room: "203", status: "Paid", color: "text-emerald-600 bg-emerald-50" },
                    ].map(({ name, room, status, color }) => (
                      <div key={name} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50">
                        <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-[8px] font-bold text-indigo-700">{name.split(" ").map(w => w[0]).join("")}</span>
                        </div>
                        <p className="text-[10px] font-medium text-gray-800 flex-1 truncate">{name}</p>
                        <span className="text-[9px] text-gray-400">Rm {room}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>{status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-10 border-y border-gray-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "500+", label: "PG Owners" },
              { value: "10,000+", label: "Tenants Managed" },
              { value: "₹2 Cr+", label: "Rent Tracked" },
              { value: "98%", label: "Owner Satisfaction" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">{value}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Everything you need to run your PG
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              From tenant onboarding to automated rent collection — PG Manager handles it all.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => {
              const colors: Record<string, string> = {
                indigo: "bg-indigo-100 text-indigo-600",
                purple: "bg-purple-100 text-purple-600",
                emerald: "bg-emerald-100 text-emerald-600",
                blue: "bg-blue-100 text-blue-600",
                orange: "bg-orange-100 text-orange-600",
                rose: "bg-rose-100 text-rose-600",
              };
              return (
                <div key={title} className="p-6 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:border-gray-200 transition-all">
                  <div className={`w-10 h-10 rounded-xl ${colors[color]} flex items-center justify-center mb-4`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Sound familiar?</h2>
            <p className="text-gray-500">Most PG owners spend hours on tasks that PG Manager handles in seconds.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-white rounded-2xl border border-red-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-500 font-bold text-sm">✗</span>
                </div>
                <span className="font-bold text-gray-800">Without PG Manager</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Calling tenants individually for rent every month",
                  "Maintaining Excel sheets that go out of date",
                  "Forgetting which rooms are vacant",
                  "Chasing tenants for ID proofs and contracts",
                  "No way to send payment links — cash only",
                  "Writing notices on paper & distributing manually",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="text-red-400 mt-0.5 shrink-0">✗</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="bg-white rounded-2xl border border-emerald-100 p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                </div>
                <span className="font-bold text-gray-800">With PG Manager</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Automatic WhatsApp + email reminders 3 days before due",
                  "Live dashboard with real-time occupancy and payments",
                  "Instant visibility — vacant rooms highlighted at a glance",
                  "Complete digital profiles with ID proofs, amenities, notes",
                  "Razorpay payment links sent right through WhatsApp",
                  "Digital notices delivered instantly to all tenants",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 size={15} className="text-emerald-500 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Up and running in minutes</h2>
            <p className="text-gray-500">No complex setup. Our guided onboarding takes under 10 minutes.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Shield,
                color: "indigo",
                title: "Create your account",
                desc: "Enter your name, phone, email, and set a password. Your data stays in your browser — no server required.",
              },
              {
                step: "02",
                icon: Building2,
                color: "purple",
                title: "Set up your PG(s)",
                desc: "Add your PG name, address, and city. Add as many PGs as you own. Then add your rooms with rent amounts.",
              },
              {
                step: "03",
                icon: Zap,
                color: "emerald",
                title: "Sit back & collect rent",
                desc: "Add tenants with due dates. PG Manager handles reminders, payment links, and notices automatically.",
              },
            ].map(({ step, icon: Icon, color, title, desc }) => {
              const colors: Record<string, { bg: string; text: string; ring: string }> = {
                indigo: { bg: "bg-indigo-100", text: "text-indigo-600", ring: "ring-indigo-200" },
                purple: { bg: "bg-purple-100", text: "text-purple-600", ring: "ring-purple-200" },
                emerald: { bg: "bg-emerald-100", text: "text-emerald-600", ring: "ring-emerald-200" },
              };
              return (
                <div key={step} className="text-center">
                  <div className={`w-14 h-14 rounded-2xl ${colors[color].bg} ${colors[color].text} flex items-center justify-center mx-auto mb-4 ring-4 ${colors[color].ring}`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-xs font-bold text-gray-400 mb-2">STEP {step}</div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link onClick={() => window.location.href="/onboarding"} href="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Start Your Setup Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Simple, honest pricing</h2>
            <p className="text-gray-500">Start free. Upgrade when you need more power.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {PLANS.map((plan) => (
              <div key={plan.id}
                className={`relative rounded-2xl border p-6 ${plan.highlight
                  ? "border-purple-400 bg-gradient-to-b from-purple-50 to-white shadow-xl shadow-purple-100 scale-105"
                  : "border-gray-200 bg-white"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-sm">
                      <Star size={10} fill="currentColor" /> {plan.badge}
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <p className={`text-sm font-bold mb-1 ${plan.highlight ? "text-purple-700" : plan.id === "monthly" ? "text-indigo-700" : "text-gray-700"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {plan.price === 0 ? "Free" : `₹${plan.price.toLocaleString("en-IN")}`}
                    </span>
                    {plan.price > 0 && <span className="text-sm text-gray-400">{plan.period}</span>}
                  </div>
                  {plan.save && <p className="text-xs text-purple-600 font-semibold mt-1">{plan.save}</p>}
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check size={14} className={`shrink-0 mt-0.5 ${plan.highlight ? "text-purple-500" : plan.id === "monthly" ? "text-indigo-500" : "text-gray-400"}`} />
                      {f}
                    </li>
                  ))}
                  {plan.missing?.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300 line-through">
                      <div className="w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full border border-gray-200" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link onClick={() => window.location.href="/onboarding"} href="/onboarding"
                  className={`block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.highlight
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {plan.price === 0 ? "Start Free" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            All plans include the full dashboard. Upgrade or downgrade anytime.
          </p>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-10">
            All plans include
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: Shield, label: "Secure local storage", sub: "Your data stays on your device" },
              { icon: Smartphone, label: "Mobile friendly", sub: "Works on phone, tablet, desktop" },
              { icon: Globe, label: "No installation", sub: "Runs entirely in your browser" },
              { icon: BarChart3, label: "Real-time dashboard", sub: "Live occupancy & rent stats" },
              { icon: Clock, label: "Due date tracking", sub: "Custom due day per tenant" },
              { icon: IndianRupee, label: "INR native", sub: "Built for Indian PG market" },
              { icon: Building2, label: "Multi-PG ready", sub: "Add unlimited properties" },
              { icon: Users, label: "Unlimited history", sub: "Full tenant & payment records" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Icon size={18} className="text-gray-600" />
                </div>
                <p className="text-xs font-semibold text-gray-800">{label}</p>
                <p className="text-[11px] text-gray-400 leading-tight">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Loved by PG owners</h2>
            <p className="text-gray-500">Real feedback from real PG owners across India.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, pg, initials, color, text, stars }) => {
              const colorMap: Record<string, string> = {
                indigo: "bg-indigo-100 text-indigo-700",
                purple: "bg-purple-100 text-purple-700",
                emerald: "bg-emerald-100 text-emerald-700",
              };
              return (
                <div key={name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex items-center gap-0.5 mb-4">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} size={13} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">&ldquo;{text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${colorMap[color]}`}>
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">{pg}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-gray-900 pr-4">{q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to manage your PG smarter?
          </h2>
          <p className="text-indigo-200 text-lg mb-8">
            Join 500+ PG owners who&apos;ve replaced chaos with clarity.
            Start free — no credit card, no commitment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link onClick={() => window.location.href="/onboarding"} href="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-700 text-sm font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-500/50 text-white text-sm font-semibold rounded-xl hover:bg-indigo-500/70 transition-colors border border-indigo-400">
              Already have an account? Sign in
            </Link>
          </div>
          <p className="text-indigo-300 text-xs mt-5">
            Free plan: up to 5 tenants & 10 rooms · No credit card required
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-4 sm:px-6 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
              <Building2 size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">PG Manager</span>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Built for PG owners across India. All data stored locally on your device.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link onClick={() => window.location.href="/onboarding"} href="/onboarding" className="hover:text-white transition-colors">Get Started</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
