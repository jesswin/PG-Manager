"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOnboarding, PGProfile, OwnerProfile } from "@/store/OnboardingContext";
import { usePlan, PLANS, PlanId } from "@/store/PlanContext";
import { useAuth } from "@/store/AuthContext";
import {
  Building2, User, ChevronRight, ChevronLeft, Plus, Trash2,
  CheckCircle2, Zap, Users, DoorOpen, MessageCircle, Download,
  Check, Star, Eye, EyeOff, Lock, Mail, AlertCircle,
} from "lucide-react";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";

// ─── Types ───────────────────────────────────────────────────────────────────

type PgDraft = Omit<PGProfile, "id"> & { tempId: string };

// ─── Steps ───────────────────────────────────────────────────────────────────

const STEPS = ["Your Profile", "Your PG(s)", "Choose Plan"];

// ─── Plan feature definitions ────────────────────────────────────────────────

const PLAN_HIGHLIGHTS: Record<PlanId, { label: string; included: boolean }[]> = {
  free: [
    { label: "Up to 5 tenants & 10 rooms", included: true },
    { label: "Basic dashboard & reports", included: true },
    { label: "Manual payment tracking", included: true },
    { label: "WhatsApp reminders", included: false },
    { label: "Export CSV", included: false },
    { label: "Notices & announcements", included: false },
  ],
  monthly: [
    { label: "Up to 20 tenants & 30 rooms", included: true },
    { label: "WhatsApp individual reminders", included: true },
    { label: "Send & manage notices", included: true },
    { label: "Export payments as CSV", included: true },
    { label: "Due date reminder panel", included: true },
    { label: "Bulk WhatsApp (all at once)", included: false },
  ],
  quarterly: [
    { label: "Unlimited tenants & rooms", included: true },
    { label: "Everything in Monthly", included: true },
    { label: "Bulk WhatsApp reminders", included: true },
    { label: "Priority support", included: true },
    { label: "Save ~20% vs monthly", included: true },
    { label: "Multiple PG management", included: true },
  ],
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { completeOnboarding, addPg, isOnboarded, hydrated: onboardingHydrated } = useOnboarding();
  const { plan, setPlan } = usePlan();
  const { signUp, isSupabase, isAuthenticated, hydrated: authHydrated, resendConfirmation } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddPgMode = searchParams.get("addPg") === "1";

  // If already onboarded: dashboard (if authenticated) or login (if not)
  useEffect(() => {
    if (!authHydrated || !onboardingHydrated) return;
    if (!isOnboarded || isAddPgMode) return;
    router.replace(isAuthenticated ? "/" : "/login");
  }, [authHydrated, onboardingHydrated, isOnboarded, isAddPgMode, isAuthenticated, router]);

  // Authenticated but not onboarded (e.g. returned after email confirmation) → skip Step 0
  const [step, setStep] = useState(isAddPgMode ? 1 : 0);
  useEffect(() => {
    if (!authHydrated) return;
    if (isAuthenticated && step === 0) setStep(1);
  }, [authHydrated, isAuthenticated]);

  // Step 0 — owner profile
  const [ownerForm, setOwnerForm] = useState<OwnerProfile>({ name: "", email: "", phone: "" });
  const [password, setPassword_] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  // Auto-advance to Step 1 the moment Supabase fires SIGNED_IN (email confirmed)
  useEffect(() => {
    if (!needsEmailConfirm) return;
    if (typeof window === "undefined") return;
    const { supabase: sb } = require("@/lib/supabase");
    if (!sb) return;
    const { data: { subscription } } = sb.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_IN") {
        setNeedsEmailConfirm(false);
        setStep(1);
      }
    });
    return () => subscription.unsubscribe();
  }, [needsEmailConfirm]);

  // Step 1 — PG list
  const [pgDrafts, setPgDrafts] = useState<PgDraft[]>([
    { tempId: "pg0", name: "", address: "", city: "" },
  ]);

  // Step 2 — plan
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(plan.id);
  const [finishing, setFinishing] = useState(false);

  const progress = ((step + 1) / STEPS.length) * 100;

  function goNext() { setStep((s) => Math.min(s + 1, STEPS.length - 1)); }
  function goBack() { setStep((s) => Math.max(s - 1, 0)); }

  // ── Step 0 submit ─────────────────────────────────────────────────────────

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setPwdError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setPwdError("Passwords do not match."); return; }
    setPwdError("");
    const { error, needsEmailConfirmation } = await signUp(ownerForm.email, password);
    if (error) { setPwdError(error); return; }
    if (needsEmailConfirmation) {
      setNeedsEmailConfirm(true);
      return;
    }
    goNext();
  }

  async function handleResend() {
    setResendLoading(true);
    setResendMsg("");
    const { error } = await resendConfirmation(ownerForm.email);
    setResendLoading(false);
    setResendMsg(error ? `Failed: ${error}` : "Verification email resent!");
  }

  // ── Step 2: PG management ─────────────────────────────────────────────────

  function addPgDraft() {
    setPgDrafts((prev) => [
      ...prev,
      { tempId: `pg${Date.now()}`, name: "", address: "", city: "" },
    ]);
  }

  function removePgDraft(tempId: string) {
    setPgDrafts((prev) => prev.filter((d) => d.tempId !== tempId));
  }

  function updatePgDraft(tempId: string, field: keyof Omit<PgDraft, "tempId">, value: string) {
    setPgDrafts((prev) =>
      prev.map((d) => (d.tempId === tempId ? { ...d, [field]: value } : d))
    );
  }

  function handlePgsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAddPgMode) {
      // Save new PGs to OnboardingContext and redirect back
      pgDrafts.forEach((d) => addPg({ name: d.name, address: d.address, city: d.city }));
      router.push("/");
      return;
    }
    goNext();
  }

  // ── Step 2: finish ───────────────────────────────────────────────────────

  async function handleFinish() {
    setFinishing(true);
    setPlan(selectedPlan);
    const pgList: PGProfile[] = pgDrafts.map((d, i) => ({
      id: `pg${Date.now() + i}`,
      name: d.name,
      address: d.address,
      city: d.city,
    }));
    await completeOnboarding(ownerForm, pgList);
    // Hard navigation so dashboard always loads fresh with the new onboarding state
    window.location.href = "/";
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">PGNest</span>
        </div>
        {!isAddPgMode && (
          <span className="text-xs text-gray-400 font-medium">
            Step {step + 1} of {STEPS.length}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isAddPgMode && (
        <div className="w-full max-w-3xl mx-auto px-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-colors
                  ${i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : "bg-gray-200 text-gray-400"}`}>
                  {i < step ? <Check size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-indigo-600" : i < step ? "text-gray-500" : "text-gray-300"}`}>
                  {label}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 rounded-full bg-gray-200 overflow-hidden">
                    <div className={`h-full bg-indigo-500 transition-all duration-500 ${i < step ? "w-full" : "w-0"}`} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-xl">
          {/* ── Step 0: Owner Profile ──────────────────────────── */}
          {step === 0 && needsEmailConfirm && (
            <div className="bg-white rounded-2xl border border-amber-300 shadow-sm p-8 text-center">
              {/* Warning banner */}
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-left">
                <AlertCircle size={18} className="text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 font-semibold">
                  Please confirm your email before continuing
                </p>
              </div>

              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={28} className="text-indigo-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 mb-1">Verify your email</h1>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                A verification link was sent to <strong className="text-gray-800">{ownerForm.email}</strong>
              </p>

              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 text-left mb-5 space-y-2">
                <p className="font-semibold text-gray-700 mb-1">What to do:</p>
                <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">1</span> Open the email from PGNest</div>
                <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">2</span> Click the <strong>Confirm your mail</strong> button</div>
                <div className="flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0">3</span> You&apos;ll be automatically brought back to continue setup</div>
              </div>

              <div className="flex flex-col gap-2">
                <button type="button" onClick={handleResend} disabled={resendLoading}
                  className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                  {resendLoading ? "Sending…" : "Resend verification email"}
                </button>
                {resendMsg && (
                  <p className={`text-xs text-center ${resendMsg.startsWith("Failed") ? "text-red-500" : "text-emerald-600"}`}>
                    {resendMsg}
                  </p>
                )}
                <p className="text-xs text-gray-400">Didn&apos;t receive it? Also check your spam folder.</p>
              </div>
            </div>
          )}

          {step === 0 && !needsEmailConfirm && (
            <form onSubmit={handleProfileSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <User size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Welcome to PGNest</h1>
                  <p className="text-sm text-gray-500">Let&apos;s set up your account</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
                  <input required type="text" className={inp} placeholder="Ramesh Agarwal"
                    value={ownerForm.name} onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone *</label>
                    <input required type="tel" className={inp} placeholder="9876543210"
                      value={ownerForm.phone} onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
                    <input required type="email" className={inp} placeholder="you@email.com"
                      value={ownerForm.email} onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })} />
                  </div>
                </div>

                {/* Password */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock size={13} className="text-indigo-500" />
                    <span className="text-xs font-semibold text-gray-700">Set a login password</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password *</label>
                      <div className="relative">
                        <input required type={showPwd ? "text" : "password"} className={`${inp} pr-9`}
                          placeholder="Min. 6 characters" value={password}
                          onChange={(e) => { setPassword_(e.target.value); setPwdError(""); }} />
                        <button type="button" onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password *</label>
                      <input required type={showPwd ? "text" : "password"} className={inp}
                        placeholder="Re-enter password" value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setPwdError(""); }} />
                    </div>
                  </div>
                  {pwdError && <p className="text-xs text-red-500 mt-2">{pwdError}</p>}
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Continue <ChevronRight size={16} />
              </button>
            </form>
          )}

          {/* ── Step 1: PG Details ─────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={handlePgsSubmit}>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Building2 size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">
                      {isAddPgMode ? "Add New PG Property" : "Your Properties"}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {isAddPgMode ? "Fill in details for your new PG" : "You can manage multiple PGs from one account"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {pgDrafts.map((pg, idx) => (
                    <div key={pg.tempId} className="relative p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          {isAddPgMode ? "New PG" : `PG ${idx + 1}`}
                        </span>
                        {pgDrafts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePgDraft(pg.tempId)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">PG Name *</label>
                          <input
                            required
                            type="text"
                            className={inp}
                            placeholder="Sunshine PG, Green Hostel…"
                            value={pg.name}
                            onChange={(e) => updatePgDraft(pg.tempId, "name", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Address *</label>
                            <input
                              required
                              type="text"
                              className={inp}
                              placeholder="123, MG Road"
                              value={pg.address}
                              onChange={(e) => updatePgDraft(pg.tempId, "address", e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">City *</label>
                            <input
                              required
                              type="text"
                              className={inp}
                              placeholder="Bangalore"
                              value={pg.city}
                              onChange={(e) => updatePgDraft(pg.tempId, "city", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addPgDraft}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                  >
                    <Plus size={15} /> Add another PG
                  </button>
                </div>

                <div className="flex gap-3 mt-6">
                  {!isAddPgMode && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="flex items-center gap-1.5 px-5 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {isAddPgMode ? "Save PG" : "Continue"} <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ── Step 2: Plan Selection ─────────────────────────── */}
          {step === 2 && (
            <div>
              <div className="text-center mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Choose your plan</h1>
                <p className="text-sm text-gray-500">Start free, upgrade anytime — no lock-in</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                {(["free", "monthly", "quarterly"] as PlanId[]).map((pid) => {
                  const p = PLANS[pid];
                  const isSelected = selectedPlan === pid;
                  const isPopular = pid === "quarterly";
                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setSelectedPlan(pid)}
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? pid === "quarterly"
                            ? "border-purple-500 bg-purple-50 shadow-md"
                            : "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-bold rounded-full">
                            <Star size={9} fill="currentColor" /> BEST VALUE
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className={`text-sm font-bold ${isSelected ? (pid === "quarterly" ? "text-purple-700" : "text-indigo-700") : "text-gray-800"}`}>
                            {p.name}
                          </p>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-xl font-extrabold text-gray-900">
                              ₹{p.price.toLocaleString("en-IN")}
                            </span>
                            {p.price > 0 && (
                              <span className="text-xs text-gray-400">{p.period}</span>
                            )}
                            {p.price === 0 && (
                              <span className="text-xs text-gray-400">forever</span>
                            )}
                          </div>
                          {pid === "quarterly" && (
                            <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
                              ≈ ₹400/mo · save ~20%
                            </p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? pid === "quarterly" ? "border-purple-500 bg-purple-500" : "border-indigo-500 bg-indigo-500"
                            : "border-gray-300"
                        }`}>
                          {isSelected && <Check size={11} className="text-white" />}
                        </div>
                      </div>

                      <ul className="space-y-1.5">
                        {PLAN_HIGHLIGHTS[pid].map((h) => (
                          <li key={h.label} className="flex items-start gap-1.5">
                            {h.included
                              ? <CheckCircle2 size={12} className={`shrink-0 mt-0.5 ${pid === "quarterly" ? "text-purple-500" : "text-indigo-500"}`} />
                              : <div className="w-3 h-3 shrink-0 mt-0.5 rounded-full border border-gray-200" />
                            }
                            <span className={`text-[11px] leading-tight ${h.included ? "text-gray-700" : "text-gray-300"}`}>
                              {h.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>

              {/* Feature icons */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: Users, label: "Tenant Management" },
                  { icon: MessageCircle, label: "WhatsApp Alerts" },
                  { icon: Download, label: "CSV Export" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-100">
                    <Icon size={18} className="text-indigo-500" />
                    <span className="text-[11px] text-gray-500 text-center font-medium leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-5 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={finishing}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 disabled:opacity-70 transition-opacity shadow-sm"
                >
                  {finishing
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Setting up…</>
                    : <><Zap size={16} /> Get Started</>
                  }
                </button>
              </div>

              <p className="text-center text-xs text-gray-400 mt-3">
                You can change your plan anytime from the Pricing page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
