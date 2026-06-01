"use client";

import "./globals.css";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AppProvider } from "@/store/AppContext";
import { PlanProvider } from "@/store/PlanContext";
import { SettingsProvider } from "@/store/SettingsContext";
import { Menu, Bell, Search } from "lucide-react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isPayPage = pathname.startsWith("/pay");

  return (
    <html lang="en" className="h-full">
      <head>
        <title>PG Manager – Admin Panel</title>
        <meta name="description" content="PG Management SaaS Application" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full bg-gray-50">
        <PlanProvider>
        <SettingsProvider>
        <AppProvider>
        {isPayPage ? (
          <main className="h-full overflow-y-auto">{children}</main>
        ) : (
          <div className="flex h-full">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Top header */}
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
                      placeholder="Search tenants, rooms..."
                      className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center ml-1">
                    <span className="text-xs font-bold text-indigo-700">RA</span>
                  </div>
                </div>
              </header>

              {/* Page content */}
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        )}
        </AppProvider>
        </SettingsProvider>
        </PlanProvider>
      </body>
    </html>
  );
}
