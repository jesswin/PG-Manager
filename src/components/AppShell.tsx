"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useOnboarding } from "@/store/OnboardingContext";
import { Menu, Bell, Search } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isOnboarded, hydrated } = useOnboarding();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isPayPage = pathname.startsWith("/pay");
  const isOnboardingPage = pathname.startsWith("/onboarding");
  const isFullscreen = isPayPage || isOnboardingPage;

  useEffect(() => {
    if (!hydrated) return;
    if (!isOnboarded && !isFullscreen) {
      router.push("/onboarding");
    }
  }, [hydrated, isOnboarded, isFullscreen, router]);

  function handleSearchSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/tenants?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  }

  // Waiting for localStorage hydration — show spinner to prevent flash
  if (!hydrated) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Pay page and onboarding page bypass the full shell layout
  if (isFullscreen) {
    return <main className="h-full overflow-y-auto">{children}</main>;
  }

  // Guard: don't render the dashboard while redirect is pending
  if (!isOnboarded) return null;

  return (
    <div className="flex h-full">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 lg:px-6 shrink-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100"
          >
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
            <OwnerAvatar />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function OwnerAvatar() {
  const { owner } = useOnboarding();
  const initials = owner.name
    ? owner.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "PG";
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ml-1">
      <span className="text-xs font-bold text-indigo-700">{initials}</span>
    </div>
  );
}
