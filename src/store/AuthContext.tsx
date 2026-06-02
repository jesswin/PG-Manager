"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { isDemoMode, exitDemoMode as _exitDemo } from "@/lib/demo";

const HASH_KEY = "pgm_auth_hash";
const SESSION_KEY = "pgm_auth_session";  // sessionStorage — cleared on tab close
const REMEMBER_KEY = "pgm_auth_remember"; // localStorage — persists

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text + "::pgm_salt_2025");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isRememberValid(): boolean {
  try {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return false;
    const { expires } = JSON.parse(raw);
    return Date.now() < expires;
  } catch { return false; }
}

interface AuthContextType {
  isAuthenticated: boolean;
  hasPassword: boolean;
  hydrated: boolean;
  demoMode: boolean;
  login: (password: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
  setPassword: (password: string) => Promise<void>;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  exitDemo: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hasPassword, setHasPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Demo mode: bypass all auth checks
    if (isDemoMode()) {
      setDemoMode(true);
      setIsAuthenticated(true);
      setHasPassword(false); // no real password in demo
      setHydrated(true);
      return;
    }

    const hash = localStorage.getItem(HASH_KEY);
    setHasPassword(!!hash);

    // Restore session: sessionStorage (tab-scoped) or valid remember-me
    const hasSession = !!sessionStorage.getItem(SESSION_KEY) || isRememberValid();
    if (hash && hasSession) setIsAuthenticated(true);

    setHydrated(true);
  }, []);

  const login = useCallback(async (password: string, remember = false): Promise<boolean> => {
    const stored = localStorage.getItem(HASH_KEY);
    if (!stored) return false;
    const attempt = await sha256(password);
    if (attempt !== stored) return false;

    setIsAuthenticated(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    if (remember) {
      localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({ expires: Date.now() + 7 * 24 * 60 * 60 * 1000 })
      );
    }
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(REMEMBER_KEY);
  }, []);

  const setPassword = useCallback(async (password: string) => {
    const hash = await sha256(password);
    localStorage.setItem(HASH_KEY, hash);
    setHasPassword(true);
    setIsAuthenticated(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  const changePassword = useCallback(async (oldPass: string, newPass: string): Promise<boolean> => {
    const stored = localStorage.getItem(HASH_KEY);
    if (!stored) return false;
    const oldHash = await sha256(oldPass);
    if (oldHash !== stored) return false;
    const newHash = await sha256(newPass);
    localStorage.setItem(HASH_KEY, newHash);
    return true;
  }, []);

  const exitDemo = useCallback(() => {
    _exitDemo();
    setDemoMode(false);
    setIsAuthenticated(false);
    setHasPassword(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, hasPassword, hydrated, demoMode, login, logout, setPassword, changePassword, exitDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
