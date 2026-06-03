"use client";

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { PaymentStatus } from "@/data/mock";
import StatusBadge from "@/components/StatusBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import { Search, ChevronDown, Download, TrendingUp, Clock, AlertTriangle, Plus, CheckCircle2, MessageCircle, Lock, CreditCard, Settings, Link2 } from "lucide-react";
import { whatsappUrl, rentReminderMessage } from "@/lib/whatsapp";
import { usePlan } from "@/store/PlanContext";
import UpgradeModal from "@/components/UpgradeModal";
import { useSettings } from "@/store/SettingsContext";
import { buildUpiPayPageUrl } from "@/lib/upi";
import Link from "next/link";
import { getRecentMonths, getCurrentMonthLabel, getPreviousMonthLabel, monthLabelToDueDate } from "@/lib/months";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";
const RECENT_MONTHS = getRecentMonths(8);
const ALL_MONTHS = ["All Months", ...RECENT_MONTHS];
const PAGE_SIZE = 10;

export default function PaymentsPage() {
  const { tenants, payments, addPayment, markPaymentPaid } = useApp();
  const { toasts, addToast, dismiss } = useToast();
  const { can } = usePlan();
  const { upi, isUpiConfigured } = useSettings();
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string; plan: "monthly" | "quarterly" }>({ open: false, feature: "", plan: "monthly" });

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState(getPreviousMonthLabel);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(() => {
    const curMonth = getCurrentMonthLabel();
    return { tenantId: "", amount: "", month: curMonth, dueDate: monthLabelToDueDate(curMonth), paidDate: new Date().toISOString().split("T")[0], status: "Paid" as PaymentStatus };
  });

  const selectedTenant = tenants.find((t) => t.id === form.tenantId);

  const filtered = payments.filter((p) => {
    const matchSearch = p.tenantName.toLowerCase().includes(search.toLowerCase()) || p.roomNumber.includes(search);
    const matchMonth = monthFilter === "All Months" || p.month === monthFilter;
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    return matchSearch && matchMonth && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statsBase = monthFilter === "All Months" ? payments : payments.filter((p) => p.month === monthFilter);
  const collected = statsBase.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pending = statsBase.filter((p) => p.status === "Unpaid").reduce((s, p) => s + p.amount, 0);
  const partial = statsBase.filter((p) => p.status === "Partial").reduce((s, p) => s + Math.round(p.amount / 2), 0);

  function handleMarkPaid(id: string) {
    markPaymentPaid(id);
    const p = payments.find((x) => x.id === id);
    if (p) addToast(`${p.tenantName}'s payment for ${p.month} marked as Paid.`);
  }

  function handleAddPayment(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedTenant) return;
    addPayment({
      tenantId: form.tenantId, tenantName: selectedTenant.name, roomNumber: selectedTenant.roomNumber,
      amount: Number(form.amount), month: form.month, dueDate: form.dueDate,
      paidDate: form.status === "Paid" ? form.paidDate : undefined, status: form.status,
    });
    setShowModal(false);
    const curMonth = getCurrentMonthLabel();
    setForm({ tenantId: "", amount: "", month: curMonth, dueDate: monthLabelToDueDate(curMonth), paidDate: new Date().toISOString().split("T")[0], status: "Paid" });
    addToast(`Payment of ₹${Number(form.amount).toLocaleString("en-IN")} recorded for ${selectedTenant.name}.`);
    setPage(1);
  }

  function exportCSV() {
    const rows = [["Tenant", "Room", "Month", "Amount", "Due Date", "Paid Date", "Status"], ...filtered.map((p) => [p.tenantName, p.roomNumber, p.month, p.amount, p.dueDate, p.paidDate || "", p.status])];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `payments-${monthFilter.replace(" ", "-")}.csv` });
    a.click(); URL.revokeObjectURL(a.href);
    addToast("Payments exported as CSV.", "info");
  }

  function handleSendUpiLink(paymentId: string) {
    const p = payments.find((x) => x.id === paymentId);
    if (!p || !isUpiConfigured) return;
    const t = tenants.find((x) => x.id === p.tenantId);
    const link = buildUpiPayPageUrl({
      tenantName: p.tenantName, roomNumber: p.roomNumber,
      amount: p.amount, month: p.month, phone: t?.phone || "",
      upiId: upi.upiId, upiName: upi.upiName || "PG Manager",
      pgName: upi.upiName || "PG Manager",
    });
    const msg =
      `Dear ${p.tenantName.split(" ")[0]},\n\n` +
      `Your rent of *₹${p.amount.toLocaleString("en-IN")}* for *${p.month}* (Room ${p.roomNumber}) is due.\n\n` +
      `👇 *Tap to pay:*\n${link}\n\n` +
      `💸 *Or pay directly via UPI:*\n` +
      `UPI ID: *${upi.upiId}*\n` +
      `Amount: *₹${p.amount.toLocaleString("en-IN")}*\n` +
      `Remarks: Room ${p.roomNumber} ${p.month}\n\n` +
      `Thank you! 🙏\n— PG Manager`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Payments" }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Track rent collections and dues</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => can("exportCsv") ? exportCSV() : setUpgradeModal({ open: true, feature: "Export Payments as CSV", plan: "monthly" })}
            className={`inline-flex items-center gap-2 px-4 py-2.5 border text-sm font-medium rounded-lg transition-colors shadow-sm ${can("exportCsv") ? "bg-white border-gray-200 text-gray-700 hover:bg-gray-50" : "bg-white border-gray-200 text-gray-400"}`}>
            {can("exportCsv") ? <Download size={15} className="text-gray-400" /> : <Lock size={15} className="text-gray-300" />} Export
          </button>
          <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus size={15} /> Record Payment
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: `Collected${monthFilter !== "All Months" ? ` – ${monthFilter}` : ""}`, value: collected, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending (Unpaid)", value: pending, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
          { label: "Partial Balance Due", value: partial, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}><Icon size={18} className={color} /></div>
            <div>
              <p className={`text-lg font-bold ${color}`}>&#8377;{value.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* UPI setup banner */}
      {!isUpiConfigured && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <CreditCard size={16} className="text-indigo-500 shrink-0" />
          <p className="text-sm text-indigo-700 flex-1">
            <span className="font-semibold">Send UPI payment links via WhatsApp.</span> Add your UPI ID in Settings to enable one-tap rent collection.
          </p>
          <Link href="/settings" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
            <Settings size={12} /> Set UPI ID
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search tenant, room..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
        </div>
        {[
          { val: monthFilter, set: (v: string) => { setMonthFilter(v); setPage(1); }, opts: ALL_MONTHS },
          { val: statusFilter, set: (v: string) => { setStatusFilter(v); setPage(1); }, opts: ["All", "Paid", "Unpaid", "Partial"] },
        ].map(({ val, set, opts }, i) => (
          <div key={i} className="relative">
            <select value={val} onChange={(e) => set(e.target.value)} className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 cursor-pointer">
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Room</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Month</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Paid Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">No payment records found.</td></tr>
              ) : paginated.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5"><p className="font-medium text-gray-900">{p.tenantName}</p></td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">Room {p.roomNumber}</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell">{p.month}</td>
                  <td className="px-4 py-3.5"><span className="font-semibold text-gray-800">&#8377;{p.amount.toLocaleString("en-IN")}</span></td>
                  <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">{new Date(p.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="px-4 py-3.5 text-gray-600 hidden lg:table-cell">{p.paidDate ? new Date(p.paidDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.status !== "Paid" && (() => {
                        const t = tenants.find((x) => x.id === p.tenantId);
                        if (!t) return null;
                        return can("whatsappIndividual") ? (
                          <a
                            href={whatsappUrl(t.phone, rentReminderMessage(t.name, t.roomNumber, p.amount, p.month, p.dueDate))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                          >
                            <MessageCircle size={13} /> WhatsApp
                          </a>
                        ) : (
                          <button onClick={() => setUpgradeModal({ open: true, feature: "WhatsApp Reminders", plan: "monthly" })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                            <Lock size={13} /> WhatsApp
                          </button>
                        );
                      })()}
                      {p.status !== "Paid" && isUpiConfigured && (
                        <button
                          onClick={() => handleSendUpiLink(p.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                          title="Send UPI payment link via WhatsApp"
                        >
                          <Link2 size={13} /> UPI Link
                        </button>
                      )}
                      {p.status !== "Paid" ? (
                        <button onClick={() => handleMarkPaid(p.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                          <CheckCircle2 size={13} /> Mark Paid
                        </button>
                      ) : <span className="text-xs text-gray-300 px-3">—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-white bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-7 h-7 text-xs rounded-md border transition-colors ${n === page ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-600 hover:bg-white"}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1 text-xs border border-gray-200 rounded-md text-gray-600 hover:bg-white bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      <UpgradeModal open={upgradeModal.open} onClose={() => setUpgradeModal({ ...upgradeModal, open: false })} featureName={upgradeModal.feature} requiredPlan={upgradeModal.plan} />

      {/* Record Payment Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tenant *</label>
            <select required className={inp} value={form.tenantId}
              onChange={(e) => { const t = tenants.find((x) => x.id === e.target.value); setForm({ ...form, tenantId: e.target.value, amount: t ? String(t.rentAmount) : "" }); }}>
              <option value="">Select tenant...</option>
              {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} – Room {t.roomNumber}</option>)}
            </select>
          </div>
          {selectedTenant && (
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center">
                <span className="text-xs font-bold text-indigo-700">{selectedTenant.avatar}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{selectedTenant.name}</p>
                <p className="text-xs text-gray-500">Room {selectedTenant.roomNumber} · ₹{selectedTenant.rentAmount.toLocaleString("en-IN")}/mo</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Month *</label>
              <select required className={inp} value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value, dueDate: monthLabelToDueDate(e.target.value) })}>
                {RECENT_MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Amount (₹) *</label>
              <input required type="number" className={inp} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="8500" min={0} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Due Date *</label>
              <input required type="date" className={inp} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Status *</label>
              <select required className={inp} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}>
                <option>Paid</option><option>Unpaid</option><option>Partial</option>
              </select></div>
          </div>
          {form.status === "Paid" && (
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Paid On</label>
              <input type="date" className={inp} value={form.paidDate} onChange={(e) => setForm({ ...form, paidDate: e.target.value })} /></div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Record Payment</button>
            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
