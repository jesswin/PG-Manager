"use client";

import { use, useState } from "react";
import { useApp } from "@/store/AppContext";
import { Tenant } from "@/data/mock";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import {
  Phone, Mail, User, Home, CreditCard, FileText,
  Pencil, BadgeCheck, Briefcase, ShieldCheck, MessageCircle,
} from "lucide-react";
import { whatsappUrl, rentReminderMessage } from "@/lib/whatsapp";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";

export default function TenantProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tenants, rooms, payments, editTenant } = useApp();

  const tenantRaw = tenants.find((t) => t.id === id);
  const { toasts, addToast, dismiss } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({
    name: tenantRaw?.name ?? "", phone: tenantRaw?.phone ?? "", email: tenantRaw?.email ?? "",
    occupation: tenantRaw?.occupation ?? "", emergencyContact: tenantRaw?.emergencyContact ?? "",
    emergencyPhone: tenantRaw?.emergencyPhone ?? "", idProofType: (tenantRaw?.idProofType ?? "Aadhar") as Tenant["idProofType"],
    idProofNumber: tenantRaw?.idProofNumber ?? "", paymentStatus: (tenantRaw?.paymentStatus ?? "Unpaid") as Tenant["paymentStatus"],
    rentAmount: String(tenantRaw?.rentAmount ?? ""),
  });

  if (!tenantRaw) return notFound();
  const tenant = tenantRaw;

  const room = rooms.find((r) => r.tenantId === id);
  const tenantPayments = payments
    .filter((p) => p.tenantId === id)
    .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  const totalPaid = tenantPayments.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pendingMonths = tenantPayments.filter((p) => p.status !== "Paid").length;

  function handleSaveEdit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    editTenant(id, { ...form, rentAmount: Number(form.rentAmount) });
    setShowEdit(false);
    addToast("Tenant details updated successfully.");
  }

  const pendingPayment = tenantPayments.find((p) => p.status !== "Paid");
  const reminderUrl = whatsappUrl(
    tenant.phone,
    rentReminderMessage(tenant.name, tenant.roomNumber, tenant.rentAmount, pendingPayment?.month ?? "this month", pendingPayment?.dueDate)
  );

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Tenants", href: "/tenants" }, { label: tenant.name }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-xl font-bold text-indigo-700">{tenant.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
              <StatusBadge status={tenant.paymentStatus} size="md" />
            </div>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1.5">
              <Briefcase size={14} className="shrink-0" />{tenant.occupation}
            </p>
            <div className="flex flex-wrap gap-4 mt-3">
              <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                <Phone size={14} />{tenant.phone}
              </a>
              <a href={`mailto:${tenant.email}`} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                <Mail size={14} />{tenant.email}
              </a>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 mt-2 sm:mt-0 flex-wrap">
            <a
              href={reminderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <MessageCircle size={14} /> WhatsApp Reminder
            </a>
            <button onClick={() => { setForm({ name: tenant.name, phone: tenant.phone, email: tenant.email, occupation: tenant.occupation, emergencyContact: tenant.emergencyContact, emergencyPhone: tenant.emergencyPhone, idProofType: tenant.idProofType, idProofNumber: tenant.idProofNumber, paymentStatus: tenant.paymentStatus, rentAmount: String(tenant.rentAmount) }); setShowEdit(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
              <Pencil size={14} /> Edit Details
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">&#8377;{tenant.rentAmount.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-500 mt-0.5">Monthly Rent</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">&#8377;{totalPaid.toLocaleString("en-IN")}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total Paid</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${pendingMonths > 0 ? "text-red-500" : "text-gray-400"}`}>{pendingMonths}</p>
            <p className="text-xs text-gray-500 mt-0.5">Pending Months</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><User size={15} className="text-indigo-500" /> Personal Information</h2>
          <dl className="space-y-3">
            {[{ label: "Full Name", value: tenant.name }, { label: "Phone", value: tenant.phone }, { label: "Email", value: tenant.email }, { label: "Occupation", value: tenant.occupation }].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900 truncate max-w-[200px]">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><ShieldCheck size={13} className="text-orange-500" /> Emergency Contact</p>
            <div className="space-y-2">
              {[{ label: "Name", value: tenant.emergencyContact }, { label: "Phone", value: tenant.emergencyPhone }].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt className="text-gray-500">{label}</dt><dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2"><Home size={15} className="text-indigo-500" /> Room Details</h2>
          {room ? (
            <dl className="space-y-3">
              {[
                { label: "Room Number", value: `Room ${room.number}` },
                { label: "Floor", value: `Floor ${room.floor}` },
                { label: "Type", value: room.type },
                { label: "Monthly Rent", value: `₹${room.rentAmount.toLocaleString("en-IN")}` },
                { label: "Move-in Date", value: new Date(tenant.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt className="text-gray-500">{label}</dt><dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between text-sm items-start">
                <dt className="text-gray-500">Amenities</dt>
                <dd className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                  {room.amenities.map((a) => <span key={a} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{a}</span>)}
                </dd>
              </div>
            </dl>
          ) : <p className="text-sm text-gray-500">No room assigned.</p>}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5"><BadgeCheck size={13} className="text-blue-500" /> ID Proof</p>
            <div className="space-y-2">
              {[{ label: "Type", value: tenant.idProofType }, { label: "Number", value: tenant.idProofNumber }].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <dt className="text-gray-500">{label}</dt><dd className="font-medium text-gray-900 font-mono">{value}</dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <CreditCard size={15} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-800">Payment History</h2>
          <span className="ml-auto text-xs text-gray-400">{tenantPayments.length} records</span>
        </div>
        {tenantPayments.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">No payment records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Month</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Due Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 hidden sm:table-cell">Paid Date</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Amount</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tenantPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-800">{p.month}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(p.dueDate).toLocaleDateString("en-IN")}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.paidDate ? new Date(p.paidDate).toLocaleDateString("en-IN") : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">&#8377;{p.amount.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><FileText size={15} className="text-indigo-500" /> Documents</h2>
          <button onClick={() => addToast("File upload feature coming soon.", "info")} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">+ Upload</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {["ID Proof", "Agreement Copy", "Police Verification"].map((doc) => (
            <div key={doc} onClick={() => addToast(`Opening ${doc}...`, "info")}
              className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors cursor-pointer group">
              <FileText size={22} className="text-gray-300 group-hover:text-indigo-400 mb-2" />
              <p className="text-xs font-medium text-gray-500 group-hover:text-indigo-600">{doc}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Click to upload</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Tenant Details" size="lg">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
              <input required className={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Phone *</label>
              <input required className={inp} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={10} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
              <input required type="email" className={inp} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Occupation</label>
              <input className={inp} value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Monthly Rent (₹)</label>
              <input type="number" className={inp} value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: e.target.value })} min={0} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Payment Status</label>
              <select className={inp} value={form.paymentStatus} onChange={(e) => setForm({ ...form, paymentStatus: e.target.value as Tenant["paymentStatus"] })}>
                <option>Paid</option><option>Unpaid</option><option>Partial</option>
              </select></div>
          </div>
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Emergency Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                <input className={inp} value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                <input className={inp} value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} maxLength={10} /></div>
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
                <input className={inp} value={form.idProofNumber} onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })} /></div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">Save Changes</button>
            <button type="button" onClick={() => setShowEdit(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
