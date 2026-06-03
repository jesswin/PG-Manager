"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import { Building2, Eye, EyeOff, Lock, AlertCircle, Mail, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, hasPassword, hydrated, isSupabase, login, resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  // Forgot password state
  const [showForgot, setShowForgot]         = useState(false);
  const [resetEmail, setResetEmail]         = useState("");
  const [resetSent, setResetSent]           = useState(false);
  const [resetLoading, setResetLoading]     = useState(false);
  const [resetError, setResetError]         = useState("");
  const [showLocalReset, setShowLocalReset] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated) { router.replace("/"); return; }
    if (!hasPassword) { router.replace("/onboarding"); }
  }, [hydrated, isAuthenticated, hasPassword, router]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(email, password, remember);
    setLoading(false);
    if (ok) {
      router.replace("/");
    } else {
      setError(isSupabase ? "Incorrect email or password." : "Incorrect password. Please try again.");
      setPassword("");
    }
  }

  async function handleResetEmail(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    const { error: err } = await resetPassword(resetEmail);
    setResetLoading(false);
    if (err) {
      setResetError(err);
    } else {
      setResetSent(true);
    }
  }

  function handleLocalReset() {
    if (!confirm("This will permanently delete all your PG Manager data. Are you sure?")) return;
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/onboarding";
  }

  if (!hydrated) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PG Manager</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        {/* ── Login card ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Lock size={17} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Welcome back</p>
              <p className="text-xs text-gray-500">
                {isSupabase ? "Sign in with your email and password" : "Enter your password to unlock"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSupabase && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input autoFocus required type="email" value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@email.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input autoFocus={!isSupabase} required
                  type={showPwd ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder:text-gray-400"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
                  <AlertCircle size={12} /> {error}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-xs text-gray-600">Remember me for 7 days</span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm">
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* ── Forgot password ─────────────────────────────────── */}
        <div className="mt-4">
          <button onClick={() => { setShowForgot((v) => !v); setResetSent(false); setResetError(""); }}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 underline">
            Forgot password?
          </button>

          {showForgot && (
            <div className="mt-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
              {/* Supabase: send reset email */}
              {isSupabase && (
                <>
                  <p className="text-xs font-semibold text-gray-700">Reset via email</p>
                  {resetSent ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 size={15} className="shrink-0" />
                      Reset email sent to <strong>{resetEmail}</strong>. Check your inbox.
                    </div>
                  ) : (
                    <form onSubmit={handleResetEmail} className="space-y-3">
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input required type="email" value={resetEmail}
                          onChange={(e) => { setResetEmail(e.target.value); setResetError(""); }}
                          placeholder="your-email@example.com"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder:text-gray-400"
                        />
                      </div>
                      {resetError && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle size={11} /> {resetError}
                        </p>
                      )}
                      <button type="submit" disabled={resetLoading}
                        className="w-full py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                        {resetLoading ? "Sending…" : "Send Reset Email"}
                      </button>
                    </form>
                  )}
                  <div className="border-t border-gray-100 pt-3">
                    <button onClick={() => setShowLocalReset((v) => !v)}
                      className="text-xs text-gray-400 hover:text-red-500 underline">
                      Can't access email? Erase all local data
                    </button>
                  </div>
                </>
              )}

              {/* Local mode OR expanded local reset */}
              {(!isSupabase || showLocalReset) && (
                <div className={isSupabase ? "" : ""}>
                  {!isSupabase && <p className="text-xs font-semibold text-gray-700 mb-2">Reset account</p>}
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs text-red-700 font-semibold mb-1">Erase all data & start over</p>
                    <p className="text-xs text-red-600 mb-3 leading-relaxed">
                      This permanently deletes all tenants, rooms, payments, and settings in this browser.
                    </p>
                    <button onClick={handleLocalReset}
                      className="px-4 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors">
                      Erase everything & start over
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
