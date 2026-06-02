"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useOnboarding } from "@/store/OnboardingContext";
import { supabase, isSupabaseEnabled } from "@/lib/supabase";
import { isDemoMode, DEMO_PG_ID } from "@/lib/demo";
import {
  tenants as seedTenants,
  rooms as seedRooms,
  payments as seedPayments,
  notices as seedNotices,
  activityFeed as seedActivity,
  Tenant, Room, Payment, Notice, PaymentStatus, SecurityRefundStatus,
} from "@/data/mock";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  type: "payment" | "notice" | "tenant";
  message: string;
  time: string;
}

interface PgAppState {
  tenants: Tenant[];
  rooms: Room[];
  payments: Payment[];
  notices: Notice[];
  activity: ActivityItem[];
}

export interface MoveOutData {
  moveOutDate: string;
  moveOutReason: string;
  securityRefundStatus: SecurityRefundStatus;
  securityRefundAmount: number;
  moveOutNotes: string;
}

interface AppContextType extends PgAppState {
  loading: boolean;
  addTenant: (data: Omit<Tenant, "id" | "avatar">) => Promise<void>;
  editTenant: (id: string, data: Partial<Tenant>) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  moveOutTenant: (id: string, data: MoveOutData) => Promise<void>;
  addRoom: (data: Omit<Room, "id" | "status">) => Promise<void>;
  editRoom: (id: string, data: Partial<Room>) => Promise<void>;
  markRoomVacant: (id: string) => Promise<void>;
  addPayment: (data: Omit<Payment, "id">) => Promise<void>;
  markPaymentPaid: (id: string) => Promise<void>;
  addNotice: (data: Omit<Notice, "id">) => Promise<void>;
  sendDraft: (id: string) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// ── Storage keys ──────────────────────────────────────────────────────────────
const LS_KEY = "pgm_pg_data";

// ── Seed / demo state ─────────────────────────────────────────────────────────
const EMPTY_STATE: PgAppState = { tenants: [], rooms: [], payments: [], notices: [], activity: [] };

const DEMO_STATE: PgAppState = {
  tenants: seedTenants,
  rooms: seedRooms,
  payments: seedPayments,
  notices: seedNotices,
  activity: seedActivity.map((a) => ({ id: a.id, type: a.type as ActivityItem["type"], message: a.message, time: a.time })),
};

// ── Supabase row → app type mappers ───────────────────────────────────────────

function mapTenant(row: any): Tenant {
  return {
    id: row.id, name: row.name, phone: row.phone, email: row.email,
    roomNumber: row.room_number, rentAmount: row.rent_amount,
    moveInDate: row.move_in_date, paymentStatus: row.payment_status as PaymentStatus,
    avatar: row.avatar || row.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
    emergencyContact: row.emergency_contact ?? "", emergencyPhone: row.emergency_phone ?? "",
    idProofType: row.id_proof_type as Tenant["idProofType"], idProofNumber: row.id_proof_number ?? "",
    occupation: row.occupation ?? "", rentDueDay: row.rent_due_day ?? 5,
    securityDeposit: row.security_deposit ?? 0, advancePaid: row.advance_paid ?? 0,
    foodPreference: row.food_preference ?? "No Preference",
    amenities: row.amenities ?? [], notes: row.notes ?? "",
    tenantStatus: (row.tenant_status ?? "Active") as Tenant["tenantStatus"],
    moveOutDate: row.move_out_date ?? undefined,
    moveOutReason: row.move_out_reason ?? undefined,
    securityRefundStatus: row.security_refund_status ?? undefined,
    securityRefundAmount: row.security_refund_amount ?? undefined,
    moveOutNotes: row.move_out_notes ?? undefined,
  };
}

function mapRoom(row: any): Room {
  return {
    id: row.id, number: row.number,
    floor: typeof row.floor === "number" ? `Floor ${row.floor}` : String(row.floor ?? "Floor 1"),
    type: String(row.type ?? "Single"), status: row.status as Room["status"],
    tenantId: row.tenant_id ?? undefined, tenantName: row.tenant_name ?? undefined,
    rentAmount: row.rent_amount, amenities: row.amenities ?? [],
  };
}

function mapPayment(row: any): Payment {
  return {
    id: row.id, tenantId: row.tenant_id, tenantName: row.tenant_name,
    roomNumber: row.room_number, amount: row.amount, dueDate: row.due_date,
    paidDate: row.paid_date ?? undefined, status: row.status as PaymentStatus, month: row.month,
  };
}

function mapNotice(row: any): Notice {
  return {
    id: row.id, title: row.title, message: row.message,
    recipient: row.recipient, recipientId: row.recipient_id ?? undefined,
    status: row.status as Notice["status"], createdAt: row.created_at, sentAt: row.sent_at ?? undefined,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const { activePgId, pgs } = useOnboarding();

  const [tenants, setTenants]   = useState<Tenant[]>([]);
  const [rooms, setRooms]       = useState<Room[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notices, setNotices]   = useState<Notice[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading]   = useState(false);
  const [lsDataLoaded, setLsDataLoaded] = useState(false);

  // Refs so mutation callbacks always see fresh activePgId / pgs
  const pgIdRef  = useRef(activePgId);
  const pgsRef   = useRef(pgs);
  useEffect(() => { pgIdRef.current  = activePgId; }, [activePgId]);
  useEffect(() => { pgsRef.current   = pgs;        }, [pgs]);

  // ── Load localStorage data on first mount (local mode only) ───────────────

  useEffect(() => {
    if (isSupabaseEnabled) { setLsDataLoaded(true); return; }
    try {
      const saved = localStorage.getItem(LS_KEY);
      if (saved) {
        const all: Record<string, PgAppState> = JSON.parse(saved);
        // Store data keyed by pgId; will be accessed in the activePgId effect below
        (window as any).__pgmLsData = all;
      }
    } catch { /* ignore */ }
    setLsDataLoaded(true);
  }, []);

  // ── Load / switch data when activePgId changes ────────────────────────────

  useEffect(() => {
    if (!activePgId) return;

    // Demo mode: always use seed data — never query Supabase with the fake pg_demo ID
    if (isDemoMode() || activePgId === DEMO_PG_ID) {
      setTenants(DEMO_STATE.tenants);
      setRooms(DEMO_STATE.rooms);
      setPayments(DEMO_STATE.payments);
      setNotices(DEMO_STATE.notices);
      setActivity(DEMO_STATE.activity);
      return;
    }

    if (isSupabaseEnabled && supabase) {
      setLoading(true);
      loadFromSupabase(activePgId);
    } else if (lsDataLoaded) {
      loadFromLocalStorage(activePgId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePgId, lsDataLoaded]);

  async function loadFromSupabase(pgId: string) {
    if (!supabase) return;
    const [t, r, p, n] = await Promise.all([
      supabase.from("tenants").select("*").eq("pg_id", pgId).order("created_at", { ascending: false }),
      supabase.from("rooms").select("*").eq("pg_id", pgId).order("number"),
      supabase.from("payments").select("*").eq("pg_id", pgId).order("created_at", { ascending: false }),
      supabase.from("notices").select("*").eq("pg_id", pgId).order("created_at", { ascending: false }),
    ]);
    setTenants((t.data ?? []).map(mapTenant));
    setRooms((r.data ?? []).map(mapRoom));
    setPayments((p.data ?? []).map(mapPayment));
    setNotices((n.data ?? []).map(mapNotice));
    setActivity([]);
    setLoading(false);
  }

  /** Returns the supabase client only when writes should happen; null in demo/local mode. */
  function getSb() {
    if (isDemoMode() || !supabase || pgIdRef.current === DEMO_PG_ID) return null;
    return supabase;
  }

  function loadFromLocalStorage(pgId: string) {
    const all: Record<string, PgAppState> = (window as any).__pgmLsData ?? {};
    const isFirst = pgsRef.current.length > 0 && pgsRef.current[0].id === pgId;
    const state: PgAppState = all[pgId] ?? (isFirst ? DEMO_STATE : EMPTY_STATE);
    setTenants(state.tenants);
    setRooms(state.rooms);
    setPayments(state.payments);
    setNotices(state.notices);
    setActivity(state.activity);
  }

  // ── Persist to localStorage (local mode) ──────────────────────────────────

  const persistLs = useCallback(() => {
    if (isSupabaseEnabled) return;
    const pgId = pgIdRef.current;
    if (!pgId) return;
    const all: Record<string, PgAppState> = (window as any).__pgmLsData ?? {};
    all[pgId] = { tenants, rooms, payments, notices, activity };
    (window as any).__pgmLsData = all;
    try { localStorage.setItem(LS_KEY, JSON.stringify(all)); } catch { /* ignore */ }
  }, [tenants, rooms, payments, notices, activity]);

  useEffect(() => { persistLs(); }, [persistLs]);

  // ── Activity helper ────────────────────────────────────────────────────────

  function pushActivity(type: ActivityItem["type"], message: string) {
    setActivity((prev) => [{ id: `a${Date.now()}`, type, message, time: "Just now" }, ...prev.slice(0, 9)]);
  }

  // ── Tenants ───────────────────────────────────────────────────────────────

  const addTenant = useCallback(async (data: Omit<Tenant, "id" | "avatar">) => {
    const pgId = pgIdRef.current;
    const avatar = data.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const id = `t${Date.now()}`;
    const tenant: Tenant = { ...data, id, avatar };

    const sb = getSb(); if (sb) {
      await sb.from("tenants").insert({
        id, pg_id: pgId, name: data.name, phone: data.phone, email: data.email,
        room_number: data.roomNumber, rent_amount: data.rentAmount, move_in_date: data.moveInDate,
        payment_status: data.paymentStatus, avatar,
        emergency_contact: data.emergencyContact, emergency_phone: data.emergencyPhone,
        id_proof_type: data.idProofType, id_proof_number: data.idProofNumber,
        occupation: data.occupation, rent_due_day: data.rentDueDay,
        security_deposit: data.securityDeposit, advance_paid: data.advancePaid,
        food_preference: data.foodPreference, amenities: data.amenities, notes: data.notes,
      });
      await sb.from("rooms").update({ status: "Occupied", tenant_id: id, tenant_name: data.name })
        .eq("pg_id", pgId).eq("number", data.roomNumber);
    }

    setTenants((prev) => [tenant, ...prev]);
    setRooms((prev) => prev.map((r) =>
      r.number === data.roomNumber ? { ...r, status: "Occupied", tenantId: id, tenantName: data.name } : r
    ));
    pushActivity("tenant", `New tenant ${data.name} moved into Room ${data.roomNumber}`);
  }, []);

  const editTenant = useCallback(async (id: string, data: Partial<Tenant>) => {
    const pgId = pgIdRef.current;
    const sb = getSb(); if (sb) {
      const update: Record<string, unknown> = {};
      if (data.name)          update.name = data.name;
      if (data.phone)         update.phone = data.phone;
      if (data.email)         update.email = data.email;
      if (data.rentAmount)    update.rent_amount = data.rentAmount;
      if (data.paymentStatus) update.payment_status = data.paymentStatus;
      if (data.rentDueDay)    update.rent_due_day = data.rentDueDay;
      if (data.occupation)    update.occupation = data.occupation;
      if (data.notes !== undefined) update.notes = data.notes;
      if (data.amenities)     update.amenities = data.amenities;
      if (data.foodPreference) update.food_preference = data.foodPreference;
      if (data.securityDeposit !== undefined) update.security_deposit = data.securityDeposit;
      await sb.from("tenants").update(update).eq("id", id);
    }
    setTenants((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const updated = { ...t, ...data };
      updated.avatar = updated.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
      return updated;
    }));
  }, []);

  const deleteTenant = useCallback(async (id: string) => {
    const pgId = pgIdRef.current;
    const t = tenants.find((x) => x.id === id);
    const sb = getSb(); if (sb) {
      await sb.from("tenants").delete().eq("id", id);
      if (t) {
        await sb.from("rooms").update({ status: "Vacant", tenant_id: null, tenant_name: null })
          .eq("pg_id", pgId).eq("number", t.roomNumber);
      }
    }
    setTenants((prev) => prev.filter((x) => x.id !== id));
    setRooms((prev) => prev.map((r) =>
      r.tenantId === id ? { ...r, status: "Vacant", tenantId: undefined, tenantName: undefined } : r
    ));
    if (t) pushActivity("tenant", `${t.name} was removed from Room ${t.roomNumber}`);
  }, [tenants]);

  const moveOutTenant = useCallback(async (id: string, data: MoveOutData) => {
    const pgId = pgIdRef.current;
    const t = tenants.find((x) => x.id === id);
    const moveOutUpdate: Partial<Tenant> = {
      tenantStatus: "MovedOut",
      moveOutDate: data.moveOutDate,
      moveOutReason: data.moveOutReason,
      securityRefundStatus: data.securityRefundStatus,
      securityRefundAmount: data.securityRefundAmount,
      moveOutNotes: data.moveOutNotes,
    };
    const sb = getSb(); if (sb) {
      await sb.from("tenants").update({
        tenant_status: "MovedOut",
        move_out_date: data.moveOutDate,
        move_out_reason: data.moveOutReason,
        security_refund_status: data.securityRefundStatus,
        security_refund_amount: data.securityRefundAmount,
        move_out_notes: data.moveOutNotes,
      }).eq("id", id);
      if (t) {
        await sb.from("rooms").update({ status: "Vacant", tenant_id: null, tenant_name: null })
          .eq("pg_id", pgId).eq("number", t.roomNumber);
      }
    }
    setTenants((prev) => prev.map((x) => x.id === id ? { ...x, ...moveOutUpdate } : x));
    setRooms((prev) => prev.map((r) =>
      r.tenantId === id ? { ...r, status: "Vacant", tenantId: undefined, tenantName: undefined } : r
    ));
    if (t) pushActivity("tenant", `${t.name} moved out from Room ${t.roomNumber} on ${data.moveOutDate}`);
  }, [tenants]);

  // ── Rooms ─────────────────────────────────────────────────────────────────

  const addRoom = useCallback(async (data: Omit<Room, "id" | "status">) => {
    const pgId = pgIdRef.current;
    const id = `r${data.number}`;
    const room: Room = { ...data, id, status: "Vacant" };
    const sb = getSb(); if (sb) {
      await sb.from("rooms").insert({
        id, pg_id: pgId, number: data.number, floor: data.floor,
        type: data.type, status: "Vacant", rent_amount: data.rentAmount, amenities: data.amenities,
      });
    }
    setRooms((prev) => [...prev, room].sort((a, b) => a.number.localeCompare(b.number)));
  }, []);

  const editRoom = useCallback(async (id: string, data: Partial<Room>) => {
    const sb = getSb(); if (sb) {
      const update: Record<string, unknown> = {};
      if (data.rentAmount) update.rent_amount = data.rentAmount;
      if (data.amenities)  update.amenities   = data.amenities;
      if (data.type)       update.type        = data.type;
      await sb.from("rooms").update(update).eq("id", id);
    }
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  }, []);

  const markRoomVacant = useCallback(async (id: string) => {
    const sb = getSb(); if (sb) {
      await sb.from("rooms").update({ status: "Vacant", tenant_id: null, tenant_name: null }).eq("id", id);
    }
    setRooms((prev) => prev.map((r) =>
      r.id === id ? { ...r, status: "Vacant", tenantId: undefined, tenantName: undefined } : r
    ));
  }, []);

  // ── Payments ──────────────────────────────────────────────────────────────

  const addPayment = useCallback(async (data: Omit<Payment, "id">) => {
    const pgId = pgIdRef.current;
    const id = `p${Date.now()}`;
    const payment: Payment = { ...data, id };
    const sb = getSb(); if (sb) {
      await sb.from("payments").insert({
        id, pg_id: pgId, tenant_id: data.tenantId, tenant_name: data.tenantName,
        room_number: data.roomNumber, amount: data.amount, due_date: data.dueDate,
        paid_date: data.paidDate ?? null, status: data.status, month: data.month,
      });
      if (data.status === "Paid") {
        await sb.from("tenants").update({ payment_status: "Paid" }).eq("id", data.tenantId);
      }
    }
    setPayments((prev) => [payment, ...prev]);
    if (data.status === "Paid") {
      setTenants((prev) => prev.map((t) => t.id === data.tenantId ? { ...t, paymentStatus: "Paid" } : t));
      pushActivity("payment", `${data.tenantName} paid ₹${data.amount.toLocaleString("en-IN")} for Room ${data.roomNumber}`);
    }
  }, []);

  const markPaymentPaid = useCallback(async (id: string) => {
    const paidDate = new Date().toISOString().split("T")[0];
    const p = payments.find((x) => x.id === id);
    const sb = getSb(); if (sb) {
      await sb.from("payments").update({ status: "Paid", paid_date: paidDate }).eq("id", id);
      if (p) await sb.from("tenants").update({ payment_status: "Paid" }).eq("id", p.tenantId);
    }
    setPayments((prev) => prev.map((x) => x.id === id ? { ...x, status: "Paid", paidDate } : x));
    if (p) {
      setTenants((prev) => prev.map((t) => t.id === p.tenantId ? { ...t, paymentStatus: "Paid" } : t));
      pushActivity("payment", `${p.tenantName} paid ₹${p.amount.toLocaleString("en-IN")} for Room ${p.roomNumber}`);
    }
  }, [payments]);

  // ── Notices ───────────────────────────────────────────────────────────────

  const addNotice = useCallback(async (data: Omit<Notice, "id">) => {
    const pgId = pgIdRef.current;
    const id = `n${Date.now()}`;
    const sb = getSb(); if (sb) {
      await sb.from("notices").insert({
        id, pg_id: pgId, title: data.title, message: data.message,
        recipient: data.recipient, recipient_id: data.recipientId ?? null,
        status: data.status, created_at: data.createdAt, sent_at: data.sentAt ?? null,
      });
    }
    setNotices((prev) => [{ ...data, id }, ...prev]);
    if (data.status === "Sent") pushActivity("notice", `Notice sent: ${data.title}`);
  }, []);

  const sendDraft = useCallback(async (id: string) => {
    const now = new Date().toISOString().split("T")[0];
    const n = notices.find((x) => x.id === id);
    const sb = getSb(); if (sb) {
      await sb.from("notices").update({ status: "Sent", sent_at: now }).eq("id", id);
    }
    setNotices((prev) => prev.map((x) => x.id === id ? { ...x, status: "Sent" as const, sentAt: now } : x));
    if (n) pushActivity("notice", `Notice sent: ${n.title}`);
  }, [notices]);

  const deleteNotice = useCallback(async (id: string) => {
    const sb = getSb(); if (sb) await sb.from("notices").delete().eq("id", id);
    setNotices((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      tenants, rooms, payments, notices, activity, loading,
      addTenant, editTenant, deleteTenant, moveOutTenant,
      addRoom, editRoom, markRoomVacant,
      addPayment, markPaymentPaid,
      addNotice, sendDraft, deleteNotice,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
