"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  tenants as seedTenants,
  rooms as seedRooms,
  payments as seedPayments,
  notices as seedNotices,
  activityFeed as seedActivity,
  Tenant, Room, Payment, Notice, PaymentStatus, RoomType,
} from "@/data/mock";

interface ActivityItem {
  id: string;
  type: "payment" | "notice" | "tenant";
  message: string;
  time: string;
}

interface AppState {
  tenants: Tenant[];
  rooms: Room[];
  payments: Payment[];
  notices: Notice[];
  activity: ActivityItem[];
}

interface AppContextType extends AppState {
  // Tenants
  addTenant: (data: Omit<Tenant, "id" | "avatar">) => void;
  editTenant: (id: string, data: Partial<Tenant>) => void;
  deleteTenant: (id: string) => void;
  // Rooms
  addRoom: (data: Omit<Room, "id" | "status">) => void;
  editRoom: (id: string, data: Partial<Room>) => void;
  markRoomVacant: (id: string) => void;
  // Payments
  addPayment: (data: Omit<Payment, "id">) => void;
  markPaymentPaid: (id: string) => void;
  // Notices
  addNotice: (data: Omit<Notice, "id">) => void;
  sendDraft: (id: string) => void;
  deleteNotice: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tenants, setTenants] = useState<Tenant[]>(seedTenants);
  const [rooms, setRooms] = useState<Room[]>(seedRooms);
  const [payments, setPayments] = useState<Payment[]>(seedPayments);
  const [notices, setNotices] = useState<Notice[]>(seedNotices);
  const [activity, setActivity] = useState<ActivityItem[]>(
    seedActivity.map((a) => ({ id: a.id, type: a.type as ActivityItem["type"], message: a.message, time: a.time }))
  );

  const pushActivity = useCallback((type: ActivityItem["type"], message: string) => {
    setActivity((prev) => [
      { id: `a${Date.now()}`, type, message, time: "Just now" },
      ...prev.slice(0, 9),
    ]);
  }, []);

  // ── Tenants ──────────────────────────────────────────────
  const addTenant = useCallback((data: Omit<Tenant, "id" | "avatar">) => {
    const avatar = data.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const tenant: Tenant = { ...data, id: `t${Date.now()}`, avatar };
    setTenants((prev) => [tenant, ...prev]);
    // mark room occupied
    setRooms((prev) =>
      prev.map((r) =>
        r.number === data.roomNumber
          ? { ...r, status: "Occupied", tenantId: tenant.id, tenantName: data.name }
          : r
      )
    );
    pushActivity("tenant", `New tenant ${data.name} moved into Room ${data.roomNumber}`);
  }, [pushActivity]);

  const editTenant = useCallback((id: string, data: Partial<Tenant>) => {
    setTenants((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...data };
        updated.avatar = updated.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
        return updated;
      })
    );
  }, []);

  const deleteTenant = useCallback((id: string) => {
    const t = tenants.find((x) => x.id === id);
    setTenants((prev) => prev.filter((x) => x.id !== id));
    setRooms((prev) =>
      prev.map((r) =>
        r.tenantId === id ? { ...r, status: "Vacant", tenantId: undefined, tenantName: undefined } : r
      )
    );
    if (t) pushActivity("tenant", `${t.name} was removed from Room ${t.roomNumber}`);
  }, [tenants, pushActivity]);

  // ── Rooms ────────────────────────────────────────────────
  const addRoom = useCallback((data: Omit<Room, "id" | "status">) => {
    const room: Room = { ...data, id: `r${data.number}`, status: "Vacant" };
    setRooms((prev) => [...prev, room].sort((a, b) => a.number.localeCompare(b.number)));
  }, []);

  const editRoom = useCallback((id: string, data: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
  }, []);

  const markRoomVacant = useCallback((id: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Vacant", tenantId: undefined, tenantName: undefined } : r
      )
    );
  }, []);

  // ── Payments ─────────────────────────────────────────────
  const addPayment = useCallback((data: Omit<Payment, "id">) => {
    const payment: Payment = { ...data, id: `p${Date.now()}` };
    setPayments((prev) => [payment, ...prev]);
    if (data.status === "Paid") {
      pushActivity("payment", `${data.tenantName} paid ₹${data.amount.toLocaleString("en-IN")} for Room ${data.roomNumber}`);
      // update tenant payment status
      setTenants((prev) =>
        prev.map((t) => (t.id === data.tenantId ? { ...t, paymentStatus: "Paid" } : t))
      );
    }
  }, [pushActivity]);

  const markPaymentPaid = useCallback((id: string) => {
    const p = payments.find((x) => x.id === id);
    setPayments((prev) =>
      prev.map((x) =>
        x.id === id ? { ...x, status: "Paid", paidDate: new Date().toISOString().split("T")[0] } : x
      )
    );
    if (p) {
      pushActivity("payment", `${p.tenantName} paid ₹${p.amount.toLocaleString("en-IN")} for Room ${p.roomNumber}`);
      setTenants((prev) =>
        prev.map((t) => (t.id === p.tenantId ? { ...t, paymentStatus: "Paid" } : t))
      );
    }
  }, [payments, pushActivity]);

  // ── Notices ──────────────────────────────────────────────
  const addNotice = useCallback((data: Omit<Notice, "id">) => {
    setNotices((prev) => [{ ...data, id: `n${Date.now()}` }, ...prev]);
    if (data.status === "Sent") {
      pushActivity("notice", `Notice sent: ${data.title}`);
    }
  }, [pushActivity]);

  const sendDraft = useCallback((id: string) => {
    const n = notices.find((x) => x.id === id);
    const now = new Date().toISOString().split("T")[0];
    setNotices((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "Sent", sentAt: now } : x))
    );
    if (n) pushActivity("notice", `Notice sent: ${n.title}`);
  }, [notices, pushActivity]);

  const deleteNotice = useCallback((id: string) => {
    setNotices((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      tenants, rooms, payments, notices, activity,
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
