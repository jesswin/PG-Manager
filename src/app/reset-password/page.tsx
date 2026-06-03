"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Building2, Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from "lucide-react";

const inp = "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder:text-gray-400";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [done, setDone]               = useState(false);
  const [ready, setReady]             = useState(false);

  // Supabase embeds the recovery token in the URL hash on redirect.
  // We need to wait for the auth state change that processes the hash.
  useEffect(() => {
    if (!supabase) {
      setError("Password reset requires Supabase to be configured.");
      return;
    }
    // onAuthStateChange fires with event "PASSWORD_RECOVERY" when the hash is processed
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirm) { setError("Passwords do not match."); return; }
    if (!supabase) return;

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setDone(true);
      setTimeout(() => router.replace("/"), 2500);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PGNest</h1>
          <p className="text-sm text-gray-500 mt-1">Set your new password</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-1">Password Updated!</h2>
              <p className="text-sm text-gray-500">Redirecting you to the dashboard…</p>
            </div>
          ) : !ready && !error ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500">Verifying reset link…</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Lock size={17} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Create new password</p>
                  <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                </div>
              </div>

              {error && !ready ? (
                <div className="flex items-center gap-2 p-3.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 mb-4">
                  <AlertCircle size={15} className="shrink-0" /> {error}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password *</label>
                    <div className="relative">
                      <input required type={showPwd ? "text" : "password"} value={newPassword}
                        onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                        placeholder="Min. 6 characters" className={`${inp} pr-10`} />
                      <button type="button" onClick={() => setShowPwd((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password *</label>
                    <input required type={showPwd ? "text" : "password"} value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                      placeholder="Re-enter new password" className={inp} />
                  </div>
                  {error && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600">
                      <AlertCircle size={12} /> {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors">
                    {loading ? "Updating…" : "Set New Password"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
