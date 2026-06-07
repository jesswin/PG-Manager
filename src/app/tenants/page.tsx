"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/store/AppContext";
import { Tenant } from "@/data/mock";
import TenantOnboardingForm from "@/components/TenantOnboardingForm";
import type { TenantFormData } from "@/components/TenantOnboardingForm";
import MoveOutModal from "@/components/MoveOutModal";
import type { MoveOutData } from "@/store/AppContext";
import StatusBadge from "@/components/StatusBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import Link from "next/link";
import {
  Search, UserPlus, Eye, Pencil, Trash2, ChevronDown, X,
  MessageCircle, Lock, LogOut, ChevronRight, History,
} from "lucide-react";
import { whatsappUrl, rentReminderMessage, rentReminderWithLink } from "@/lib/whatsapp";
import { buildUpiPayPageUrl } from "@/lib/upi";
import { getCurrentMonthLabel } from "@/lib/months";
import { usePlan } from "@/store/PlanContext";
import UpgradeModal from "@/components/UpgradeModal";
import { useSettings } from "@/store/SettingsContext";
import { useOnboarding } from "@/store/OnboardingContext";

export default function TenantsPage() {
  const { tenants, rooms, addTenant, editTenant, deleteTenant, moveOutTenant } = useApp();
  const { toasts, addToast, dismiss } = useToast();
  const { can } = usePlan();
  const { upi, isUpiConfigured } = useSettings();
  const { activePg } = useOnboarding();
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string; plan: "monthly" | "quarterly" }>({ open: false, feature: "", plan: "monthly" });
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearch(q);
  }, [searchParams]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [showHistorySection, setShowHistorySection] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Tenant | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Tenant | null>(null);
  const [moveOutTarget, setMoveOutTarget] = useState<Tenant | null>(null);

  const vacantRooms = rooms.filter((r) => r.status === "Vacant");

  // For editing: include the tenant's current room by room number (reliable fallback
  // if tenantId isn't set on the room object) PLUS all vacant rooms.
  const roomsForEdit = (t: Tenant) => {
    const currentRoom = rooms.find((r) => r.number === t.roomNumber);
    const alreadyInVacant = vacantRooms.some((v) => v.number === t.roomNumber);
    const extras = currentRoom && !alreadyInVacant ? [currentRoom] : [];
    return [...extras, ...vacantRooms];
  };

  // Split active vs moved-out
  const activeTenants = tenants.filter((t) => (t.tenantStatus ?? "Active") === "Active");
  const movedOutTenants = tenants.filter((t) => t.tenantStatus === "MovedOut");

  const filteredActive = activeTenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.roomNumber.includes(search) ||
      t.phone.includes(search);
    const matchStatus = statusFilter === "All" || t.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredHistory = movedOutTenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.roomNumber.includes(search) ||
    t.phone.includes(search)
  );

  function handleAddTenant(data: TenantFormData) {
    addTenant({ ...data, tenantStatus: "Active" });
    setShowAddModal(false);
    addToast(`${data.name} added as a new tenant.`);
  }

  function handleEditTenant(data: TenantFormData) {
    if (!editTarget) return;
    editTenant(editTarget.id, data);
    setEditTarget(null);
    addToast(`${data.name}'s details updated.`);
  }

  function handleDelete(t: Tenant) {
    deleteTenant(t.id);
    setDeleteConfirm(null);
    addToast(`${t.name} has been removed.`, "info");
  }

  function handleMoveOut(tenantId: string, data: MoveOutData) {
    moveOutTenant(tenantId, data);
    const t = tenants.find((x) => x.id === tenantId);
    addToast(`${t?.name} has been moved out.`, "info");
  }

  const currentMonth = getCurrentMonthLabel();

  function getTenantReminderMsg(tenant: Tenant): string {
    if (isUpiConfigured) {
      const link = buildUpiPayPageUrl({
        tenantName: tenant.name, roomNumber: tenant.roomNumber,
        amount: tenant.rentAmount, month: currentMonth, phone: tenant.phone,
        upiId: upi.upiId, upiName: upi.upiName || activePg?.name || "PGNest",
        pgName: activePg?.name || "PGNest",
      });
      return rentReminderWithLink(tenant.name, tenant.roomNumber, tenant.rentAmount, currentMonth, link, "", upi.upiId);
    }
    return rentReminderMessage(tenant.name, tenant.roomNumber, tenant.rentAmount, currentMonth, "");
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Tenants" }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeTenants.length} active · {movedOutTenants.length} moved out
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <UserPlus size={16} /> Add Tenant
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, room, phone..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 cursor-pointer">
            <option>All</option><option>Paid</option><option>Unpaid</option><option>Partial</option>
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Active Tenants Table ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Room</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Rent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Move-in</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredActive.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No active tenants found.</td></tr>
              )}
              {filteredActive.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-indigo-700">{tenant.avatar}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tenant.name}</p>
                        <p className="text-xs text-gray-500">{tenant.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">Room {tenant.roomNumber}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="font-medium text-gray-800">&#8377;{tenant.rentAmount.toLocaleString("en-IN")}</span>
                    <span className="text-gray-400 text-xs">/mo</span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell">
                    {new Date(tenant.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={tenant.paymentStatus} /></td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/tenants/${tenant.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                        <Eye size={13} /> View
                      </Link>
                      {/* Only show WhatsApp button for unpaid/partial tenants */}
                      {tenant.paymentStatus !== "Paid" && (
                        can("whatsappIndividual") ? (
                          <a href={whatsappUrl(tenant.phone, getTenantReminderMsg(tenant))}
                            target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                            title="Send reminder">
                            <MessageCircle size={13} />
                          </a>
                        ) : (
                          <button onClick={() => setUpgradeModal({ open: true, feature: "WhatsApp Reminders", plan: "monthly" })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                            <Lock size={13} />
                          </button>
                        )
                      )}
                      <button onClick={() => setEditTarget(tenant)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setMoveOutTarget(tenant)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        title="Move Out">
                        <LogOut size={13} /> Move Out
                      </button>
                      <button onClick={() => setDeleteConfirm(tenant)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">Showing {filteredActive.length} of {activeTenants.length} active tenants</p>
        </div>
      </div>

      {/* ── Move-Out History ─────────────────────────────────────────────────── */}
      {movedOutTenants.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowHistorySection((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <History size={16} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Previous Tenants</span>
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                {filteredHistory.length}
              </span>
            </div>
            <ChevronRight size={16} className={`text-gray-400 transition-transform ${showHistorySection ? "rotate-90" : ""}`} />
          </button>

          {showHistorySection && (
            <div className="border-t border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tenant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Room</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Move-in</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Move-out</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Reason</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">Security Refund</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredHistory.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-gray-50/50 opacity-80">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-gray-500">{tenant.avatar}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">{tenant.name}</p>
                            <p className="text-xs text-gray-400">{tenant.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-xs font-medium">Room {tenant.roomNumber}</span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs hidden sm:table-cell">
                        {new Date(tenant.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 text-xs">
                        {tenant.moveOutDate
                          ? new Date(tenant.moveOutDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 text-xs hidden md:table-cell">{tenant.moveOutReason || "—"}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {tenant.securityRefundStatus ? (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            tenant.securityRefundStatus === "FullRefund" ? "bg-emerald-50 text-emerald-600" :
                            tenant.securityRefundStatus === "PartialRefund" ? "bg-amber-50 text-amber-600" :
                            "bg-red-50 text-red-500"
                          }`}>
                            {tenant.securityRefundStatus === "FullRefund" ? `Full ₹${tenant.securityRefundAmount?.toLocaleString("en-IN")}` :
                             tenant.securityRefundStatus === "PartialRefund" ? `Partial ₹${tenant.securityRefundAmount?.toLocaleString("en-IN")}` :
                             "No Refund"}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/tenants/${tenant.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                            <Eye size={13} /> View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Tenant Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Tenant" size="xl">
        <TenantOnboardingForm vacantRooms={vacantRooms} onSubmit={handleAddTenant} onCancel={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Tenant Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title={editTarget ? `Edit – ${editTarget.name}` : ""} size="xl">
        {editTarget && (
          <TenantOnboardingForm
            vacantRooms={roomsForEdit(editTarget)}
            initial={editTarget}
            onSubmit={handleEditTenant}
            onCancel={() => setEditTarget(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Move-Out Modal */}
      <MoveOutModal
        open={!!moveOutTarget}
        tenant={moveOutTarget}
        onClose={() => setMoveOutTarget(null)}
        onConfirm={handleMoveOut}
      />

      <UpgradeModal open={upgradeModal.open} onClose={() => setUpgradeModal({ ...upgradeModal, open: false })} featureName={upgradeModal.feature} requiredPlan={upgradeModal.plan} />

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Tenant" size="sm">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-500" /></div>
          <p className="text-sm text-gray-600 mb-1">Permanently remove</p>
          <p className="text-base font-semibold text-gray-900 mb-4">{deleteConfirm?.name}?</p>
          <p className="text-xs text-gray-400 mb-6">Use "Move Out" instead to keep a history record.</p>
          <div className="flex gap-3">
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">Delete</button>
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
