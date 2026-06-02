"use client";

import { useState } from "react";
import { Tenant, PaymentStatus, FoodPreference } from "@/data/mock";
import { Room } from "@/data/mock";
import {
  User, Home, Zap, CreditCard, ShieldCheck, Phone, UtensilsCrossed, FileText,
  Check,
} from "lucide-react";

const inp = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-800 placeholder:text-gray-400";
const label = "block text-xs font-semibold text-gray-600 mb-1.5";

export type TenantFormData = Omit<Tenant, "id" | "avatar">;

const AMENITY_OPTIONS = [
  "WiFi", "AC", "Geyser", "TV", "Parking",
  "Meals (Veg)", "Meals (Non-Veg)", "Laundry",
  "Attached Bathroom", "Housekeeping", "Power Backup",
  "24hr Water", "CCTV", "Security Guard",
];

const EMPTY: TenantFormData = {
  name: "", phone: "", email: "", roomNumber: "", rentAmount: 0,
  moveInDate: "", occupation: "",
  emergencyContact: "", emergencyPhone: "",
  idProofType: "Aadhar", idProofNumber: "",
  paymentStatus: "Unpaid",
  rentDueDay: 5,
  securityDeposit: 0,
  advancePaid: 0,
  foodPreference: "No Preference",
  amenities: [],
  notes: "",
  tenantStatus: "Active",
};

interface Props {
  vacantRooms: Room[];
  initial?: Partial<TenantFormData>;
  onSubmit: (data: TenantFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export default function TenantOnboardingForm({ vacantRooms, initial, onSubmit, onCancel, submitLabel = "Add Tenant" }: Props) {
  const [form, setForm] = useState<TenantFormData>({ ...EMPTY, ...initial });

  function set<K extends keyof TenantFormData>(key: K, value: TenantFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleAmenity(a: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── 1. Personal Information ──────────────────────────── */}
      <Section icon={User} color="indigo" title="Personal Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={label}>Full Name *</label>
            <input required className={inp} placeholder="Arjun Sharma" value={form.name}
              onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className={label}>Phone *</label>
            <input required type="tel" className={inp} placeholder="9876543210" value={form.phone}
              onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className={label}>Email *</label>
            <input required type="email" className={inp} placeholder="arjun@email.com" value={form.email}
              onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className={label}>Occupation</label>
            <input className={inp} placeholder="Software Engineer" value={form.occupation}
              onChange={(e) => set("occupation", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* ── 2. Accommodation ─────────────────────────────────── */}
      <Section icon={Home} color="purple" title="Accommodation Details">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={label}>Room *</label>
            <select required className={inp} value={form.roomNumber}
              onChange={(e) => {
                const room = vacantRooms.find((r) => r.number === e.target.value);
                set("roomNumber", e.target.value);
                if (room) set("rentAmount", room.rentAmount);
              }}>
              <option value="">Select room…</option>
              {vacantRooms.map((r) => (
                <option key={r.id} value={r.number}>
                  Room {r.number} – Floor {r.floor} ({r.type})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Monthly Rent (₹) *</label>
            <input required type="number" min={0} className={inp} placeholder="8500"
              value={form.rentAmount || ""} onChange={(e) => set("rentAmount", Number(e.target.value))} />
          </div>
          <div>
            <label className={label}>Rent Due Day *</label>
            <div className="relative">
              <input required type="number" min={1} max={28} className={inp} placeholder="5"
                value={form.rentDueDay || ""} onChange={(e) => set("rentDueDay", Number(e.target.value))} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                of month
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Day (1–28) rent is due each month</p>
          </div>
          <div>
            <label className={label}>Move-in Date *</label>
            <input required type="date" className={inp} value={form.moveInDate}
              onChange={(e) => set("moveInDate", e.target.value)} />
          </div>
          <div>
            <label className={label}>Payment Status</label>
            <select className={inp} value={form.paymentStatus}
              onChange={(e) => set("paymentStatus", e.target.value as PaymentStatus)}>
              <option>Unpaid</option>
              <option>Paid</option>
              <option>Partial</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ── 3. Amenities ─────────────────────────────────────── */}
      <Section icon={Zap} color="amber" title="Amenities Included">
        <p className="text-xs text-gray-500 mb-3">Select what's included in this tenant's rent</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {AMENITY_OPTIONS.map((a) => {
            const checked = form.amenities.includes(a);
            return (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left
                  ${checked
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors
                  ${checked ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                  {checked && <Check size={10} className="text-white" />}
                </div>
                {a}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── 4. Financial ─────────────────────────────────────── */}
      <Section icon={CreditCard} color="emerald" title="Financial Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Security Deposit (₹)</label>
            <input type="number" min={0} className={inp} placeholder="17000"
              value={form.securityDeposit || ""} onChange={(e) => set("securityDeposit", Number(e.target.value))} />
          </div>
          <div>
            <label className={label}>Advance Paid (₹)</label>
            <input type="number" min={0} className={inp} placeholder="8500"
              value={form.advancePaid || ""} onChange={(e) => set("advancePaid", Number(e.target.value))} />
          </div>
        </div>
      </Section>

      {/* ── 5. ID Proof ──────────────────────────────────────── */}
      <Section icon={ShieldCheck} color="blue" title="Identity Verification">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>ID Proof Type *</label>
            <select required className={inp} value={form.idProofType}
              onChange={(e) => set("idProofType", e.target.value as Tenant["idProofType"])}>
              <option>Aadhar</option>
              <option>Passport</option>
              <option>DL</option>
              <option>PAN</option>
            </select>
          </div>
          <div>
            <label className={label}>ID Number *</label>
            <input required className={inp} placeholder="XXXX-XXXX-1234" value={form.idProofNumber}
              onChange={(e) => set("idProofNumber", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* ── 6. Emergency Contact ─────────────────────────────── */}
      <Section icon={Phone} color="red" title="Emergency Contact">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Contact Name</label>
            <input className={inp} placeholder="Parent / Guardian name" value={form.emergencyContact}
              onChange={(e) => set("emergencyContact", e.target.value)} />
          </div>
          <div>
            <label className={label}>Contact Phone</label>
            <input type="tel" className={inp} placeholder="9876543210" value={form.emergencyPhone}
              onChange={(e) => set("emergencyPhone", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* ── 7. Preferences & Notes ───────────────────────────── */}
      <Section icon={UtensilsCrossed} color="orange" title="Preferences & Notes">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Food Preference</label>
            <select className={inp} value={form.foodPreference}
              onChange={(e) => set("foodPreference", e.target.value as FoodPreference)}>
              <option>No Preference</option>
              <option>Veg</option>
              <option>Non-Veg</option>
            </select>
          </div>
          <div className="sm:col-span-1">
            <label className={label}>Notes</label>
            <textarea rows={2} className={`${inp} resize-none`}
              placeholder="Any special requirements or notes…"
              value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit"
          className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

const COLORS: Record<string, string> = {
  indigo: "bg-indigo-100 text-indigo-600",
  purple: "bg-purple-100 text-purple-600",
  amber:  "bg-amber-100  text-amber-600",
  emerald:"bg-emerald-100 text-emerald-600",
  blue:   "bg-blue-100   text-blue-600",
  red:    "bg-red-100    text-red-600",
  orange: "bg-orange-100 text-orange-600",
};

function Section({ icon: Icon, color, title, children }: {
  icon: React.ElementType; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${COLORS[color]}`}>
          <Icon size={14} />
        </div>
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
