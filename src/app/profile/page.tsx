"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/store/OnboardingContext";
import { useAuth } from "@/store/AuthContext";
import { usePlan, PLANS } from "@/store/PlanContext";
import { ToastContainer, useToast } from "@/components/Toast";
import Breadcrumbs from "@/components/Breadcrumbs";
import Link from "next/link";
import {
  User, Phone, Mail, Lock, Building2, Eye, EyeOff,
  CheckCircle2, LogOut, AlertCircle, Zap, ChevronRight,
  Pencil, Shield,
} from "lucide-react";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";

export default function ProfilePage() {
  const { owner, pgs, activePgId, switchPg, updateOwnerProfile } = useOnboarding();
  const { isAuthenticated, isSupabase, changePassword, logout } = useAuth();
  const { plan } = usePlan();
  const router = useRouter();
  const { toasts, addToast, dismiss } = useToast();

  // ── Profile form ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name:  owner.name,
    phone: owner.phone,
    email: owner.email,
  });
  const [profileSaving, setProfileSaving] = useState(false);

  async function handleSaveProfile(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileSaving(true);
    await updateOwnerProfile(profileForm);
    setProfileSaving(false);
    addToast("Profile updated successfully.", "success");
  }

  // ── Password form ─────────────────────────────────────────────────────────
  const [pwdForm, setPwdForm] = useState({ old: "", new_: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);

  async function handleChangePassword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwdError("");
    if (pwdForm.new_.length < 6) { setPwdError("New password must be at least 6 characters."); return; }
    if (pwdForm.new_ !== pwdForm.confirm) { setPwdError("Passwords do not match."); return; }
    setPwdSaving(true);
    const ok = await changePassword(pwdForm.old, pwdForm.new_);
    setPwdSaving(false);
    if (ok) {
      addToast("Password changed successfully.", "success");
      setPwdForm({ old: "", new_: "", confirm: "" });
    } else {
      setPwdError(isSupabase ? "Could not update password. Try again." : "Current password is incorrect.");
    }
  }

  function handleLogout() {
    logout();
    router.push("/demo");
  }

  const ownerInitials = owner.name
    ? owner.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "PG";

  const planColors: Record<string, { bg: string; text: string; ring: string }> = {
    free:      { bg: "bg-gray-100",    text: "text-gray-600",   ring: "ring-gray-200" },
    monthly:   { bg: "bg-indigo-100",  text: "text-indigo-700", ring: "ring-indigo-200" },
    quarterly: { bg: "bg-purple-100",  text: "text-purple-700", ring: "ring-purple-200" },
  };
  const pc = planColors[plan.id];

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "My Profile" }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="flex items-center gap-5 mb-8">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ring-4 ${pc.bg} ${pc.ring}`}>
          <span className={`text-xl font-extrabold ${pc.text}`}>{ownerInitials}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{owner.name || "PG Owner"}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${pc.bg} ${pc.text}`}>
              {plan.name} Plan
            </span>
            {owner.email && <span className="text-sm text-gray-500">{owner.email}</span>}
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* ── Personal Information ─────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <User size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Personal Information</h2>
              <p className="text-xs text-gray-500">Update your name and contact details</p>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name *</label>
              <input required className={inp} placeholder="Ramesh Agarwal"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Phone size={11} /> Phone *
                </label>
                <input required type="tel" className={inp} placeholder="9876543210"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                  <Mail size={11} /> Email
                  {isSupabase && <span className="ml-1 text-[10px] text-gray-400">(login email — cannot change)</span>}
                </label>
                <input
                  type="email"
                  className={`${inp} ${isSupabase ? "bg-gray-50 text-gray-400 cursor-not-allowed" : ""}`}
                  placeholder="you@email.com"
                  value={profileForm.email}
                  readOnly={isSupabase}
                  onChange={(e) => !isSupabase && setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={profileSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm">
                {profileSaving ? "Saving…" : <><CheckCircle2 size={14} /> Save Profile</>}
              </button>
            </div>
          </form>
        </section>

        {/* ── PG Properties ────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Building2 size={16} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">My PG Properties</h2>
                <p className="text-xs text-gray-500">{pgs.length} / {PLANS[plan.id].maxPgs === Infinity ? "Unlimited" : PLANS[plan.id].maxPgs} properties</p>
              </div>
            </div>
            <Link href="/onboarding?addPg=1"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition-colors">
              + Add PG
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {pgs.map((pg) => (
              <div key={pg.id}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors ${pg.id === activePgId ? "bg-indigo-50/40" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${pg.id === activePgId ? "bg-indigo-100" : "bg-gray-100"}`}>
                    <Building2 size={14} className={pg.id === activePgId ? "text-indigo-600" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{pg.name}</p>
                    <p className="text-xs text-gray-500">{pg.address && `${pg.address}, `}{pg.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pg.id === activePgId && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Active</span>
                  )}
                  {pg.id !== activePgId && (
                    <button onClick={() => switchPg(pg.id)}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-0.5">
                      Switch <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Change Password ───────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Lock size={16} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Change Password</h2>
              <p className="text-xs text-gray-500">Update your login password</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="p-5 space-y-4">
            {!isSupabase && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Password *</label>
                <div className="relative">
                  <input required type={showPwd ? "text" : "password"} className={`${inp} pr-9`}
                    placeholder="Enter current password" value={pwdForm.old}
                    onChange={(e) => { setPwdForm({ ...pwdForm, old: e.target.value }); setPwdError(""); }} />
                  <button type="button" onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password *</label>
                <input required type={showPwd ? "text" : "password"} className={inp}
                  placeholder="Min. 6 characters" value={pwdForm.new_}
                  onChange={(e) => { setPwdForm({ ...pwdForm, new_: e.target.value }); setPwdError(""); }} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password *</label>
                <input required type={showPwd ? "text" : "password"} className={inp}
                  placeholder="Re-enter new password" value={pwdForm.confirm}
                  onChange={(e) => { setPwdForm({ ...pwdForm, confirm: e.target.value }); setPwdError(""); }} />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-500">
              <input type="checkbox" checked={showPwd} onChange={(e) => setShowPwd(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-500" />
              Show passwords
            </label>
            {pwdError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle size={12} /> {pwdError}
              </div>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={pwdSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm">
                {pwdSaving ? "Changing…" : <><Shield size={14} /> Change Password</>}
              </button>
            </div>
          </form>
        </section>

        {/* ── Current Plan ─────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Zap size={16} className="text-amber-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Current Plan</h2>
                <p className="text-xs text-gray-500">
                  {plan.price === 0 ? "Free forever" : `₹${plan.price.toLocaleString("en-IN")} ${plan.period}`}
                </p>
              </div>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${pc.bg} ${pc.text}`}>{plan.name}</span>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "PG Properties", value: PLANS[plan.id].maxPgs === Infinity ? "Unlimited" : String(PLANS[plan.id].maxPgs) },
                { label: "Rooms", value: PLANS[plan.id].maxRooms === Infinity ? "Unlimited" : String(PLANS[plan.id].maxRooms) },
                { label: "Tenants", value: "Unlimited" },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <p className="text-base font-extrabold text-gray-900">{value}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            {plan.id !== "quarterly" && (
              <Link href="/pricing"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm">
                <Zap size={15} /> Upgrade Plan
              </Link>
            )}
          </div>
        </section>

        {/* ── Danger Zone ──────────────────────────────────────────────────── */}
        <section className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-red-50">
            <h2 className="text-sm font-semibold text-red-700">Account Actions</h2>
          </div>
          <div className="p-5">
            <button onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors border border-red-100">
              <LogOut size={15} /> Sign Out
            </button>
            <p className="text-xs text-gray-400 mt-2">Signing out will end your current session on this device.</p>
          </div>
        </section>

      </div>
    </div>
  );
}
