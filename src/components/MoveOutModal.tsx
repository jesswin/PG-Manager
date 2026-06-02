"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { Tenant, SecurityRefundStatus } from "@/data/mock";
import { MoveOutData } from "@/store/AppContext";
import { LogOut, AlertCircle, IndianRupee, CalendarDays } from "lucide-react";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder:text-gray-400";

interface Props {
  open: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onConfirm: (tenantId: string, data: MoveOutData) => void;
}

export default function MoveOutModal({ open, tenant, onClose, onConfirm }: Props) {
  const [form, setForm] = useState<MoveOutData>({
    moveOutDate: new Date().toISOString().split("T")[0],
    moveOutReason: "",
    securityRefundStatus: "FullRefund",
    securityRefundAmount: 0,
    moveOutNotes: "",
  });

  // Sync deposit amount when tenant changes or refund status changes
  function getDefaultAmount(): number {
    if (!tenant) return 0;
    if (form.securityRefundStatus === "FullRefund") return tenant.securityDeposit;
    if (form.securityRefundStatus === "NoRefund") return 0;
    return form.securityRefundAmount;
  }

  function setRefundStatus(status: SecurityRefundStatus) {
    const amount = status === "FullRefund"
      ? (tenant?.securityDeposit ?? 0)
      : status === "NoRefund" ? 0 : form.securityRefundAmount;
    setForm((f) => ({ ...f, securityRefundStatus: status, securityRefundAmount: amount }));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tenant) return;
    onConfirm(tenant.id, { ...form, securityRefundAmount: getDefaultAmount() });
    onClose();
  }

  if (!tenant) return null;

  const pendingRent = 0; // could compute from payments context if needed

  return (
    <Modal open={open} onClose={onClose} title="Tenant Move-Out" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Tenant summary */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-red-600">{tenant.avatar}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{tenant.name}</p>
            <p className="text-xs text-gray-500">Room {tenant.roomNumber} · Joined {new Date(tenant.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Security Deposit</p>
            <p className="text-sm font-semibold text-gray-800">₹{tenant.securityDeposit.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {pendingRent > 0 && (
          <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <AlertCircle size={13} className="shrink-0" />
            This tenant has ₹{pendingRent.toLocaleString("en-IN")} in pending rent. Please settle before move-out.
          </div>
        )}

        {/* Move-out date */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
            <CalendarDays size={12} /> Move-Out Date *
          </label>
          <input required type="date" className={inp} value={form.moveOutDate}
            onChange={(e) => setForm({ ...form, moveOutDate: e.target.value })} />
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Reason for Leaving</label>
          <select className={inp} value={form.moveOutReason}
            onChange={(e) => setForm({ ...form, moveOutReason: e.target.value })}>
            <option value="">Select reason…</option>
            <option>Job transfer / Relocation</option>
            <option>Bought own house</option>
            <option>Better accommodation found</option>
            <option>Completed course / studies</option>
            <option>Personal reasons</option>
            <option>Rent increase</option>
            <option>Eviction</option>
            <option>Other</option>
          </select>
        </div>

        {/* Security deposit refund */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
            <IndianRupee size={12} /> Security Deposit Refund
          </label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {([
              { id: "FullRefund",    label: "Full Refund",    sub: `₹${(tenant.securityDeposit).toLocaleString("en-IN")}` },
              { id: "PartialRefund", label: "Partial Refund", sub: "Custom amount" },
              { id: "NoRefund",      label: "No Refund",      sub: "₹0" },
            ] as { id: SecurityRefundStatus; label: string; sub: string }[]).map(({ id, label, sub }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRefundStatus(id)}
                className={`p-2.5 rounded-xl border text-left transition-colors ${
                  form.securityRefundStatus === id
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
              </button>
            ))}
          </div>

          {form.securityRefundStatus === "PartialRefund" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Refund Amount (₹)</label>
              <input type="number" min={0} max={tenant.securityDeposit} className={inp}
                placeholder={`Max ₹${tenant.securityDeposit.toLocaleString("en-IN")}`}
                value={form.securityRefundAmount || ""}
                onChange={(e) => setForm({ ...form, securityRefundAmount: Number(e.target.value) })} />
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (optional)</label>
          <textarea rows={2} className={`${inp} resize-none`}
            placeholder="Condition of room, any damages, final remarks…"
            value={form.moveOutNotes}
            onChange={(e) => setForm({ ...form, moveOutNotes: e.target.value })} />
        </div>

        {/* Summary */}
        <div className="bg-red-50 rounded-xl border border-red-100 p-3 text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-red-700 flex items-center gap-1"><LogOut size={12} /> Move-Out Summary</p>
          <p>Tenant: <strong>{tenant.name}</strong> · Room {tenant.roomNumber}</p>
          <p>Move-out date: <strong>{form.moveOutDate || "—"}</strong></p>
          <p>Security refund: <strong>₹{getDefaultAmount().toLocaleString("en-IN")} ({form.securityRefundStatus === "FullRefund" ? "Full" : form.securityRefundStatus === "NoRefund" ? "None" : "Partial"})</strong></p>
          <p className="text-red-600 font-medium">Room {tenant.roomNumber} will be marked as Vacant.</p>
        </div>

        <div className="flex gap-3 pt-1">
          <button type="submit"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors">
            <LogOut size={15} /> Confirm Move-Out
          </button>
          <button type="button" onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
