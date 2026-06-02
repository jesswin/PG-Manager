"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/store/AppContext";
import { Tenant, PaymentStatus } from "@/data/mock";
import StatusBadge from "@/components/StatusBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import Link from "next/link";
import { Search, UserPlus, Eye, Pencil, Trash2, ChevronDown, X, MessageCircle, Lock } from "lucide-react";
import { whatsappUrl, rentReminderMessage } from "@/lib/whatsapp";
import { getCurrentMonthLabel } from "@/lib/months";
import { usePlan } from "@/store/PlanContext";
import UpgradeModal from "@/components/UpgradeModal";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";

const EMPTY_FORM = {
  name: "", phone: "", email: "", roomNumber: "", rentAmount: "",
  moveInDate: "", occupation: "", emergencyContact: "", emergencyPhone: "",
  idProofType: "Aadhar" as Tenant["idProofType"], idProofNumber: "",
  paymentStatus: "Unpaid" as PaymentStatus,
};

export default function TenantsPage() {
  const { tenants, rooms, addTenant, editTenant, deleteTenant } = useApp();
  const { toasts, addToast, dismiss } = useToast();
  const { can, withinLimit, plan } = usePlan();
  const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string; plan: "monthly" | "quarterly" }>({ open: false, feature: "", plan: "monthly" });
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) setSearch(q);
  }, [searchParams]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Tenant | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Tenant | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const vacantRooms = rooms.filter((r) => r.status === "Vacant");

  const filtered = tenants.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.roomNumber.includes(search) ||
      t.phone.includes(search);
    const matchStatus = statusFilter === "All" || t.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  function openAdd() {
    if (!withinLimit("tenants", tenants.length)) {
      setUpgradeModal({ open: true, feature: `Add more than ${plan.maxTenants} tenants`, plan: plan.id === "free" ? "monthly" : "quarterly" });
      return;
    }
    setForm({ ...EMPTY_FORM });
    setShowAddModal(true);
  }

  function openEdit(t: Tenant) {
    setForm({
      name: t.name, phone: t.phone, email: t.email, roomNumber: t.roomNumber,
      rentAmount: String(t.rentAmount), moveInDate: t.moveInDate,
      occupation: t.occupation, emergencyContact: t.emergencyContact,
      emergencyPhone: t.emergencyPhone, idProofType: t.idProofType,
      idProofNumber: t.idProofNumber, paymentStatus: t.paymentStatus,
    });
    setEditTarget(t);
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editTarget) {
      editTenant(editTarget.id, { ...form, rentAmount: Number(form.rentAmount) });
      setEditTarget(null);
      addToast(`${form.name}'s details updated.`);
    } else {
      addTenant({ ...form, rentAmount: Number(form.rentAmount) });
      setShowAddModal(false);
      addToast(`${form.name} added as a new tenant.`);
    }
    setForm({ ...EMPTY_FORM });
  }

  function handleDelete(t: Tenant) {
    deleteTenant(t.id);
    setDeleteConfirm(null);
    addToast(`${t.name} has been removed.`, "info");
  }

  const isModalOpen = showAddModal || !!editTarget;
  const modalTitle = editTarget ? `Edit – ${editTarget.name}` : "Add New Tenant";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Tenants" }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 text-sm mt-1">{tenants.length} tenants registered</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Room</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Rent</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Move-in Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No tenants found.</td></tr>
              )}
              {filtered.map((tenant) => (
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
                      {can("whatsappIndividual") ? (
                        <a
                          href={whatsappUrl(tenant.phone, rentReminderMessage(tenant.name, tenant.roomNumber, tenant.rentAmount, getCurrentMonthLabel()))}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Send WhatsApp reminder to ${tenant.name}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                        >
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      ) : (
                        <button
                          onClick={() => setUpgradeModal({ open: true, feature: "WhatsApp Reminders", plan: "monthly" })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Lock size={13} /> WhatsApp
                        </button>
                      )}
                      <button onClick={() => openEdit(tenant)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(tenant)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
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
          <p className="text-xs text-gray-500">Showing {filtered.length} of {tenants.length} tenants</p>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal open={isModalOpen} onClose={() => { setShowAddModal(false); setEditTarget(null); }} title={modalTitle} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
              <input required className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Arjun Sharma" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Phone *</label>
              <input required className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" maxLength={10} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
              <input required type="email" className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@email.com" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Occupation</label>
              <input className={inp} value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} placeholder="Software Engineer" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Room Number *</label>
              <select required className={inp} value={form.roomNumber} onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}>
                <option value="">Select room...</option>
                {vacantRooms.map((r) => <option key={r.id} value={r.number}>Room {r.number} – Floor {r.floor} ({r.type})</option>)}
                {editTarget && <option value={editTarget.roomNumber}>Room {editTarget.roomNumber} (current)</option>}
              </select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Monthly Rent (₹) *</label>
              <input required type="number" className={inp} value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: e.target.value })} placeholder="8500" min={0} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Move-in Date *</label>
              <input required type="date" className={inp} value={form.moveInDate} onChange={(e) => setForm({ ...form, moveInDate: e.target.value })} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Payment Status</label>
              <select className={inp} value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })}>
                <option>Paid</option><option>Unpaid</option><option>Partial</option>
              </select></div>
          </div>
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Emergency Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                <input className={inp} value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} placeholder="Guardian name" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                <input className={inp} value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} placeholder="9876500001" maxLength={10} /></div>
            </div>
          </div>
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">ID Proof</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
                <select className={inp} value={form.idProofType} onChange={(e) => setForm({ ...form, idProofType: e.target.value as Tenant["idProofType"] })}>
                  <option>Aadhar</option><option>Passport</option><option>DL</option><option>PAN</option>
                </select></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Number</label>
                <input className={inp} value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} placeholder="ID number" /></div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              {editTarget ? "Save Changes" : "Add Tenant"}
            </button>
            <button type="button" onClick={() => { setShowAddModal(false); setEditTarget(null); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>

      <UpgradeModal open={upgradeModal.open} onClose={() => setUpgradeModal({ ...upgradeModal, open: false })} featureName={upgradeModal.feature} requiredPlan={upgradeModal.plan} />

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Tenant" size="sm">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-500" /></div>
          <p className="text-sm text-gray-600 mb-1">Remove</p>
          <p className="text-base font-semibold text-gray-900 mb-4">{deleteConfirm?.name}?</p>
          <p className="text-xs text-gray-400 mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">Yes, Remove</button>
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
