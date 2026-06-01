"use client";

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { Notice } from "@/data/mock";
import StatusBadge from "@/components/StatusBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import { Send, Bell, ChevronDown, Users, Trash2, Eye, Lock, Zap } from "lucide-react";
import { usePlan } from "@/store/PlanContext";
import UpgradeModal from "@/components/UpgradeModal";
import Link from "next/link";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400 bg-white text-gray-800";
const EMPTY_FORM = { title: "", message: "", recipientId: "all" };

export default function NoticesPage() {
  const { tenants, notices, addNotice, sendDraft, deleteNotice } = useApp();
  const { toasts, addToast, dismiss } = useToast();
  const { can } = usePlan();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [viewNotice, setViewNotice] = useState<Notice | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Notice | null>(null);
  const [filter, setFilter] = useState("All");

  const sentNotices = notices.filter((n) => n.status === "Sent");
  const draftNotices = notices.filter((n) => n.status === "Draft");
  const displayed = filter === "All" ? notices : filter === "Sent" ? sentNotices : draftNotices;

  function getRecipient(recipientId: string) {
    if (recipientId === "all") return "All Tenants";
    const t = tenants.find((t) => t.id === recipientId);
    return t ? `${t.name} (Room ${t.roomNumber})` : "All Tenants";
  }

  function createNotice(status: Notice["status"]) {
    if (!form.title.trim() || !form.message.trim()) { addToast("Please fill in the title and message.", "error"); return; }
    const now = new Date().toISOString().split("T")[0];
    addNotice({
      title: form.title, message: form.message,
      recipient: getRecipient(form.recipientId),
      recipientId: form.recipientId === "all" ? undefined : form.recipientId,
      status, createdAt: now, sentAt: status === "Sent" ? now : undefined,
    });
    setForm({ ...EMPTY_FORM });
    addToast(status === "Sent" ? `Notice sent to ${getRecipient(form.recipientId)}.` : "Notice saved as draft.");
  }

  function handleSendDraft(notice: Notice) {
    sendDraft(notice.id);
    addToast(`"${notice.title}" sent to ${notice.recipient}.`);
  }

  function handleDelete(notice: Notice) {
    deleteNotice(notice.id);
    setDeleteConfirm(null);
    addToast("Notice deleted.", "info");
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Notices" }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
        <p className="text-gray-500 text-sm mt-1">Compose and send notices to tenants</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2">
          <div className={`bg-white rounded-xl border shadow-sm p-5 ${!can("notices") ? "border-gray-200 relative overflow-hidden" : "border-gray-200"}`}>
            {!can("notices") && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center rounded-xl gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                  <Lock size={22} className="text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-gray-800">Notices are locked</p>
                <p className="text-xs text-gray-500 text-center px-4">Upgrade to Monthly or Quarterly plan to compose and send notices.</p>
                <Link href="/pricing" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                  <Zap size={13} /> Upgrade Now
                </Link>
              </div>
            )}
            <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={15} className="text-indigo-500" /> Compose Notice
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Water Supply Interruption" className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Message *</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write your notice here..." rows={6} className={`${inp} resize-none`} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Recipient *</label>
                <div className="relative">
                  <select value={form.recipientId} onChange={(e) => setForm({ ...form, recipientId: e.target.value })} className={`${inp} pr-8`}>
                    <option value="all">All Tenants</option>
                    {tenants.map((t) => <option key={t.id} value={t.id}>{t.name} – Room {t.roomNumber}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => createNotice("Sent")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  <Send size={15} /> Send Notice
                </button>
                <button type="button" onClick={() => createNotice("Draft")}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  Save Draft
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center gap-2"><Send size={14} className="text-emerald-500" /><span className="text-xs text-gray-500">Sent</span></div>
              <p className="text-xl font-bold text-gray-800 mt-1">{sentNotices.length}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
              <div className="flex items-center gap-2"><Bell size={14} className="text-gray-400" /><span className="text-xs text-gray-500">Drafts</span></div>
              <p className="text-xl font-bold text-gray-800 mt-1">{draftNotices.length}</p>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">All Notices</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{displayed.length}</span>
                <div className="relative">
                  <select value={filter} onChange={(e) => setFilter(e.target.value)} className="appearance-none pl-2 pr-6 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white text-gray-600 cursor-pointer">
                    <option>All</option><option>Sent</option><option>Draft</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {displayed.length === 0 && <div className="px-5 py-10 text-center text-gray-400 text-sm">No notices found.</div>}
              {displayed.map((notice) => (
                <div key={notice.id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{notice.title}</p>
                        <StatusBadge status={notice.status} />
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{notice.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[11px] text-gray-400"><Users size={11} />{notice.recipient}</span>
                        <span className="text-[11px] text-gray-400">{new Date(notice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <button onClick={() => setViewNotice(notice)} className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="View"><Eye size={14} /></button>
                      {notice.status === "Draft" && (
                        <button onClick={() => handleSendDraft(notice)} className="p-1.5 rounded-md text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" title="Send"><Send size={14} /></button>
                      )}
                      <button onClick={() => setDeleteConfirm(notice)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <Modal open={!!viewNotice} onClose={() => setViewNotice(null)} title="Notice Details">
        {viewNotice && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge status={viewNotice.status} />
              <span className="text-xs text-gray-400">{new Date(viewNotice.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">{viewNotice.title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{viewNotice.message}</p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"><Users size={14} className="text-gray-400" /><span className="text-sm text-gray-600">{viewNotice.recipient}</span></div>
            {viewNotice.status === "Draft" && (
              <button onClick={() => { handleSendDraft(viewNotice); setViewNotice(null); }}
                className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Send size={15} /> Send This Notice
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Notice" size="sm">
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-500" /></div>
          <p className="text-sm text-gray-600 mb-3">Delete this notice permanently?</p>
          <p className="text-sm font-semibold text-gray-900 mb-6">{deleteConfirm?.title}</p>
          <div className="flex gap-3">
            <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors">Delete</button>
            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
