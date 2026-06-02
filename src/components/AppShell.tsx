"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/store/AuthContext";
import { useOnboarding } from "@/store/OnboardingContext";
import { useSettings } from "@/store/SettingsContext";
import { useAutoNotify } from "@/hooks/useAutoNotify";
import { Menu, Bell, Search, CheckCircle2, X, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hasPassword, hydrated: authHydrated, demoMode, exitDemo } = useAuth();
  const { isOnboarded, hydrated: onboardingHydrated, owner } = useOnboarding();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const isPayPage = pathname.startsWith("/pay");
  const isOnboardingPage = pathname.startsWith("/onboarding");
  const isLoginPage = pathname.startsWith("/login");
  const isDemoPage = pathname.startsWith("/demo");
  const isSlidesPage = pathname.startsWith("/slides");
  const isFullscreen = isPayPage || isOnboardingPage || isLoginPage || isDemoPage || isSlidesPage;

  const bothHydrated = authHydrated && onboardingHydrated;

  useEffect(() => {
    if (!bothHydrated) return;
    if (isFullscreen) return;
    // All unauthenticated visitors — new or returning — land on the demo/landing page.
    // From there they choose "Get Started" (onboarding) or "Sign In" (login).
    if (!isAuthenticated && !demoMode) {
      router.push("/demo");
    }
  }, [bothHydrated, isAuthenticated, demoMode, isFullscreen, router]);

  const { isEmailConfigured, isSmsConfigured } = useSettings();
  const notifyResult = useAutoNotify(
    isAuthenticated && isOnboarded && !isFullscreen && (isEmailConfigured || isSmsConfigured)
  );

  useEffect(() => {
    if (notifyResult.ran && notifyResult.sent > 0) {
      const channels = [isEmailConfigured && "email", isSmsConfigured && "SMS"].filter(Boolean).join(" & ");
      setToastMsg(`Auto-sent ${notifyResult.sent} rent reminder${notifyResult.sent > 1 ? "s" : ""} via ${channels}.`);
      setToastVisible(true);
      const t = setTimeout(() => setToastVisible(false), 6000);
      return () => clearTimeout(t);
    }
  }, [notifyResult.ran, notifyResult.sent, isEmailConfigured, isSmsConfigured]);

  function handleSearchSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/tenants?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  }

  if (!bothHydrated) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isFullscreen) {
    return <main className="h-full overflow-y-auto">{children}</main>;
  }

  // Don't render the dashboard while redirecting to /demo
  if (!isAuthenticated && !demoMode) return null;

  return (
    <div className="flex flex-col h-full">

      {/* Demo mode banner */}
      {demoMode && (
        <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold">
          <div className="flex items-center gap-2">
            <Zap size={13} fill="currentColor" />
            <span>Demo Mode — exploring with sample data. Nothing is saved.</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/onboarding"
              onClick={exitDemo}
              className="inline-flex items-center gap-1 px-3 py-1 bg-white text-amber-700 rounded-lg font-bold hover:bg-amber-50 transition-colors"
            >
              Sign up free <ArrowRight size={11} />
            </Link>
            <button
              onClick={() => { exitDemo(); window.location.href = "/demo"; }}
              className="text-amber-200 hover:text-white px-1"
            >
              Exit
            </button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 lg:px-6 shrink-0 z-10">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100">
              <Menu size={20} />
            </button>

            <div className="flex-1 max-w-sm hidden sm:flex">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchSubmit}
                  placeholder="Search tenants, rooms… (Enter)"
                  className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <OwnerAvatar name={owner.name} />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      {/* Auto-notify toast */}
      {toastVisible && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl shadow-lg max-w-sm">
          <CheckCircle2 size={17} className="shrink-0" />
          <span className="flex-1">{toastMsg}</span>
          <button onClick={() => setToastVisible(false)} className="text-emerald-200 hover:text-white ml-1">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function OwnerAvatar({ name }: { name: string }) {
  const initials = name ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "PG";
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ml-1">
      <span className="text-xs font-bold text-indigo-700">{initials}</span>
    </div>
  );
}
