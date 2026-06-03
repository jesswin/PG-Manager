"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/store/AppContext";
import { PaymentStatus } from "@/data/mock";
import TenantOnboardingForm from "@/components/TenantOnboardingForm";
import type { TenantFormData } from "@/components/TenantOnboardingForm";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import Link from "next/link";
import {
  Users, DoorOpen, TrendingUp, AlertCircle, ArrowUpRight,
  CreditCard, Bell, UserPlus, CheckCircle2, Send, MessageCircle, Clock, Lock, Link2, Zap,
} from "lucide-react";
import { whatsappUrl, rentReminderWithLink, rentReminderMessage } from "@/lib/whatsapp";
import { buildUpiPayPageUrl } from "@/lib/upi";
import { usePlan } from "@/store/PlanContext";
import UpgradeModal from "@/components/UpgradeModal";
import { useSettings } from "@/store/SettingsContext";
import { useOnboarding } from "@/store/OnboardingContext";
import { getRecentMonths, getCurrentMonthLabel, getPreviousMonthLabel, monthLabelToDueDate } from "@/lib/months";

const RECENT_MONTHS = getRecentMonths(8);

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";

const EMPTY_NOTICE = { title: "", message: "", recipientId: "all" };

export default function DashboardPage() {
  const { tenants, rooms, payments, activity, addTenant, addPayment, addNotice } = useApp();
  const { toasts, addToast, dismiss } = useToast();

  const { can } = usePlan();
  const { upi, isUpiConfigured } = useSettings();
  const { owner, activePg } = useOnboarding();
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string; plan: "monthly" | "quarterly" }>({ open: false, feature: "", plan: "monthly" });
  const [autoSendDismissed, setAutoSendDismissed] = useState(false);
  const [autoSendReady, setAutoSendReady] = useState(false);

  // Detect due-soon reminders on mount and flag for auto-send banner
  useEffect(() => {
    const dueSoon = dueReminders.filter((r) => r.diffDays <= 3 && r.diffDays >= -1);
    if (dueSoon.length > 0 && can("whatsappIndividual")) {
      setAutoSendReady(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [modal, setModal] = useState<"tenant" | "payment" | "notice" | null>(null);
  const [paymentTenantId, setPaymentTenantId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMonth, setPaymentMonth] = useState(getCurrentMonthLabel);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Paid");
  const [noticeForm, setNoticeForm] = useState({ ...EMPTY_NOTICE });

  const totalTenants = tenants.length;
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === "Occupied").length;
  const occupancyRate = totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const prevMonth = getPreviousMonthLabel();
  const currentMonthPayments = payments.filter((p) => p.month === prevMonth);
  const pendingAmount = currentMonthPayments
    .filter((p) => p.status !== "Paid")
    .reduce((sum, p) => sum + (p.status === "Unpaid" ? p.amount : Math.round(p.amount / 2)), 0);
  const collectedAmount = currentMonthPayments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: "Total Tenants", value: totalTenants, sub: `${occupiedRooms} rooms occupied`, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", trend: "+2 this month", trendUp: true },
    { label: "Total Rooms", value: totalRooms, sub: `${totalRooms - occupiedRooms} vacant`, icon: DoorOpen, color: "text-purple-600", bg: "bg-purple-50", trend: "3 floors", trendNull: true },
    { label: "Occupancy Rate", value: `${occupancyRate}%`, sub: `${occupiedRooms} of ${totalRooms} rooms`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+5% vs last month", trendUp: true },
    { label: "Pending Rent", value: `₹${pendingAmount.toLocaleString("en-IN")}`, sub: prevMonth, icon: AlertCircle, color: "text-red-500", bg: "bg-red-50", trend: `₹${collectedAmount.toLocaleString("en-IN")} collected`, trendUp: false },
  ];

  const vacantRooms = rooms.filter((r) => r.status === "Vacant");

  // Build due-reminder list: unpaid/partial payments, one per tenant (most recent month)
  const dueReminders = (() => {
    const today = new Date();
    const seen = new Set<string>();
    return payments
      .filter((p) => p.status !== "Paid")
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .filter((p) => {
        if (seen.has(p.tenantId)) return false;
        seen.add(p.tenantId);
        return true;
      })
      .map((p) => {
        const tenant = tenants.find((t) => t.id === p.tenantId);
        const due = new Date(p.dueDate);
        const diffDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);
        return { payment: p, tenant, diffDays };
      })
      .filter((r) => r.tenant)
      .sort((a, b) => a.diffDays - b.diffDays);
  })();

  function buildPayLink(p: { tenantName: string; roomNumber: string; amount: number; month: string }, t: { phone: string }): string {
    if (!isUpiConfigured) return "";
    return buildUpiPayPageUrl({
      tenantName: p.tenantName, roomNumber: p.roomNumber,
      amount: p.amount, month: p.month, phone: t.phone,
      upiId: upi.upiId, upiName: upi.upiName || activePg?.name || "PGNest",
      pgName: activePg?.name || "PGNest",
    });
  }

  function getReminderMsg(p: { tenantName: string; roomNumber: string; amount: number; month: string; dueDate: string }, t: { phone: string }) {
    const link = buildPayLink(p, t);
    const upiIdValue = upi.upiId?.trim();
    // Always use rentReminderWithLink when either a pay-page link OR a UPI ID is available.
    // This way tenants get the UPI ID even if the full link couldn't be built.
    if (link || upiIdValue) {
      return rentReminderWithLink(p.tenantName, p.roomNumber, p.amount, p.month, link, p.dueDate, upiIdValue || undefined);
    }
    return rentReminderMessage(p.tenantName, p.roomNumber, p.amount, p.month, p.dueDate);
  }

  function sendAllReminders() {
    if (!isUpiConfigured) {
      addToast("⚠️ UPI ID not configured — messages sent without payment link. Go to Settings → Add UPI ID.", "error");
    }
    dueReminders.forEach(({ payment: p, tenant: t }, i) => {
      if (!t) return;
      setTimeout(() => {
        window.open(whatsappUrl(t.phone, getReminderMsg(p, t)), "_blank");
      }, i * 600);
    });
    setAutoSendDismissed(true);
  }

  function handleAddTenant(data: TenantFormData) {
    addTenant(data);
    setModal(null);
    addToast(`${data.name} added as a new tenant.`);
  }

  function handleAddPayment(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = tenants.find((x) => x.id === paymentTenantId);
    if (!t) return;
    addPayment({
      tenantId: t.id, tenantName: t.name, roomNumber: t.roomNumber,
      amount: Number(paymentAmount), month: paymentMonth,
      dueDate: monthLabelToDueDate(paymentMonth),
      paidDate: paymentStatus === "Paid" ? new Date().toISOString().split("T")[0] : undefined,
      status: paymentStatus,
    });
    setModal(null);
    setPaymentTenantId(""); setPaymentAmount(""); setPaymentStatus("Paid");
    addToast(`Payment of ₹${Number(paymentAmount).toLocaleString("en-IN")} recorded for ${t.name}.`);
  }

  function handleSendNotice(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const recipient = noticeForm.recipientId === "all"
      ? "All Tenants"
      : tenants.find((t) => t.id === noticeForm.recipientId)?.name ?? "All Tenants";
    addNotice({
      title: noticeForm.title, message: noticeForm.message,
      recipient, recipientId: noticeForm.recipientId === "all" ? undefined : noticeForm.recipientId,
      status: "Sent", createdAt: new Date().toISOString().split("T")[0],
      sentAt: new Date().toISOString().split("T")[0],
    });
    setModal(null);
    setNoticeForm({ ...EMPTY_NOTICE });
    addToast(`Notice sent to ${recipient}.`);
  }

  const selectedPaymentTenant = tenants.find((t) => t.id === paymentTenantId);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* UPI status — always visible so owner knows immediately */}
      {isUpiConfigured ? (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <p className="text-sm text-emerald-700 flex-1">
            UPI configured: <strong>{upi.upiId}</strong> — payment link will be included in WhatsApp reminders.
          </p>
          <Link href="/settings" className="text-xs text-emerald-600 hover:underline shrink-0">Change</Link>
        </div>
      ) : (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 flex-1">
            <span className="font-semibold">UPI ID not set up.</span> WhatsApp messages will be sent WITHOUT a payment link. Go to Settings and add your UPI ID to enable payments.
          </p>
          <Link href="/settings" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600 transition-colors shrink-0">
            Add UPI ID →
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {owner.name || "there"}. Here&apos;s what&apos;s happening at {activePg?.name || "your PG"}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon size={20} className={stat.color} />
              </div>
              {stat.trendNull ? (
                <span className="text-xs font-medium text-gray-500">{stat.trend}</span>
              ) : stat.trendUp ? (
                <span className="text-xs font-medium flex items-center gap-0.5 text-emerald-600"><ArrowUpRight size={12} />{stat.trend}</span>
              ) : (
                <span className="text-xs font-medium text-red-500">{stat.trend}</span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Recent Tenants */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Recent Tenants</h2>
            <Link href="/tenants" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">View all <ArrowUpRight size={12} /></Link>
          </div>
          <div className="divide-y divide-gray-50">
            {tenants.slice(0, 5).map((tenant) => (
              <div key={tenant.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-indigo-700">{tenant.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tenant.name}</p>
                  <p className="text-xs text-gray-500">Room {tenant.roomNumber} &middot; Joined {new Date(tenant.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">&#8377;{tenant.rentAmount.toLocaleString("en-IN")}</p>
                  <StatusBadge status={tenant.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
            <CheckCircle2 size={16} className="text-gray-300" />
          </div>
          <div className="px-5 py-3 divide-y divide-gray-50">
            {activity.slice(0, 7).map((item) => (
              <div key={item.id} className="flex gap-3 py-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  item.type === "payment" ? "bg-emerald-100" : item.type === "notice" ? "bg-indigo-100" : "bg-purple-100"
                }`}>
                  {item.type === "payment" && <CreditCard size={14} className="text-emerald-600" />}
                  {item.type === "notice" && <Bell size={14} className="text-indigo-600" />}
                  {item.type === "tenant" && <UserPlus size={14} className="text-purple-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 leading-relaxed">{item.message}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-send banner — shown on mount when dues are near */}
      {autoSendReady && !autoSendDismissed && dueReminders.filter((r) => r.diffDays <= 3).length > 0 && (
        <div className="mb-5 flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <Zap size={16} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {dueReminders.filter((r) => r.diffDays <= 3 && r.diffDays >= -1).length} tenant{dueReminders.filter((r) => r.diffDays <= 3 && r.diffDays >= -1).length > 1 ? "s have" : " has"} rent due within 3 days
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {isUpiConfigured ? "UPI payment links will be included in the WhatsApp message." : "Add your UPI ID in Settings to include payment links."}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isUpiConfigured && (
              <Link href="/settings" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                <Link2 size={12} /> Add UPI ID
              </Link>
            )}
            {can("whatsappBulk") ? (
              <button onClick={sendAllReminders}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                <MessageCircle size={13} /> Send All Now
              </button>
            ) : (
              <button onClick={() => setUpgradeModal({ open: true, feature: "Bulk WhatsApp Reminders", plan: "quarterly" })}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                <Lock size={12} /> Send All
              </button>
            )}
            <button onClick={() => setAutoSendDismissed(true)} className="text-amber-400 hover:text-amber-600 text-xs px-2 py-1.5">Dismiss</button>
          </div>
        </div>
      )}

      {/* Due Reminders */}
      {dueReminders.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-800">Pending Rent Reminders</h2>
              <span className="ml-1 px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-bold rounded-full">{dueReminders.length}</span>
            </div>
            {can("whatsappBulk") ? (
              <button onClick={sendAllReminders} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm">
                <MessageCircle size={14} /> {isUpiConfigured ? "Send All + Payment Links" : "Send All via WhatsApp"}
              </button>
            ) : (
              <button onClick={() => setUpgradeModal({ open: true, feature: "Bulk WhatsApp — Send All Reminders", plan: "quarterly" })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-500 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                <Lock size={13} /> Send All via WhatsApp
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {dueReminders.map(({ payment: p, tenant: t, diffDays }) => {
              if (!t) return null;
              const isOverdue = diffDays < 0;
              const isDueSoon = diffDays >= 0 && diffDays <= 3;
              const msgUrl = can("whatsappIndividual")
                ? whatsappUrl(t.phone, getReminderMsg(p, t))
                : "";
              return (
                <div key={p.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-indigo-700">{t.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">Room {t.roomNumber} &middot; {p.month}</p>
                  </div>
                  <div className="text-right mr-4 shrink-0">
                    <p className="text-sm font-semibold text-gray-800">₹{p.amount.toLocaleString("en-IN")}</p>
                    <p className={`text-xs font-medium ${isOverdue ? "text-red-500" : isDueSoon ? "text-amber-500" : "text-gray-400"}`}>
                      {isOverdue ? `${Math.abs(diffDays)}d overdue` : diffDays === 0 ? "Due today" : `Due in ${diffDays}d`}
                    </p>
                  </div>
                  {can("whatsappIndividual") ? (
                    <a href={msgUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-medium rounded-lg transition-colors shrink-0">
                      <MessageCircle size={13} />
                      {isUpiConfigured ? "Send Link" : "WhatsApp"}
                    </a>
                  ) : (
                    <button onClick={() => setUpgradeModal({ open: true, feature: "WhatsApp Reminders", plan: "monthly" })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-400 text-xs font-medium rounded-lg transition-colors shrink-0 hover:bg-gray-200">
                      <Lock size={13} /> WhatsApp
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {isUpiConfigured && (
            <div className="px-6 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
              <Link2 size={11} className="text-indigo-400" />
              <p className="text-xs text-gray-500">Payment links included in all messages — tenant can pay directly from WhatsApp.</p>
            </div>
          )}
        </div>
      )}

      <UpgradeModal open={upgradeModal.open} onClose={() => setUpgradeModal({ ...upgradeModal, open: false })} featureName={upgradeModal.feature} requiredPlan={upgradeModal.plan} />

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setModal("tenant")} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <UserPlus size={16} /> Add Tenant
          </button>
          <button onClick={() => setModal("payment")} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <CreditCard size={16} className="text-gray-400" /> Record Payment
          </button>
          <button onClick={() => setModal("notice")} className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <Bell size={16} className="text-gray-400" /> Send Notice
          </button>
          <Link href="/rooms" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
            <DoorOpen size={16} className="text-gray-400" /> View Rooms
          </Link>
        </div>
      </div>

      {/* Add Tenant Modal */}
      <Modal open={modal === "tenant"} onClose={() => setModal(null)} title="Add New Tenant" size="xl">
        <TenantOnboardingForm
          vacantRooms={vacantRooms}
          onSubmit={handleAddTenant}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Record Payment Modal */}
      <Modal open={modal === "payment"} onClose={() => setModal(null)} title="Record Payment">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tenant *</label>
            <select required className={inp} value={paymentTenantId}
              onChange={(e) => { const t = tenants.find((x) => x.id === e.target.value); setPaymentTenantId(e.target.value); setPaymentAmount(t ? String(t.rentAmount) : ""); }}>
              <option value="">Select tenant...</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} – Room {t.roomNumber}</option>)}
            </select>
          </div>
          {selectedPaymentTenant && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-700">{selectedPaymentTenant.avatar}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{selectedPaymentTenant.name}</p>
                <p className="text-xs text-gray-500">Room {selectedPaymentTenant.roomNumber} · ₹{selectedPaymentTenant.rentAmount.toLocaleString("en-IN")}/mo</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Month *</label>
              <select required className={inp} value={paymentMonth} onChange={(e) => setPaymentMonth(e.target.value)}>
                {RECENT_MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount (₹) *</label>
              <input required type="number" className={inp} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="8500" min={0} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status *</label>
              <select required className={inp} value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
                <option>Paid</option><option>Unpaid</option><option>Partial</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Record Payment</button>
            <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Send Notice Modal */}
      <Modal open={modal === "notice"} onClose={() => setModal(null)} title="Send Notice">
        <form onSubmit={handleSendNotice} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Title *</label>
            <input required className={inp} placeholder="e.g. Water Supply Interruption" value={noticeForm.title}
              onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Message *</label>
            <textarea required rows={5} className={`${inp} resize-none`} placeholder="Write your notice here..." value={noticeForm.message}
              onChange={(e) => setNoticeForm({ ...noticeForm, message: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Recipient *</label>
            <select required className={inp} value={noticeForm.recipientId} onChange={(e) => setNoticeForm({ ...noticeForm, recipientId: e.target.value })}>
              <option value="all">All Tenants</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} – Room {t.roomNumber}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Send size={15} /> Send Notice
            </button>
            <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
