"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";
import { Building2, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, hasPassword, hydrated, login } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);

  // Redirect if already authenticated or no password set yet
  useEffect(() => {
    if (!hydrated) return;
    if (isAuthenticated) { router.replace("/"); return; }
    if (!hasPassword) { router.replace("/onboarding"); }
  }, [hydrated, isAuthenticated, hasPassword, router]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await login(password, remember);
    setLoading(false);
    if (ok) {
      router.replace("/");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  }

  function handleResetAll() {
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

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Lock size={17} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Welcome back</p>
              <p className="text-xs text-gray-500">Enter your password to unlock</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  autoFocus
                  required
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
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
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-600">Remember me for 7 days</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Forgot password */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowReset((v) => !v)}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Forgot password?
          </button>
          {showReset && (
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl text-left">
              <p className="text-xs text-red-700 font-semibold mb-1">Reset all data</p>
              <p className="text-xs text-red-600 mb-3 leading-relaxed">
                This will permanently erase all tenants, rooms, payments, and settings stored in this browser.
              </p>
              <button
                onClick={handleResetAll}
                className="px-4 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Erase everything & start over
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
