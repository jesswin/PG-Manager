"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useOnboarding } from "@/store/OnboardingContext";
import {
  tenants as seedTenants,
  rooms as seedRooms,
  payments as seedPayments,
  notices as seedNotices,
  activityFeed as seedActivity,
  Tenant, Room, Payment, Notice, PaymentStatus,
} from "@/data/mock";

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

interface AppContextType extends PgAppState {
  addTenant: (data: Omit<Tenant, "id" | "avatar">) => void;
  editTenant: (id: string, data: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  addRoom: (data: Omit<Room, "id" | "status">) => void;
  editRoom: (id: string, data: Partial<Room>) => void;
  markRoomVacant: (id: string) => void;
  addPayment: (data: Omit<Payment, "id">) => void;
  markPaymentPaid: (id: string) => void;
  addNotice: (data: Omit<Notice, "id">) => void;
  sendDraft: (id: string) => void;
  deleteNotice: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);
const STORAGE_KEY = "pgm_pg_data";

const EMPTY_STATE: PgAppState = {
  tenants: [], rooms: [], payments: [], notices: [], activity: [],
};

const DEMO_STATE: PgAppState = {
  tenants: seedTenants,
  rooms: seedRooms,
  payments: seedPayments,
  notices: seedNotices,
  activity: seedActivity.map((a) => ({
    id: a.id,
    type: a.type as ActivityItem["type"],
    message: a.message,
    time: a.time,
  })),
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { activePgId, pgs } = useOnboarding();
  const [allData, setAllData] = useState<Record<string, PgAppState>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Refs so mutation callbacks always see latest values without re-creating
  const activePgIdRef = useRef(activePgId);
  const pgsRef = useRef(pgs);
  useEffect(() => { activePgIdRef.current = activePgId; }, [activePgId]);
  useEffect(() => { pgsRef.current = pgs; }, [pgs]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && typeof data === "object") setAllData(data);
      }
    } catch { /* ignore */ }
    setDataLoaded(true);
  }, []);

  useEffect(() => {
    if (!dataLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
    } catch { /* ignore */ }
  }, [allData, dataLoaded]);

  // Derive current PG's data: first PG gets demo data, subsequent ones start empty
  const pgData: PgAppState = (() => {
    if (!activePgId) return DEMO_STATE;
    if (allData[activePgId]) return allData[activePgId];
    const isFirstPg = pgs.length > 0 && pgs[0].id === activePgId;
    return isFirstPg ? DEMO_STATE : EMPTY_STATE;
  })();

  // Mutate active PG's state slice; reads activePgId via ref to avoid stale closures
  const setCurrentData = useCallback((updater: (prev: PgAppState) => PgAppState) => {
    setAllData((prev) => {
      const pgId = activePgIdRef.current;
      if (!pgId) return prev;
      const existing = prev[pgId];
      const isFirstPg = pgsRef.current.length > 0 && pgsRef.current[0].id === pgId;
      const current = existing ?? (isFirstPg ? DEMO_STATE : EMPTY_STATE);
      return { ...prev, [pgId]: updater(current) };
    });
  }, []);

  // ── Tenants ──────────────────────────────────────────────
  const addTenant = useCallback((data: Omit<Tenant, "id" | "avatar">) => {
    const avatar = data.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const tenant: Tenant = { ...data, id: `t${Date.now()}`, avatar };
    setCurrentData((prev) => ({
      ...prev,
      tenants: [tenant, ...prev.tenants],
      rooms: prev.rooms.map((r) =>
        r.number === data.roomNumber
          ? { ...r, status: "Occupied" as const, tenantId: tenant.id, tenantName: data.name }
          : r
      ),
      activity: [
        { id: `a${Date.now()}`, type: "tenant" as const, message: `New tenant ${data.name} moved into Room ${data.roomNumber}`, time: "Just now" },
        ...prev.activity.slice(0, 9),
      ],
    }));
  }, [setCurrentData]);

  const editTenant = useCallback((id: string, data: Partial<Tenant>) => {
    setCurrentData((prev) => ({
      ...prev,
      tenants: prev.tenants.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...data };
        updated.avatar = updated.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        return updated;
      }),
    }));
  }, [setCurrentData]);

  const deleteTenant = useCallback((id: string) => {
    setCurrentData((prev) => {
      const t = prev.tenants.find((x) => x.id === id);
      return {
        ...prev,
        tenants: prev.tenants.filter((x) => x.id !== id),
        rooms: prev.rooms.map((r) =>
          r.tenantId === id ? { ...r, status: "Vacant" as const, tenantId: undefined, tenantName: undefined } : r
        ),
        activity: t
          ? [{ id: `a${Date.now()}`, type: "tenant" as const, message: `${t.name} was removed from Room ${t.roomNumber}`, time: "Just now" }, ...prev.activity.slice(0, 9)]
          : prev.activity,
      };
    });
  }, [setCurrentData]);

  // ── Rooms ────────────────────────────────────────────────
  const addRoom = useCallback((data: Omit<Room, "id" | "status">) => {
    const room: Room = { ...data, id: `r${data.number}`, status: "Vacant" };
    setCurrentData((prev) => ({
      ...prev,
      rooms: [...prev.rooms, room].sort((a, b) => a.number.localeCompare(b.number)),
    }));
  }, [setCurrentData]);

  const editRoom = useCallback((id: string, data: Partial<Room>) => {
    setCurrentData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) => (r.id === id ? { ...r, ...data } : r)),
    }));
  }, [setCurrentData]);

  const markRoomVacant = useCallback((id: string) => {
    setCurrentData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r) =>
        r.id === id ? { ...r, status: "Vacant" as const, tenantId: undefined, tenantName: undefined } : r
      ),
    }));
  }, [setCurrentData]);

  // ── Payments ─────────────────────────────────────────────
  const addPayment = useCallback((data: Omit<Payment, "id">) => {
    const payment: Payment = { ...data, id: `p${Date.now()}` };
    setCurrentData((prev) => ({
      ...prev,
      payments: [payment, ...prev.payments],
      tenants: data.status === "Paid"
        ? prev.tenants.map((t) => (t.id === data.tenantId ? { ...t, paymentStatus: "Paid" as PaymentStatus } : t))
        : prev.tenants,
      activity: data.status === "Paid"
        ? [{ id: `a${Date.now()}`, type: "payment" as const, message: `${data.tenantName} paid ₹${data.amount.toLocaleString("en-IN")} for Room ${data.roomNumber}`, time: "Just now" }, ...prev.activity.slice(0, 9)]
        : prev.activity,
    }));
  }, [setCurrentData]);

  const markPaymentPaid = useCallback((id: string) => {
    setCurrentData((prev) => {
      const p = prev.payments.find((x) => x.id === id);
      return {
        ...prev,
        payments: prev.payments.map((x) =>
          x.id === id ? { ...x, status: "Paid" as PaymentStatus, paidDate: new Date().toISOString().split("T")[0] } : x
        ),
        tenants: p
          ? prev.tenants.map((t) => (t.id === p.tenantId ? { ...t, paymentStatus: "Paid" as PaymentStatus } : t))
          : prev.tenants,
        activity: p
          ? [{ id: `a${Date.now()}`, type: "payment" as const, message: `${p.tenantName} paid ₹${p.amount.toLocaleString("en-IN")} for Room ${p.roomNumber}`, time: "Just now" }, ...prev.activity.slice(0, 9)]
          : prev.activity,
      };
    });
  }, [setCurrentData]);

  // ── Notices ──────────────────────────────────────────────
  const addNotice = useCallback((data: Omit<Notice, "id">) => {
    setCurrentData((prev) => ({
      ...prev,
      notices: [{ ...data, id: `n${Date.now()}` }, ...prev.notices],
      activity: data.status === "Sent"
        ? [{ id: `a${Date.now()}`, type: "notice" as const, message: `Notice sent: ${data.title}`, time: "Just now" }, ...prev.activity.slice(0, 9)]
        : prev.activity,
    }));
  }, [setCurrentData]);

  const sendDraft = useCallback((id: string) => {
    const now = new Date().toISOString().split("T")[0];
    setCurrentData((prev) => {
      const n = prev.notices.find((x) => x.id === id);
      return {
        ...prev,
        notices: prev.notices.map((x) => (x.id === id ? { ...x, status: "Sent" as const, sentAt: now } : x)),
        activity: n
          ? [{ id: `a${Date.now()}`, type: "notice" as const, message: `Notice sent: ${n.title}`, time: "Just now" }, ...prev.activity.slice(0, 9)]
          : prev.activity,
      };
    });
  }, [setCurrentData]);

  const deleteNotice = useCallback((id: string) => {
    setCurrentData((prev) => ({
      ...prev,
      notices: prev.notices.filter((x) => x.id !== id),
    }));
  }, [setCurrentData]);

  return (
    <AppContext.Provider value={{
      ...pgData,
      addTenant, editTenant, deleteTenant,
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
