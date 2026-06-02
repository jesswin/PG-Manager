"use client";

import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { Room, RoomType } from "@/data/mock";
import StatusBadge from "@/components/StatusBadge";
import Breadcrumbs from "@/components/Breadcrumbs";
import Modal from "@/components/Modal";
import { ToastContainer, useToast } from "@/components/Toast";
import Link from "next/link";
import { ChevronDown, DoorOpen, Users, Building, Plus, Pencil, Search, X } from "lucide-react";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";
const AMENITY_OPTIONS = ["AC", "Fan", "Attached Bath", "Common Bath", "Balcony", "City View", "WiFi", "Geyser"];
const EMPTY_FORM = { number: "", floor: "1", type: "Single" as RoomType, rentAmount: "", amenities: [] as string[] };
const roomTypeColor: Record<RoomType, string> = {
  Single: "bg-blue-50 text-blue-700",
  Double: "bg-purple-50 text-purple-700",
  Triple: "bg-orange-50 text-orange-700",
};

export default function RoomsPage() {
  const { rooms, addRoom, editRoom, markRoomVacant } = useApp();
  const { toasts, addToast, dismiss } = useToast();

  const [search, setSearch] = useState("");
  const [floorFilter, setFloorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Room | null>(null);
  const [viewRoom, setViewRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const totalRooms = rooms.length;
  const occupied = rooms.filter((r) => r.status === "Occupied").length;
  const vacant = totalRooms - occupied;

  const floors = [...new Set(rooms.map((r) => r.floor))].sort();

  const filtered = rooms.filter((r) => {
    const matchSearch =
      r.number.includes(search) ||
      (r.tenantName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFloor = floorFilter === "All" || r.floor === Number(floorFilter);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchSearch && matchFloor && matchStatus;
  });

  function openAdd() { setForm({ ...EMPTY_FORM }); setShowAddModal(true); }

  function openEdit(room: Room) {
    setForm({ number: room.number, floor: String(room.floor), type: room.type, rentAmount: String(room.rentAmount), amenities: [...room.amenities] });
    setEditTarget(room);
  }

  function toggleAmenity(a: string) {
    setForm((prev) => ({ ...prev, amenities: prev.amenities.includes(a) ? prev.amenities.filter((x) => x !== a) : [...prev.amenities, a] }));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editTarget) {
      editRoom(editTarget.id, { number: form.number, floor: Number(form.floor), type: form.type, rentAmount: Number(form.rentAmount), amenities: form.amenities });
      setEditTarget(null);
      addToast(`Room ${form.number} updated.`);
    } else {
      if (rooms.find((r) => r.number === form.number)) { addToast(`Room ${form.number} already exists.`, "error"); return; }
      addRoom({ number: form.number, floor: Number(form.floor), type: form.type, rentAmount: Number(form.rentAmount), amenities: form.amenities });
      setShowAddModal(false);
      addToast(`Room ${form.number} added.`);
    }
  }

  function handleMarkVacant(room: Room) {
    markRoomVacant(room.id);
    setViewRoom(null);
    addToast(`Room ${room.number} marked as vacant.`, "info");
  }

  const isModalOpen = showAddModal || !!editTarget;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Rooms" }]} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all rooms across {floors.length} floors</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={16} /> Add Room
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Rooms", value: totalRooms, icon: Building, color: "text-gray-500", bg: "bg-gray-100" },
          { label: "Occupied", value: occupied, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Vacant", value: vacant, icon: DoorOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center`}><Icon size={18} className={color} /></div>
            <div>
              <p className={`text-xl font-bold ${color === "text-gray-500" ? "text-gray-900" : color}`}>{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search room no. or tenant..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
          {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
        </div>
        {[
          { val: floorFilter, set: setFloorFilter, opts: [{ v: "All", l: "All Floors" }, ...floors.map((f) => ({ v: String(f), l: `Floor ${f}` }))] },
          { val: statusFilter, set: setStatusFilter, opts: [{ v: "All", l: "All Status" }, { v: "Occupied", l: "Occupied" }, { v: "Vacant", l: "Vacant" }] },
        ].map(({ val, set, opts }, i) => (
          <div key={i} className="relative">
            <select value={val} onChange={(e) => set(e.target.value)} className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-700 cursor-pointer">
              {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        ))}
        <p className="ml-auto self-center text-sm text-gray-500">{filtered.length} rooms</p>
      </div>

      {/* Room grid by floor */}
      {floors.map((floor) => {
        const floorRooms = filtered.filter((r) => r.floor === floor);
        if (floorRooms.length === 0) return null;
        return (
          <div key={floor} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-gray-700">Floor {floor}</span>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{floorRooms.length} rooms</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {floorRooms.map((room) => (
                <div key={room.id} onClick={() => setViewRoom(room)}
                  className={`bg-white rounded-xl border ${room.status === "Occupied" ? "border-indigo-200" : "border-gray-200"} p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative`}>
                  <button onClick={(e) => { e.stopPropagation(); openEdit(room); }}
                    className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                    <Pencil size={12} />
                  </button>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-gray-900">{room.number}</span>
                    <StatusBadge status={room.status} />
                  </div>
                  <div className="space-y-1.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${roomTypeColor[room.type]}`}>{room.type}</span>
                    <p className="text-xs font-semibold text-gray-700 mt-1">&#8377;{room.rentAmount.toLocaleString("en-IN")}<span className="font-normal text-gray-400">/mo</span></p>
                    {room.status === "Occupied" && room.tenantName ? (
                      <Link href={`/tenants/${room.tenantId}`} className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium truncate block" onClick={(e) => e.stopPropagation()}>
                        {room.tenantName.split(" ")[0]}
                      </Link>
                    ) : (
                      <p className="text-[11px] text-emerald-600 font-medium">Available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add / Edit Modal */}
      <Modal open={isModalOpen} onClose={() => { setShowAddModal(false); setEditTarget(null); }} title={editTarget ? `Edit Room ${editTarget.number}` : "Add New Room"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Room Number *</label>
              <input required className={inp} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="e.g. 401" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Floor *</label>
              <select required className={inp} value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })}>
                {[1, 2, 3, 4, 5].map((f) => <option key={f} value={f}>Floor {f}</option>)}
              </select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Room Type *</label>
              <select required className={inp} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RoomType })}>
                <option>Single</option><option>Double</option><option>Triple</option>
              </select></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1.5">Monthly Rent (₹) *</label>
              <input required type="number" className={inp} value={form.rentAmount} onChange={(e) => setForm({ ...form, rentAmount: e.target.value })} placeholder="8500" min={0} /></div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${form.amenities.includes(a) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              {editTarget ? "Save Changes" : "Add Room"}
            </button>
            <button type="button" onClick={() => { setShowAddModal(false); setEditTarget(null); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Room Detail Modal */}
      {viewRoom && (
        <Modal open={!!viewRoom} onClose={() => setViewRoom(null)} title={`Room ${viewRoom.number} Details`}>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${roomTypeColor[viewRoom.type]}`}>{viewRoom.type}</span>
              <StatusBadge status={viewRoom.status} />
              <span className="text-sm text-gray-500">Floor {viewRoom.floor}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {[
                { label: "Room Number", value: viewRoom.number },
                { label: "Monthly Rent", value: `₹${viewRoom.rentAmount.toLocaleString("en-IN")}` },
                { label: "Status", value: viewRoom.status },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
              ))}
              {viewRoom.tenantName && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Tenant</span>
                  <Link href={`/tenants/${viewRoom.tenantId}`} className="font-semibold text-indigo-600 hover:text-indigo-800">{viewRoom.tenantName}</Link>
                </div>
              )}
            </div>
            {viewRoom.amenities.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {viewRoom.amenities.map((a) => <span key={a} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full">{a}</span>)}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setViewRoom(null); openEdit(viewRoom); }} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Pencil size={15} /> Edit Room
              </button>
              {viewRoom.status === "Occupied" && (
                <button onClick={() => handleMarkVacant(viewRoom)} className="flex-1 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 text-sm font-medium rounded-lg hover:bg-amber-100 transition-colors">
                  Mark Vacant
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
