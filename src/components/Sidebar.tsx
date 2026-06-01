"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlan } from "@/store/PlanContext";
import {
  LayoutDashboard, Users, DoorOpen, CreditCard,
  Bell, Building2, X, ChevronRight, Zap, Settings,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tenants", label: "Tenants", icon: Users },
  { href: "/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/notices", label: "Notices", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { plan } = usePlan();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-600",
    monthly: "bg-indigo-100 text-indigo-700",
    quarterly: "bg-purple-100 text-purple-700",
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-gray-50 border-r border-gray-200 z-30 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">PG Manager</p>
              <p className="text-xs text-gray-500 mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Main Menu</p>
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
                ${isActive(href)
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"}`}>
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive(href) ? "text-white" : "text-gray-400 group-hover:text-indigo-500"} />
                {label}
              </div>
              {isActive(href) && <ChevronRight size={14} className="text-indigo-200" />}
            </Link>
          ))}
        </nav>

        {/* Plan upgrade banner */}
        <div className="px-3 pb-2">
          <Link href="/pricing" onClick={onClose}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
              ${isActive("/pricing") ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm"}`}>
            <div className="flex items-center gap-3">
              <Zap size={18} className={isActive("/pricing") ? "text-white" : "text-gray-400 group-hover:text-indigo-500"} />
              Pricing
            </div>
            {isActive("/pricing")
              ? <ChevronRight size={14} className="text-indigo-200" />
              : <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${planColors[plan.id]}`}>{plan.name}</span>
            }
          </Link>

          {plan.id === "free" && (
            <Link href="/pricing" onClick={onClose}
              className="mt-2 flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              <Zap size={14} /> Upgrade to unlock all features
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-700">RA</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">Ramesh Agarwal</p>
              <p className={`text-[11px] font-medium truncate ${planColors[plan.id].split(" ")[1]}`}>{plan.name} Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
