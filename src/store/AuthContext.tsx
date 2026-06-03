"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import { isDemoMode, exitDemoMode as _exitDemo } from "@/lib/demo";

// ── Local-only constants (used when Supabase isn't configured) ────────────────
const HASH_KEY    = "pgm_auth_hash";
const SESSION_KEY = "pgm_auth_session";
const REMEMBER_KEY = "pgm_auth_remember";

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text + "::pgm_salt_2025");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function isRememberValid(): boolean {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return false;
    const { expires } = JSON.parse(raw);
    return Date.now() < expires;
  } catch { return false; }
}

// ── Context type ──────────────────────────────────────────────────────────────

interface AuthContextType {
  /** Supabase User object — set only when Supabase is enabled and logged in */
  user: User | null;
  isAuthenticated: boolean;
  /** False only for brand-new localStorage users who haven't set a password */
  hasPassword: boolean;
  hydrated: boolean;
  demoMode: boolean;
  isSupabase: boolean;
  /** Sign in (email required when Supabase is enabled; ignored in local mode) */
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  /** Register — creates Supabase user OR stores local SHA-256 hash */
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsEmailConfirmation?: boolean }>;
  /** Legacy helper (still used by onboarding in local mode) */
  setPassword: (password: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  /** Send a password-reset email (Supabase only) */
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  /** Resend the signup confirmation email */
  resendConfirmation: (email: string) => Promise<{ error: string | null }>;
  exitDemo: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]                   = useState<User | null>(null);
  const [hasPassword, setHasPassword]     = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated]           = useState(false);
  const [demoMode, setDemoMode]           = useState(false);

  useEffect(() => {
    // ── Demo mode ─────────────────────────────────────────────────────────────
    if (isDemoMode()) {
      setDemoMode(true);
      setIsAuthenticated(true);
      setHasPassword(false);
      setHydrated(true);
      return;
    }

    // ── Supabase auth ─────────────────────────────────────────────────────────
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        setHasPassword(true); // Supabase always has password-based auth
        setHydrated(true);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
      });

      return () => subscription.unsubscribe();
    }

    // ── localStorage fallback ─────────────────────────────────────────────────
    const hash = localStorage.getItem(HASH_KEY);
    setHasPassword(!!hash);
    const hasSession = !!sessionStorage.getItem(SESSION_KEY) || isRememberValid();
    if (hash && hasSession) setIsAuthenticated(true);
    setHydrated(true);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string, remember = false): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return !error;
    }

    // localStorage: email is ignored, compare password hash
    const stored = localStorage.getItem(HASH_KEY);
    if (!stored) return false;
    const attempt = await sha256(password);
    if (attempt !== stored) return false;

    setIsAuthenticated(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, JSON.stringify({ expires: Date.now() + 7 * 24 * 60 * 60 * 1000 }));
    }
    return true;
  }, []);

  // ── Sign up (Supabase) / set password (localStorage) ─────────────────────

  const signUp = useCallback(async (email: string, password: string): Promise<{ error: string | null; needsEmailConfirmation?: boolean }> => {
    if (supabase) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // After email confirmation, Supabase redirects here → AppShell detects
          // isAuthenticated=true, isOnboarded=false → sends to /onboarding Step 1
          emailRedirectTo: `${appUrl}/onboarding`,
        },
      });
      if (error) return { error: error.message };
      const needsEmailConfirmation = !data.session && !!data.user;
      return { error: null, needsEmailConfirmation };
    }
    await setPasswordLocal(password);
    return { error: null };
  }, []);

  async function setPasswordLocal(password: string) {
    const hash = await sha256(password);
    localStorage.setItem(HASH_KEY, hash);
    setHasPassword(true);
    setIsAuthenticated(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  }

  const setPassword = useCallback(async (password: string) => {
    await setPasswordLocal(password);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    if (supabase) {
      supabase.auth.signOut();
    } else {
      setIsAuthenticated(false);
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  }, []);

  // ── Change password ───────────────────────────────────────────────────────

  const changePassword = useCallback(async (oldPass: string, newPass: string): Promise<boolean> => {
    if (supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      return !error;
    }
    const stored = localStorage.getItem(HASH_KEY);
    if (!stored) return false;
    const oldHash = await sha256(oldPass);
    if (oldHash !== stored) return false;
    localStorage.setItem(HASH_KEY, await sha256(newPass));
    return true;
  }, []);

  // ── Exit demo ─────────────────────────────────────────────────────────────

  const resendConfirmation = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: "Supabase not configured" };
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${appUrl}/onboarding` },
    });
    return { error: error?.message ?? null };
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ error: string | null }> => {
    if (!supabase) return { error: "Password reset via email requires Supabase to be configured." };
    // Use NEXT_PUBLIC_APP_URL so the link always points to production even when
    // the reset is triggered from a local dev machine.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const exitDemo = useCallback(() => {
    _exitDemo();
    setDemoMode(false);
    setIsAuthenticated(false);
    setHasPassword(false);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, hasPassword, hydrated, demoMode,
      isSupabase: isSupabaseEnabled,
      login, logout, signUp, setPassword, changePassword, resetPassword, resendConfirmation, exitDemo,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
